import { useEffect, useRef } from 'react';

export const useInterval = (callback, delay) => {
  const saved = useRef(callback);
  saved.current = callback;
  useEffect(() => {
    if (delay == null) return undefined;
    const tick = () => {
      if (document.visibilityState === 'visible') saved.current();
    };
    const id = setInterval(tick, delay);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [delay]);
};
