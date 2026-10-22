import { useCallback, useRef, useState } from 'react';
import { canShareFile, downloadBlob, shareFile, toPdfFile } from '../utils/files.js';

const initial = { status: 'idle', file: null, strategy: null };

export const useReceipt = () => {
  const [state, setState] = useState(initial);
  const busy = useRef(false);

  const generate = useCallback(async (request, timeZone) => {
    if (busy.current || !request) return;
    busy.current = true;
    setState({ ...initial, status: 'generating' });
    try {
      const { generateReceipt } = await import('../pdf/receiptStrategies.js');
      const { blob, filename, strategy } = await generateReceipt(request, timeZone);
      const file = toPdfFile(blob, filename);
      setState({ status: 'ready', file, strategy });
      downloadBlob(file, filename);
    } catch (error) {
      console.error('[GEO GYM PDF] sin reporte', error?.attempts ?? error);
      setState({ ...initial, status: 'error' });
    } finally {
      busy.current = false;
    }
  }, []);

  const download = useCallback(() => {
    if (state.file) downloadBlob(state.file, state.file.name);
  }, [state.file]);

  const share = useCallback(
    () => shareFile(state.file, { title: state.file.name, text: 'Reporte de solicitud de material · GEO GYM' }),
    [state.file]
  );

  const reset = useCallback(() => setState(initial), []);

  return { ...state, canShare: canShareFile(state.file), generate, download, share, reset };
};
