import type { RoutePoint, RouteResult } from '@/types/route';

const ROUTES_API_URL = 'https://routes.googleapis.com/directions/v2:computeRoutes';

/**
 * Calcula una ruta entre dos puntos usando la Routes API de Google.
 *
 * IMPORTANTE: la Routes API requiere una clave de SERVIDOR (no la clave de
 * navegador restringida por dominio) y no debe llamarse directamente desde
 * el navegador en producción, porque expondría esa clave. En este proyecto
 * la llamada se hace desde el navegador solo cuando `VITE_GOOGLE_MAPS_BROWSER_KEY`
 * está configurada para pruebas locales con una clave restringida por HTTP
 * referrer y con la Routes API específicamente habilitada; para producción,
 * mueve esta llamada a una Edge Function (mismo patrón que
 * supabase/functions/resolve-link) que use `GOOGLE_MAPS_SERVER_KEY`.
 */
export async function computeRoute(
  origin: RoutePoint,
  destination: RoutePoint,
): Promise<RouteResult> {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_BROWSER_KEY;
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&travelmode=driving`;

  if (!apiKey || apiKey.includes('REEMPLAZA')) {
    throw new Error(
      'Falta configurar VITE_GOOGLE_MAPS_BROWSER_KEY con la Routes API habilitada para calcular rutas. Puedes abrir la ruta directamente en Google Maps mientras tanto.',
    );
  }

  const response = await fetch(ROUTES_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask':
        'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline',
    },
    body: JSON.stringify({
      origin: { location: { latLng: { latitude: origin.latitude, longitude: origin.longitude } } },
      destination: {
        location: { latLng: { latitude: destination.latitude, longitude: destination.longitude } },
      },
      travelMode: 'DRIVE',
      routingPreference: 'TRAFFIC_AWARE',
      units: 'METRIC',
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Routes API respondió ${response.status}: ${body.slice(0, 300)}`);
  }

  const data = await response.json();
  const route = data.routes?.[0];
  if (!route) {
    throw new Error('No se encontró una ruta entre los puntos seleccionados.');
  }

  const durationSeconds = Number(String(route.duration ?? '0s').replace('s', ''));

  return {
    distanceMeters: route.distanceMeters ?? 0,
    durationSeconds,
    polyline: route.polyline?.encodedPolyline ?? null,
    origin,
    destination,
    googleMapsUrl,
  };
}
