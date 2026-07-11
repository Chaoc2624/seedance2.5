'use server';

import { getRequestHeaders } from '@tanstack/start-server-core';

import { getCookieFromHeader } from '@/lib/cookie';
import {
  DEVICE_FINGERPRINT_COOKIE_NAME,
  DEVICE_FINGERPRINT_HEADER_NAME,
  sanitizeDeviceFingerprint,
} from '@/lib/device-fingerprint';

export async function getClientIp() {
  const h = getRequestHeaders();

  const ip =
    h.get('cf-connecting-ip') || // Cloudflare IP
    h.get('x-real-ip') || // Vercel or other reverse proxies
    (h.get('x-forwarded-for') || '127.0.0.1').split(',')[0]; // Standard header

  return ip;
}

export async function getClientCountryCode() {
  const h = getRequestHeaders();
  const country =
    h.get('cf-ipcountry') ||
    h.get('x-vercel-ip-country') ||
    h.get('cloudfront-viewer-country') ||
    h.get('x-country-code') ||
    h.get('x-appengine-country') ||
    '';

  return country.trim().toUpperCase().slice(0, 2);
}

export async function getRequestDeviceFingerprint() {
  const h = getRequestHeaders();
  const fingerprint =
    h.get(DEVICE_FINGERPRINT_HEADER_NAME) ||
    getCookieFromHeader(h.get('cookie'), DEVICE_FINGERPRINT_COOKIE_NAME) ||
    '';

  return sanitizeDeviceFingerprint(fingerprint);
}
