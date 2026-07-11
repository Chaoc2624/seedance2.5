import { useEffect } from 'react';

export function useScrollLock(lock: boolean) {
  useEffect(() => {
    if (!lock) return;

    const body = document.body;
    const documentElement = document.documentElement;

    const originalOverflow = body.style.overflow;
    const originalPaddingRight = body.style.paddingRight;

    // Calculate scrollbar width
    const scrollBarWidth = window.innerWidth - documentElement.clientWidth;

    body.style.overflow = 'hidden';
    body.style.paddingRight = `${scrollBarWidth}px`;
    body.setAttribute('data-scroll-locked', '1');
    documentElement.style.setProperty(
      '--removed-body-scroll-bar-size',
      `${scrollBarWidth}px`
    );

    return () => {
      body.style.overflow = originalOverflow;
      body.style.paddingRight = originalPaddingRight;
      body.removeAttribute('data-scroll-locked');
      documentElement.style.removeProperty('--removed-body-scroll-bar-size');
    };
  }, [lock]);
}
