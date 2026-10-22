export const RECEIPT_TIMEOUT_MS = 20000;

export class ReceiptTimeoutError extends Error {
  constructor(name, ms) {
    super(`La generación «${name}» superó ${Math.round(ms / 1000)} s`);
    this.name = 'ReceiptTimeoutError';
  }
}

export class ReceiptFailedError extends Error {
  constructor(attempts) {
    super('No fue posible generar el reporte PDF');
    this.name = 'ReceiptFailedError';
    this.attempts = attempts;
  }
}

export const withTimeout = (handle, ms, name) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      handle.cancel?.();
      reject(new ReceiptTimeoutError(name, ms));
    }, ms);
    handle.promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });

export const createReceiptRunner = ({ strategies, timeoutMs = RECEIPT_TIMEOUT_MS, now = () => Date.now(), log = () => {} }) =>
  async (request, timeZone) => {
    const deadline = now() + timeoutMs;
    const attempts = [];
    for (const strategy of strategies) {
      if (strategy.available && !strategy.available()) {
        attempts.push({ strategy: strategy.name, error: 'no disponible' });
        log('skip', strategy.name);
        continue;
      }
      const remaining = deadline - now();
      if (remaining <= 0) break;
      const budget = Math.min(strategy.timeoutMs ?? remaining, remaining);
      const started = now();
      log('start', strategy.name, budget);
      try {
        const handle = strategy.start(request, timeZone);
        const result = await withTimeout(handle, budget, strategy.name);
        if (!(result?.blob instanceof Blob) || result.blob.size === 0) throw new Error('El PDF generado está vacío');
        log('done', strategy.name, now() - started);
        return { ...result, strategy: strategy.name };
      } catch (error) {
        attempts.push({ strategy: strategy.name, error: error?.message ?? String(error) });
        log('fail', strategy.name, error?.message ?? String(error));
      }
    }
    throw new ReceiptFailedError(attempts);
  };
