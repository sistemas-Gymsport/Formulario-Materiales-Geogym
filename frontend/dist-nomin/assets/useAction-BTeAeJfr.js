import { r as reactExports } from "./react-0QgR9_yw.js";
import { g as useToast } from "./index-DLrGS1ff.js";
const useAction = () => {
  const toast = useToast();
  const [busy, setBusy] = reactExports.useState(null);
  const run = reactExports.useCallback(
    async (key, task, successMessage) => {
      setBusy(key);
      try {
        const result = await task();
        if (successMessage) toast.success(successMessage);
        return result;
      } catch (error) {
        toast.error(error.message);
        return void 0;
      } finally {
        setBusy(null);
      }
    },
    [toast]
  );
  return { run, busy };
};
export {
  useAction as u
};
