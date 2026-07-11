import ImageOff from 'lucide-react/dist/esm/icons/image-off';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

export function LazyImage({
  src,
  alt,
  className,
  fallbackClassName,
  width,
  height,
  placeholderSrc: _placeholderSrc,
  title,
  priority,
  sizes,
}: {
  src: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  width?: number;
  height?: number;
  placeholderSrc?: string;
  title?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const [errored, setErrored] = useState(false);

  // Reset the error state when the source changes so a retry / new URL can load.
  useEffect(() => {
    setErrored(false);
  }, [src]);

  if (errored) {
    // Graceful "broken image" placeholder. We keep the alt text as an
    // aria-label (not visible text) so screen readers and crawlers still get
    // it, instead of the browser dumping the raw alt string on screen.
    return (
      <div
        role="img"
        aria-label={alt}
        title={title ?? alt}
        className={cn(
          'bg-white/[0.04] text-zinc-600',
          // Inherit sizing from the image classes, then force flex-center LAST
          // so it overrides any `block` / `object-*` utilities the caller
          // passed for the <img> (otherwise the icon sticks to a corner).
          className,
          fallbackClassName,
          'flex min-h-24 min-w-24 items-center justify-center'
        )}
      >
        <ImageOff className="size-8" strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      title={title}
      width={width}
      height={height}
      className={className}
      sizes={sizes}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setErrored(true)}
    />
  );
}
