import { isSupabaseConfigured, supabase } from './supabaseClient';
import { extractCoordinatesFromUrl, extractPlaceNameFromUrl, isShortGoogleMapsLink } from '@/utils/googleMapsLink';

export interface LinkResolutionResult {
  latitude: number | null;
  longitude: number | null;
  name: string | null;
  address: string | null;
  resolved: boolean;
  error: string | null;
}

/**
 * Intenta resolver un enlace de Google Maps a coordenadas.
 *
 * 1. Si la URL ya trae coordenadas explícitas (ver utils/googleMapsLink), se
 *    devuelven directamente sin llamar a ningún backend.
 * 2. Si es un enlace corto (`maps.app.goo.gl` / `goo.gl/maps`), se delega a la
 *    Edge Function `resolve-link` de Supabase (supabase/functions/resolve-link),
 *    que sigue la redirección del lado del servidor de forma segura (la clave
 *    de servidor de Google nunca se expone al navegador).
 * 3. Si la función no está desplegada o falla, se devuelve `resolved: false`
 *    con el error, y la ubicación queda como "Pendiente de geolocalización"
 *    para completarse manualmente o seleccionando el punto en el mapa.
 */
export async function resolveGoogleMapsLink(url: string): Promise<LinkResolutionResult> {
  const explicit = extractCoordinatesFromUrl(url);
  if (explicit) {
    return {
      latitude: explicit.latitude,
      longitude: explicit.longitude,
      name: extractPlaceNameFromUrl(url),
      address: null,
      resolved: true,
      error: null,
    };
  }

  if (!isShortGoogleMapsLink(url)) {
    return {
      latitude: null,
      longitude: null,
      name: null,
      address: null,
      resolved: false,
      error: 'La URL no contiene coordenadas explícitas y no es un enlace corto reconocido de Google Maps.',
    };
  }

  if (!isSupabaseConfigured || !supabase) {
    return {
      latitude: null,
      longitude: null,
      name: null,
      address: null,
      resolved: false,
      error:
        'No hay backend seguro configurado (Supabase Edge Function "resolve-link"). Configura Supabase o completa las coordenadas manualmente.',
    };
  }

  try {
    const { data, error } = await supabase.functions.invoke('resolve-link', {
      body: { url },
    });
    if (error) throw error;

    if (!data?.latitude || !data?.longitude) {
      return {
        latitude: null,
        longitude: null,
        name: data?.name ?? null,
        address: data?.address ?? null,
        resolved: false,
        error: data?.error ?? 'La función no devolvió coordenadas.',
      };
    }

    return {
      latitude: data.latitude,
      longitude: data.longitude,
      name: data.name ?? null,
      address: data.address ?? null,
      resolved: true,
      error: null,
    };
  } catch (err) {
    return {
      latitude: null,
      longitude: null,
      name: null,
      address: null,
      resolved: false,
      error: err instanceof Error ? err.message : 'Error desconocido al resolver el enlace.',
    };
  }
}
