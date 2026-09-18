/**
 * Utilidades para interpretar enlaces de Google Maps.
 *
 * Google Maps genera varias formas de URL. Este módulo cubre las que se
 * pueden resolver SIN necesitar red (coordenadas explícitas en la propia
 * URL) y expone el contrato para las que requieren resolución remota
 * (enlaces cortos `maps.app.goo.gl` / `goo.gl/maps`, que no incluyen
 * coordenadas y deben resolverse siguiendo la redirección del servidor,
 * ver services/linkResolver.ts).
 */

export interface ExtractedCoordinates {
  latitude: number;
  longitude: number;
}

const SHORT_LINK_HOSTS = ['maps.app.goo.gl', 'goo.gl'];

/** true si la URL es un enlace corto que requiere resolución remota. */
export function isShortGoogleMapsLink(url: string): boolean {
  try {
    const { hostname, pathname } = new URL(url);
    if (hostname === 'goo.gl') return pathname.startsWith('/maps');
    return SHORT_LINK_HOSTS.includes(hostname);
  } catch {
    return false;
  }
}

function clampCoordinate(value: number, min: number, max: number): boolean {
  return Number.isFinite(value) && value >= min && value <= max;
}

export function isValidLatLng(lat: number, lng: number): boolean {
  return clampCoordinate(lat, -90, 90) && clampCoordinate(lng, -180, 180);
}

/**
 * Intenta extraer coordenadas explícitas de una URL larga de Google Maps,
 * cubriendo los formatos más comunes:
 *  - ?q=LAT,LNG
 *  - /@LAT,LNG,ZOOMz
 *  - /place/.../@LAT,LNG,...  (usa las coords del centro del mapa)
 *  - !3dLAT!4dLNG (coordenadas exactas del lugar, cuando están presentes)
 */
export function extractCoordinatesFromUrl(url: string): ExtractedCoordinates | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  // Prioridad 1: parámetro q=lat,lng (o query=lat,lng)
  const qParam = parsed.searchParams.get('q') ?? parsed.searchParams.get('query');
  if (qParam) {
    const match = qParam.trim().match(/^(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)$/);
    if (match) {
      const lat = Number(match[1]);
      const lng = Number(match[2]);
      if (isValidLatLng(lat, lng)) return { latitude: lat, longitude: lng };
    }
  }

  // Prioridad 2: coordenadas exactas del lugar en el bloque `data=` (!3dLAT!4dLNG)
  const dataExact = url.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  if (dataExact) {
    const lat = Number(dataExact[1]);
    const lng = Number(dataExact[2]);
    if (isValidLatLng(lat, lng)) return { latitude: lat, longitude: lng };
  }

  // Prioridad 3: segmento /@lat,lng,zoom
  const atSegment = url.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)(?:,[^/]*)?/);
  if (atSegment) {
    const lat = Number(atSegment[1]);
    const lng = Number(atSegment[2]);
    if (isValidLatLng(lat, lng)) return { latitude: lat, longitude: lng };
  }

  // Prioridad 4: /maps/search/lat,+lng o /maps/search/lat,lng
  const searchSegment = parsed.pathname.match(
    /\/maps\/search\/(-?\d+(?:\.\d+)?),\+?\s*(-?\d+(?:\.\d+)?)/,
  );
  if (searchSegment) {
    const lat = Number(searchSegment[1]);
    const lng = Number(searchSegment[2]);
    if (isValidLatLng(lat, lng)) return { latitude: lat, longitude: lng };
  }

  return null;
}

/** Extrae, si existe, el nombre de lugar legible de una URL larga (`/place/NOMBRE/`). */
export function extractPlaceNameFromUrl(url: string): string | null {
  const match = url.match(/\/maps\/place\/([^/]+)\//);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]).replace(/\+/g, ' ');
  } catch {
    return match[1].replace(/\+/g, ' ');
  }
}

/** Normaliza una URL para comparar duplicados literales (ignora query de tracking cuando es posible). */
export function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url.trim());
    parsed.hash = '';
    return `${parsed.origin}${parsed.pathname}`.toLowerCase().replace(/\/$/, '');
  } catch {
    return url.trim().toLowerCase();
  }
}

/** Construye una URL de Google Maps a partir de coordenadas, para el botón "Abrir en Google Maps". */
export function buildGoogleMapsUrlFromCoords(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}
