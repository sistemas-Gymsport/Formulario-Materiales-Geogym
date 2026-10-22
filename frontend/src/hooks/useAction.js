import { useCallback, useState } from 'react';
import { useToast } from '../contexts/ToastContext.jsx';

export const useAction = () => {
  const toast = useToast();
  const [busy, setBusy] = useState(null);

  const run = useCallback(
    async (key, task, successMessage) => {
      setBusy(key);
      try {
        const result = await task();
        if (successMessage) toast.success(successMessage);
        return result;
      } catch (error) {
        toast.error(error.message);
        return undefined;
      } finally {
        setBusy(null);
      }
    },
    [toast]
  );

  return { run, busy };
};
