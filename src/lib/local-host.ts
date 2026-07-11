const LOCAL_HOSTNAMES = new Set(['localhost', '0.0.0.0', '::1']);

export function getHostname(value?: string | null) {
  const raw = String(value || '')
    .split(',')[0]
    .trim()
    .toLowerCase();

  if (!raw) {
    return '';
  }

  if (raw === '::1' || raw === '[::1]') {
    return '::1';
  }

  if (raw.startsWith('[')) {
    const end = raw.indexOf(']');
    if (end > 0) {
      return raw.slice(1, end);
    }
  }

  try {
    const url = new URL(raw.includes('://') ? raw : `http://${raw}`);
    return url.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  } catch {
    return raw.split(':')[0];
  }
}

export function isLocalHost(value?: string | null) {
  const hostname = getHostname(value);
  return (
    LOCAL_HOSTNAMES.has(hostname) ||
    hostname.endsWith('.localhost') ||
    hostname.startsWith('127.')
  );
}
