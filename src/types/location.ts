/**
 * Modelo de datos de una ubicación logística.
 * Refleja 1:1 la tabla `locations` de Supabase (ver supabase/schema.sql).
 */

export type GeolocationStatus =
  /** Cuenta con latitud/longitud verificadas. */
  | 'geolocalizado'
  /** No fue posible obtener coordenadas todavía. */
  | 'pendiente'
  /** Tiene coordenadas pero deben confirmarse manualmente (p. ej. proviene de un enlace resuelto de forma aproximada). */
  | 'requiere_revision';

export type LocationCategory =
  | 'almacen'
  | 'cliente'
  | 'proveedor'
  | 'punto_entrega'
  | 'oficina'
  | 'otro';

export const LOCATION_CATEGORIES: { value: LocationCategory; label: string }[] = [
  { value: 'almacen', label: 'Almacén' },
  { value: 'cliente', label: 'Cliente' },
  { value: 'proveedor', label: 'Proveedor' },
  { value: 'punto_entrega', label: 'Punto de entrega' },
  { value: 'oficina', label: 'Oficina' },
  { value: 'otro', label: 'Otro' },
];

export interface LocationRecord {
  id: string;
  code: string;
  name: string;
  original_url: string | null;
  latitude: number | null;
  longitude: number | null;
  category: LocationCategory;
  description: string | null;
  observations: string | null;
  geolocation_status: GeolocationStatus;
  address: string | null;
  /** id de otro registro con el que comparte enlace original (duplicado literal). */
  duplicate_of: string | null;
  /** Marca visual: coincide en coordenadas con otro registro sin ser el mismo enlace. */
  possible_physical_duplicate: boolean;
  resolution_error: string | null;
  created_at: string;
  updated_at: string;
}

/** Payload para crear/editar una ubicación desde el formulario. */
export interface LocationInput {
  code: string;
  name: string;
  original_url?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  category: LocationCategory;
  description?: string | null;
  observations?: string | null;
  address?: string | null;
}

export interface LocationFilters {
  search: string;
  category: LocationCategory | 'todas';
  status: GeolocationStatus | 'todos';
  onlyReviewNeeded: boolean;
}

export interface ImportSummary {
  total: number;
  geolocalizadas: number;
  pendientes: number;
  duplicadasLiterales: number;
  posiblesDuplicadasFisicas: number;
}
