type CloudflareImageOptions = {
  width?: number;
  quality?: number;
  format?: 'auto' | 'webp' | 'avif' | 'json';
  fit?: 'scale-down' | 'contain' | 'cover' | 'crop' | 'pad';
};

const ABSOLUTE_HTTP_URL_RE = /^https?:\/\//i;
const SINGLE_SLASH_PROTOCOL_RE = /^(https?):\/([^/])/i;

export function normalizeCloudflareImageSource(src: string) {
  return src.trim().replace(SINGLE_SLASH_PROTOCOL_RE, '$1://$2');
}

function isTransformableImage(src: string) {
  const source = normalizeCloudflareImageSource(src);
  if (!source) return false;
  if (source.startsWith('data:') || source.startsWith('blob:')) return false;
  if (source.startsWith('/cdn-cgi/image/')) return false;
  return !source.split('?')[0]?.toLowerCase().endsWith('.svg');
}

function getSourcePath(src: string) {
  if (ABSOLUTE_HTTP_URL_RE.test(src)) return src;
  return src.startsWith('/') ? src.slice(1) : src;
}

function getDevelopmentSourceOriginTransformUrl(
  src: string,
  optionPath: string
) {
  if (!import.meta.env.DEV || !ABSOLUTE_HTTP_URL_RE.test(src)) {
    return undefined;
  }

  try {
    const sourceUrl = new URL(src);
    return `${sourceUrl.origin}/cdn-cgi/image/${optionPath}${sourceUrl.pathname}${sourceUrl.search}`;
  } catch {
    return undefined;
  }
}

export function getCloudflareImageUrl(
  src: string,
  {
    width = 720,
    quality = 78,
    format = 'auto',
    fit = 'cover',
  }: CloudflareImageOptions = {}
) {
  const source = normalizeCloudflareImageSource(src);
  if (!isTransformableImage(source)) return source;

  const options = [`width=${width}`, `quality=${quality}`, `format=${format}`];
  if (fit) options.push(`fit=${fit}`);
  const optionPath = options.join(',');

  const developmentUrl = getDevelopmentSourceOriginTransformUrl(
    source,
    optionPath
  );
  if (developmentUrl) return developmentUrl;

  return `/cdn-cgi/image/${optionPath}/${getSourcePath(source)}`;
}
