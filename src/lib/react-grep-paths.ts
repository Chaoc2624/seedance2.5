type ReactFiber = {
  _debugStack?: { stack?: string };
  return?: ReactFiber | null;
};

let initialized = false;
let latestFullPath: string | null = null;
let originalWriteText: Clipboard['writeText'] | null = null;

const modifierKey = (event: MouseEvent | KeyboardEvent) =>
  /mac/i.test(navigator.userAgentData?.platform ?? navigator.userAgent)
    ? event.metaKey
    : event.ctrlKey;

function getFiberFromElement(element: Element): ReactFiber | null {
  const key = Object.keys(element).find((item) =>
    item.startsWith('__reactFiber$')
  );
  return key
    ? ((element as unknown as Record<string, ReactFiber>)[key] ?? null)
    : null;
}

function parseFirstAppFrame(stack?: string): string | null {
  if (!stack) return null;

  for (const line of stack.split('\n')) {
    const match = /at (?:.+ \()?(.+src\/.+?):\d+:\d+\)?$/.exec(line.trim());
    if (match) return normalizePath(match[1]);
  }

  return null;
}

function normalizePath(rawPath: string): string {
  let path = rawPath;

  try {
    const parsed = new URL(path);
    path = parsed.pathname;
  } catch {
    // Keep relative stack frame paths as-is.
  }

  path = decodeURIComponent(path)
    .replace(/^\//, '')
    .replace(/\?tsr-split=[^:]+$/, '')
    .replace(/\?.*$/, '');

  const srcIndex = path.indexOf('src/');
  return srcIndex >= 0 ? path.slice(srcIndex) : path;
}

function findFullPath(element: Element | null): string | null {
  let fiber = element ? getFiberFromElement(element) : null;

  while (fiber) {
    const path = parseFirstAppFrame(fiber._debugStack?.stack);
    if (path) return path;
    fiber = fiber.return ?? null;
  }

  return null;
}

function updateLatestPath(event: MouseEvent) {
  if (!modifierKey(event)) {
    latestFullPath = null;
    return;
  }

  latestFullPath = findFullPath(
    document.elementFromPoint(event.clientX, event.clientY)
  );
}

function expandLocation(text: string): string {
  if (!latestFullPath || !text.includes('?tsr-split=')) return text;

  const fileName = latestFullPath.split('/').at(-1);
  if (!fileName) return text;

  const escapedFileName = fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const locationPattern = new RegExp(
    `(?:\\.\\.\\/)?${escapedFileName}\\?tsr-split=[^:\\s]+:(\\d+)(?::(\\d+))?`,
    'g'
  );

  return text.replace(locationPattern, (_match, line, column) =>
    column ? `${latestFullPath}:${line}:${column}` : `${latestFullPath}:${line}`
  );
}

function patchClipboard() {
  if (!navigator.clipboard?.writeText || originalWriteText) return;

  originalWriteText = navigator.clipboard.writeText.bind(navigator.clipboard);
  navigator.clipboard.writeText = (text) =>
    originalWriteText!(expandLocation(text));
}

function enhanceTooltip(tooltip: HTMLElement) {
  if (tooltip.dataset.reactGrepFullPath === 'true') return;

  const expanded = expandLocation(tooltip.textContent ?? '');
  if (expanded === tooltip.textContent || !expanded.includes('src/')) return;

  const locations = expanded.match(/src\/[^\s)]+:\d+(?::\d+)?/g) ?? [];
  const displayText =
    locations.length > 1
      ? `${locations[0]} Shift (${locations[1]})`
      : (locations[0] ?? expanded);

  tooltip.dataset.reactGrepFullPath = 'true';
  tooltip.style.maxWidth = 'min(960px, calc(100vw - 16px))';
  tooltip.style.whiteSpace = 'normal';

  const fullPath = document.createElement('div');
  fullPath.textContent = displayText;
  fullPath.style.marginTop = '2px';
  fullPath.style.color = '#d4d4d8';
  fullPath.style.fontWeight = '500';
  fullPath.style.overflow = 'hidden';
  fullPath.style.textOverflow = 'ellipsis';

  tooltip.appendChild(fullPath);
}

function watchTooltip() {
  const observer = new MutationObserver(() => {
    const tooltip = document.querySelector<HTMLElement>(
      '[data-react-grep="tooltip"]'
    );
    if (tooltip) enhanceTooltip(tooltip);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
}

export async function initReactGrepWithFullPaths() {
  if (initialized) return;
  initialized = true;

  window.addEventListener('mousemove', updateLatestPath, true);
  patchClipboard();
  watchTooltip();

  await import('react-grep');
}
