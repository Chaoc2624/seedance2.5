import { useEffect, useState } from 'react';

declare const __SHIPONCE_SOURCE_ROOT__: string;

type ReactFiber = {
  _debugOwner?: ReactFiber | null;
  _debugStack?: { stack?: string };
  return?: ReactFiber | null;
};

type SourceLocation = {
  column: string;
  line: string;
  path: string;
};

const ignoredTargets = [
  '#twitter-assistant-root',
  '.ai-assistant-menu-container',
];

function findReactFiber(element: Element): ReactFiber | null {
  const key = Object.keys(element).find((item) =>
    item.startsWith('__reactFiber$')
  );

  return key
    ? ((element as unknown as Record<string, ReactFiber>)[key] ?? null)
    : null;
}

function normalizeSourceUrl(sourceUrl: string): string | null {
  try {
    const parsed = new URL(sourceUrl);
    const decodedPath = decodeURIComponent(parsed.pathname).replace(/^\/+/, '');
    const srcIndex = decodedPath.indexOf('src/');

    return srcIndex >= 0 ? decodedPath.slice(srcIndex) : null;
  } catch {
    return null;
  }
}

function parseSourceFromStack(stack?: string): SourceLocation | null {
  if (!stack) return null;

  for (const line of stack.split('\n')) {
    const match = /(https?:\/\/[^\s)]+\/src\/[^\s)]+):(\d+):(\d+)/.exec(
      line.trim()
    );
    if (!match) continue;

    const path = normalizeSourceUrl(match[1]);
    if (path) {
      return {
        column: match[3],
        line: match[2],
        path,
      };
    }
  }

  return null;
}

function findSourceLocation(element: Element): SourceLocation | null {
  let fiber = findReactFiber(element);

  while (fiber) {
    const source =
      parseSourceFromStack(fiber._debugStack?.stack) ??
      parseSourceFromStack(fiber._debugOwner?._debugStack?.stack);

    if (source) return source;

    fiber = fiber.return ?? fiber._debugOwner ?? null;
  }

  return null;
}

function getTargetElement(event: MouseEvent) {
  const target = event.target;
  if (!(target instanceof Element)) return null;

  if (ignoredTargets.some((selector) => target.closest(selector))) {
    return document.elementFromPoint(event.clientX, event.clientY);
  }

  return target;
}

function openInCursor(source: SourceLocation) {
  const path = `${__SHIPONCE_SOURCE_ROOT__}/${source.path}:${source.line}:${source.column}`;
  window.location.assign(`cursor://file${path}`);
}

export function ClickToComponentDevtools() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!import.meta.env.DEV || !mounted) {
    return null;
  }

  return <ClickToReact19Source />;
}

function ClickToReact19Source() {
  useEffect(() => {
    function clearTarget() {
      delete document.body.dataset.clickToComponent;
      document
        .querySelector('[data-click-to-component-target]')
        ?.removeAttribute('data-click-to-component-target');
    }

    function setTarget(target: Element | null) {
      document
        .querySelector('[data-click-to-component-target]')
        ?.removeAttribute('data-click-to-component-target');

      if (target) {
        document.body.dataset.clickToComponent = 'HOVER';
        target.setAttribute('data-click-to-component-target', 'HOVER');
      }
    }

    function handleMouseMove(event: MouseEvent) {
      if (!event.altKey) {
        clearTarget();
        return;
      }

      const target = getTargetElement(event);
      setTarget(target);
    }

    function handleClick(event: MouseEvent) {
      if (!event.altKey) return;

      const target = getTargetElement(event);
      const source = target ? findSourceLocation(target) : null;

      event.preventDefault();
      event.stopPropagation();
      clearTarget();

      if (source) {
        openInCursor(source);
        return;
      }

      console.warn('Could not find React source location for element', target);
    }

    function handleKeyUp(event: KeyboardEvent) {
      if (!event.altKey) clearTarget();
    }

    window.addEventListener('mousemove', handleMouseMove, true);
    window.addEventListener('click', handleClick, true);
    window.addEventListener('keyup', handleKeyUp, true);
    window.addEventListener('blur', clearTarget);

    return () => {
      clearTarget();
      window.removeEventListener('mousemove', handleMouseMove, true);
      window.removeEventListener('click', handleClick, true);
      window.removeEventListener('keyup', handleKeyUp, true);
      window.removeEventListener('blur', clearTarget);
    };
  }, []);

  return (
    <style>{`
      [data-click-to-component-target] {
        cursor: var(--click-to-component-cursor, context-menu) !important;
        outline: var(--click-to-component-outline, -webkit-focus-ring-color auto 1px) !important;
      }

      body[data-click-to-component] #twitter-assistant-root,
      body[data-click-to-component] #twitter-assistant-root *,
      body[data-click-to-component] .ai-assistant-menu-container {
        pointer-events: none !important;
      }
    `}</style>
  );
}
