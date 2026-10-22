import { e as api } from "./index-DLrGS1ff.js";
import { r as reactExports } from "./react-0QgR9_yw.js";
const publicApi = {
  config: () => api.get("/public/config"),
  availability: () => api.get("/public/form-availability"),
  submit: (body, idempotencyKey) => api.post("/public/requests", body, { headers: { "Idempotency-Key": idempotencyKey } })
};
const useInterval = (callback, delay) => {
  const saved = reactExports.useRef(callback);
  saved.current = callback;
  reactExports.useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "visible") saved.current();
    };
    const id = setInterval(tick, delay);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [delay]);
};
export {
  publicApi as p,
  useInterval as u
};
