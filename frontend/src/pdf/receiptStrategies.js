import { createReceiptRunner } from './receiptRunner.js';
import { receiptFilename } from './receiptName.js';

const toPlainRequest = ({ folio, requesterName, branchName, createdAt, itemCount, categories, customMaterials }) => ({
  folio,
  requesterName,
  branchName,
  createdAt,
  itemCount,
  categories,
  customMaterials
});

const workerStrategy = {
  name: 'navegador',
  timeoutMs: 12000,
  available: () => typeof Worker !== 'undefined',
  start: (request, timeZone) => {
    const worker = new Worker(new URL('./receipt.worker.js', import.meta.url), { type: 'module' });
    const promise = new Promise((resolve, reject) => {
      worker.onmessage = ({ data }) => {
        worker.terminate();
        if (data.ok) resolve({ blob: data.blob, filename: data.filename });
        else reject(new Error(data.message));
      };
      worker.onerror = (event) => {
        worker.terminate();
        reject(new Error(event.message || 'El generador del navegador no pudo iniciar'));
      };
      worker.postMessage({ request: toPlainRequest(request), timeZone });
    });
    return { promise, cancel: () => worker.terminate() };
  }
};

const serverStrategy = {
  name: 'servidor',
  available: () => typeof fetch !== 'undefined',
  start: (request) => {
    const controller = new AbortController();
    const promise = (async () => {
      if (!request.receiptKey) throw new Error('Falta la clave del comprobante');
      const response = await fetch('/api/public/requests/receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/pdf' },
        body: JSON.stringify({ folio: request.folio, key: request.receiptKey }),
        credentials: 'same-origin',
        signal: controller.signal
      });
      if (!response.ok) throw new Error(`El servidor respondió ${response.status}`);
      return { blob: await response.blob(), filename: receiptFilename(request) };
    })();
    return { promise, cancel: () => controller.abort() };
  }
};

const log = (stage, strategy, detail) => {
  const message = `[GEO GYM PDF] ${stage} · ${strategy}${detail !== undefined ? ` · ${detail}` : ''}`;
  if (stage === 'fail') console.warn(message);
  else console.info(message);
};

export const generateReceipt = createReceiptRunner({ strategies: [workerStrategy, serverStrategy], log });
