const unconfiguredUrlMarkers = [
  'your-app-name',
  'your-domain.com',
  'example.com',
];

export function isConfiguredUrl(url?: string): boolean {
  const value = url?.trim();
  if (!value) {
    return false;
  }

  const lowerValue = value.toLowerCase();
  return !unconfiguredUrlMarkers.some((marker) => lowerValue.includes(marker));
}
