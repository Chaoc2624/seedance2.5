export const DEVICE_FINGERPRINT_COOKIE_NAME = 'shiponce_device';
export const DEVICE_FINGERPRINT_HEADER_NAME = 'x-device-fingerprint';

const DEVICE_FINGERPRINT_STORAGE_KEY = 'shiponce:device-fingerprint';
const DEVICE_FINGERPRINT_MAX_AGE_SECONDS = 60 * 60 * 24 * 400;
const DEVICE_FINGERPRINT_PATTERN = /^[A-Za-z0-9:_-]{8,191}$/;

function getCookieValue(name: string) {
  if (typeof document === 'undefined') return '';

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return decodeURIComponent(parts.pop()?.split(';').shift() || '');
  }

  return '';
}

function setCookieValue(name: string, value: string) {
  if (typeof document === 'undefined') return;

  const secure =
    typeof window !== 'undefined' && window.location.protocol === 'https:'
      ? '; Secure'
      : '';

  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${DEVICE_FINGERPRINT_MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secure}`;
}

function createRandomId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID().replace(/-/g, '');
  }

  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 18)}`;
}

async function sha256Hex(value: string) {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const buffer = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(value)
    );

    return Array.from(new Uint8Array(buffer))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(16).padStart(8, '0');
}

function getCanvasSignature() {
  if (typeof document === 'undefined') return '';

  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return '';

    canvas.width = 220;
    canvas.height = 32;
    context.textBaseline = 'top';
    context.font = '16px serif';
    context.fillStyle = '#f60';
    context.fillRect(0, 0, 24, 24);
    context.fillStyle = '#069';
    context.fillText('shiponce-device', 4, 8);
    return canvas.toDataURL();
  } catch {
    return '';
  }
}

function getFingerprintSource() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return 'server';
  }

  const screenValue =
    typeof screen === 'undefined'
      ? ''
      : [
          screen.width,
          screen.height,
          screen.colorDepth,
          window.devicePixelRatio,
        ].join('x');

  return [
    navigator.userAgent,
    navigator.language,
    navigator.languages?.join(',') || '',
    navigator.platform,
    Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    screenValue,
    navigator.hardwareConcurrency || '',
    (navigator as any).deviceMemory || '',
    navigator.maxTouchPoints || 0,
    getCanvasSignature(),
  ].join('|');
}

export function sanitizeDeviceFingerprint(value: unknown) {
  const fingerprint = String(value || '').trim();
  if (!DEVICE_FINGERPRINT_PATTERN.test(fingerprint)) {
    return '';
  }

  return fingerprint.slice(0, 191);
}

export function parseDeviceFingerprint(value: unknown) {
  const raw = sanitizeDeviceFingerprint(value);
  if (!raw) {
    return { raw: '', sourceHash: '', deviceId: '' };
  }

  const match = /^v1:([a-f0-9]{16,64}):([A-Za-z0-9_-]{12,64})$/.exec(raw);
  if (!match) {
    return { raw, sourceHash: '', deviceId: raw };
  }

  return {
    raw,
    sourceHash: match[1],
    deviceId: match[2],
  };
}

export function getStoredDeviceFingerprint() {
  if (typeof window === 'undefined') return '';

  try {
    const stored = sanitizeDeviceFingerprint(
      window.localStorage.getItem(DEVICE_FINGERPRINT_STORAGE_KEY)
    );
    if (stored) return stored;
  } catch {}

  return sanitizeDeviceFingerprint(
    getCookieValue(DEVICE_FINGERPRINT_COOKIE_NAME)
  );
}

export async function ensureDeviceFingerprint() {
  if (typeof window === 'undefined') return '';

  const existing = getStoredDeviceFingerprint();
  if (existing) {
    setCookieValue(DEVICE_FINGERPRINT_COOKIE_NAME, existing);
    return existing;
  }

  const sourceHash = (await sha256Hex(getFingerprintSource())).slice(0, 32);
  const deviceId = createRandomId().slice(0, 32);
  const fingerprint = sanitizeDeviceFingerprint(`v1:${sourceHash}:${deviceId}`);

  if (!fingerprint) return '';

  try {
    window.localStorage.setItem(DEVICE_FINGERPRINT_STORAGE_KEY, fingerprint);
  } catch {}

  setCookieValue(DEVICE_FINGERPRINT_COOKIE_NAME, fingerprint);

  return fingerprint;
}
