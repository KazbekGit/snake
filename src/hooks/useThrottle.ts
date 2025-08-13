import { useRef, useCallback } from "react";

export function useThrottle<T extends (...args: any[]) => any>(
  fn: T,
  waitMs: number
) {
  const lastCalledAtRef = useRef<number>(0);
  const pendingRef = useRef<ReturnType<T> | undefined>(undefined);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCalledAtRef.current >= waitMs) {
        lastCalledAtRef.current = now;
        pendingRef.current = fn(...args);
      }
      return pendingRef.current as ReturnType<T>;
    },
    [fn, waitMs]
  );
}
