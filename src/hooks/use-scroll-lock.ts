import { useEffect } from 'react';

export function useScrollLock(lock: boolean) {
  useEffect(() => {
    if (!lock) return;

    const body = document.body;

    const originalOverflow = body.style.overflow;

    body.style.overflow = 'hidden';

    return () => {
      body.style.overflow = originalOverflow;
    };
  }, [lock]);
}
