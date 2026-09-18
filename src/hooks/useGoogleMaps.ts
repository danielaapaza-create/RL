export function getGoogleMapsBrowserKey(): string | null {
  const key = import.meta.env.VITE_GOOGLE_MAPS_BROWSER_KEY;
  if (!key || key.includes('REEMPLAZA')) return null;
  return key;
}

export function isGoogleMapsConfigured(): boolean {
  return getGoogleMapsBrowserKey() !== null;
}
