import { createReceipt } from './createReceipt.jsx';

self.onmessage = async ({ data }) => {
  try {
    const { blob, filename } = await createReceipt(data.request, data.timeZone);
    self.postMessage({ ok: true, blob, filename });
  } catch (error) {
    self.postMessage({ ok: false, message: error?.message ?? String(error) });
  }
};
