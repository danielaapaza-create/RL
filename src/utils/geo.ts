import type { LocationRecord } from '@/types/location';

export interface LatLngBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

/** Calcula el encuadre (bounding box) que contiene a todas las ubicaciones con coordenadas válidas. */
export function computeBounds(locations: LocationRecord[]): LatLngBounds | null {
  const withCoords = locations.filter(
    (l): l is LocationRecord & { latitude: number; longitude: number } =>
      l.latitude !== null && l.longitude !== null,
  );
  if (withCoords.length === 0) return null;

  let north = -90;
  let south = 90;
  let east = -180;
  let west = 180;

  for (const loc of withCoords) {
    north = Math.max(north, loc.latitude);
    south = Math.min(south, loc.latitude);
    east = Math.max(east, loc.longitude);
    west = Math.min(west, loc.longitude);
  }

  return { north, south, east, west };
}

/** Distancia aproximada en metros entre dos coordenadas (fórmula de Haversine). Solo para estimaciones locales sin llamar a la API. */
export function haversineDistanceMeters(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
