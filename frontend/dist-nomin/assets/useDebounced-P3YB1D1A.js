import { r as reactExports } from "./react-0QgR9_yw.js";
const useDebounced = (value, delay = 350) => {
  const [debounced, setDebounced] = reactExports.useState(value);
  reactExports.useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
};
export {
  useDebounced as u
};
