const KIE_SEGMENT = /(^|[_-])kie(?=($|[_-]))/gi;

export function getSafeDownloadFilename(
  source: string,
  fallback: string
): string {
  let filename = source;

  try {
    filename =
      new URL(source, window.location.origin).pathname.split('/').pop() ??
      source;
  } catch {
    filename = source.split('/').pop() ?? source;
  }

  const extensionIndex = filename.lastIndexOf('.');
  const extension = extensionIndex > 0 ? filename.slice(extensionIndex) : '';
  const stem =
    extensionIndex > 0 ? filename.slice(0, extensionIndex) : filename;
  const safeStem = stem
    .replace(KIE_SEGMENT, '$1')
    .replace(/[_-]{2,}/g, '_')
    .replace(/^[_-]+|[_-]+$/g, '')
    .trim();

  return `${safeStem || fallback.replace(/\.[^.]+$/, '')}${extension || fallback.slice(fallback.lastIndexOf('.'))}`;
}
