'use client';

import { useEffect, useRef, useState } from 'react';

import { type TOCItem } from '@/core/docs/toc';

import { cn } from '@/lib/utils';

interface TableOfContentsProps {
  toc: TOCItem[];
  className?: string;
}

export function TableOfContents({ toc, className }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');
  const observerRef = useRef<IntersectionObserver | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const clickLockRef = useRef<boolean>(false);
  const [thumbStyle, setThumbStyle] = useState({
    top: 0,
    height: 0,
    opacity: 0,
  });

  // 1. Observe headings to set activeId
  useEffect(() => {
    // Escape IDs to handle potential querySelector errors
    const headingElements = toc
      .map((item) => {
        try {
          return document.querySelector(item.url);
        } catch {
          return null;
        }
      })
      .filter(Boolean) as Element[];

    if (headingElements.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (clickLockRef.current) return;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(`#${entry.target.id}`);
          }
        }
      },
      { rootMargin: '-10% 0px -80% 0px', threshold: 0.1 }
    );

    headingElements.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, [toc]);

  // 2. Calculate Thumb indicator position dynamically
  useEffect(() => {
    if (!containerRef.current || !activeId) {
      setThumbStyle((s) => ({ ...s, opacity: 0 }));
      return;
    }

    try {
      // Find the active anchor link inside the TOC container
      const activeLink = containerRef.current.querySelector(
        `a[href="${activeId}"]`
      ) as HTMLElement;

      if (activeLink && activeLink.parentElement) {
        setThumbStyle({
          top: activeLink.offsetTop,
          height: activeLink.offsetHeight,
          opacity: 1,
        });
      } else {
        setThumbStyle((s) => ({ ...s, opacity: 0 }));
      }
    } catch {
      setThumbStyle((s) => ({ ...s, opacity: 0 }));
    }
  }, [activeId, toc]);

  if (toc.length === 0) return null;

  return (
    <div
      className={cn(
        'relative ms-px min-h-0 overflow-auto [mask-image:linear-gradient(to_bottom,transparent,white_16px,white_calc(100%-16px),transparent)] py-3 text-sm [scrollbar-width:none]',
        className
      )}
    >
      {/* Active TocThumb indicator */}
      <div
        className="absolute left-0 w-px bg-primary transition-all duration-300 ease-in-out"
        style={{
          top: `${thumbStyle.top}px`,
          height: `${thumbStyle.height}px`,
          opacity: thumbStyle.opacity,
        }}
      />

      <div
        ref={containerRef}
        className="flex flex-col border-s border-foreground/10"
      >
        {toc.map((item) => {
          const isActive = activeId === item.url;
          return (
            <a
              key={item.url}
              href={item.url}
              data-active={isActive}
              onClick={() => {
                setActiveId(item.url);
                clickLockRef.current = true;
                setTimeout(() => {
                  clickLockRef.current = false;
                }, 800);
              }}
              className={cn(
                'block py-1.5 text-sm [overflow-wrap:anywhere] text-muted-foreground transition-colors hover:text-foreground data-[active=true]:font-medium data-[active=true]:text-primary',
                item.depth <= 2 && 'ps-3',
                item.depth === 3 && 'ps-6',
                item.depth >= 4 && 'ps-8'
              )}
            >
              {item.title}
            </a>
          );
        })}
      </div>
    </div>
  );
}
