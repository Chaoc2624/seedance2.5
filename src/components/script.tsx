import { useEffect, useRef } from 'react';

/**
 * Replacement for next/script.
 * Supports 'afterInteractive' strategy via useEffect.
 * Accepts arbitrary HTML attributes (data-*, async, defer, etc.)
 */
export default function Script({
  id,
  src,
  strategy: _strategy,
  dangerouslySetInnerHTML,
  ...rest
}: {
  id?: string;
  src?: string;
  strategy?: 'afterInteractive' | 'lazyOnload' | 'beforeInteractive';
  dangerouslySetInnerHTML?: { __html: string };
  [key: string]: any;
}) {
  const injected = useRef(false);

  useEffect(() => {
    if (injected.current) return;
    injected.current = true;

    const script = document.createElement('script');
    if (id) script.id = id;
    if (src) {
      script.src = src;
      script.async = true;
    }
    if (dangerouslySetInnerHTML?.__html) {
      script.textContent = dangerouslySetInnerHTML.__html;
    }
    // Apply extra attributes (data-*, async, defer, etc.)
    Object.entries(rest).forEach(([key, value]) => {
      if (key === 'strategy') return;
      script.setAttribute(key, String(value));
    });
    document.head.appendChild(script);
  }, [id, src, dangerouslySetInnerHTML]);

  return null;
}
