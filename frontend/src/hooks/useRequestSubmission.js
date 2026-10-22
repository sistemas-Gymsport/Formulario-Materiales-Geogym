import { useCallback, useRef, useState } from 'react';
import { publicApi } from '../services/publicApi.js';

const MESSAGES = {
  MATERIALS_UNAVAILABLE: 'Algunos materiales ya no están disponibles y se quitaron de tu selección. Revisa y vuelve a confirmar.',
  NETWORK: 'No fue posible conectar con el servidor. Tu solicitud no se ha registrado; vuelve a intentarlo.',
  RATE_LIMITED: 'Has realizado demasiados envíos. Espera unos minutos e inténtalo de nuevo.'
};

export const useRequestSubmission = ({ onClosed, onUnavailable }) => {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const keyRef = useRef(null);
  const inFlight = useRef(false);

  const prepare = useCallback(() => {
    keyRef.current = crypto.randomUUID();
    setError(null);
    setStatus('idle');
  }, []);

  const submit = useCallback(
    async (payload) => {
      if (inFlight.current) return;
      inFlight.current = true;
      keyRef.current ??= crypto.randomUUID();
      setStatus('submitting');
      setError(null);
      try {
        const key = keyRef.current;
        const response = await publicApi.submit(payload, key);
        keyRef.current = null;
        setResult({ ...response.request, receiptKey: key });
        setStatus('success');
      } catch (err) {
        setStatus('error');
        if (err.code === 'FORM_CLOSED') {
          onClosed(err.details?.availability);
          return;
        }
        if (err.code === 'MATERIALS_UNAVAILABLE') {
          keyRef.current = crypto.randomUUID();
          onUnavailable(err.details?.unavailableIds ?? []);
        }
        if (err.code === 'IDEMPOTENCY_MISMATCH' || err.status === 400 || err.status === 422) keyRef.current = crypto.randomUUID();
        setError(MESSAGES[err.code] ?? err.message);
      } finally {
        inFlight.current = false;
      }
    },
    [onClosed, onUnavailable]
  );

  const reset = useCallback(() => {
    keyRef.current = null;
    setResult(null);
    setError(null);
    setStatus('idle');
  }, []);

  return { status, error, result, submit, prepare, reset, submitting: status === 'submitting' };
};
