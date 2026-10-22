import { r as reactExports } from "./react-0QgR9_yw.js";
const useResource = (fetcher, deps = [], { enabled = true } = {}) => {
  const [state, setState] = reactExports.useState({ data: null, error: null, loading: enabled });
  const fetcherRef = reactExports.useRef(fetcher);
  fetcherRef.current = fetcher;
  const requestId = reactExports.useRef(0);
  const load = reactExports.useCallback(async ({ silent = false } = {}) => {
    const id = ++requestId.current;
    if (!silent) setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fetcherRef.current();
      if (id === requestId.current) setState({ data, error: null, loading: false });
      return data;
    } catch (error) {
      if (id === requestId.current) setState((s) => ({ ...s, error, loading: false }));
      return null;
    }
  }, []);
  reactExports.useEffect(() => {
    if (enabled) load();
  }, [enabled, load, ...deps]);
  const setData = reactExports.useCallback((updater) => setState((s) => ({ ...s, data: typeof updater === "function" ? updater(s.data) : updater })), []);
  return { ...state, reload: load, setData };
};
export {
  useResource as u
};
