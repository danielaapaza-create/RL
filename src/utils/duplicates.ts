import type { LocationRecord } from '@/types/location';
import { normalizeUrl } from './googleMapsLink';

/**
 * Marca, sobre un arreglo de ubicaciones ya cargado en memoria:
 *  - `duplicate_of`: cuando el `original_url` normalizado coincide con el de
 *    un registro anterior (duplicado literal de enlace). El primero que
 *    aparece se considera el registro "canónico".
 *  - `possible_physical_duplicate`: cuando las coordenadas (redondeadas a 6
 *    decimales, ~11 cm de precisión) coinciden con las de otro registro,
 *    tenga o no el mismo enlace.
 *
 * No elimina ni fusiona registros: solo anota relaciones para que la UI
 * decida cómo mostrarlos (un único marcador por URL idéntica, badges de
 * "posible duplicado" para el resto).
 */
export function annotateDuplicates(locations: LocationRecord[]): LocationRecord[] {
  const canonicalByUrl = new Map<string, string>(); // normalizedUrl -> id canónico
  const coordCounts = new Map<string, string[]>(); // "lat,lng" -> ids

  for (const loc of locations) {
    if (loc.original_url) {
      const key = normalizeUrl(loc.original_url);
      if (!canonicalByUrl.has(key)) canonicalByUrl.set(key, loc.id);
    }
    if (loc.latitude !== null && loc.longitude !== null) {
      const key = `${loc.latitude.toFixed(6)},${loc.longitude.toFixed(6)}`;
      const ids = coordCounts.get(key) ?? [];
      ids.push(loc.id);
      coordCounts.set(key, ids);
    }
  }

  return locations.map((loc) => {
    let duplicateOf: string | null = null;
    if (loc.original_url) {
      const key = normalizeUrl(loc.original_url);
      const canonicalId = canonicalByUrl.get(key);
      if (canonicalId && canonicalId !== loc.id) duplicateOf = canonicalId;
    }

    let possiblePhysicalDuplicate = false;
    if (loc.latitude !== null && loc.longitude !== null) {
      const key = `${loc.latitude.toFixed(6)},${loc.longitude.toFixed(6)}`;
      possiblePhysicalDuplicate = (coordCounts.get(key)?.length ?? 0) > 1;
    }

    return {
      ...loc,
      duplicate_of: duplicateOf,
      possible_physical_duplicate: possiblePhysicalDuplicate,
    };
  });
}

/** Ubicaciones que deben pintarse como marcador propio (excluye duplicados literales de enlace). */
export function locationsWithOwnMarker(locations: LocationRecord[]): LocationRecord[] {
  return locations.filter(
    (loc) => loc.duplicate_of === null && loc.latitude !== null && loc.longitude !== null,
  );
}
