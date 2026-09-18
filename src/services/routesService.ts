import type { RoutePoint, RouteResult } from '@/types/route';

const OSRM_ROUTE_URL = 'https://router.project-osrm.org/route/v1/driving';

/**
 * Calcula una ruta entre dos puntos con el servidor demo público de OSRM
 * (Open Source Routing Machine, sobre datos de OpenStreetMap). Es gratuito y
 * no requiere API key.
 *
 * IMPORTANTE: router.project-osrm.org es un servicio de demostración sin SLA
 * ni garantía de disponibilidad — no pensado para tráfico de producción alto.
 * Para eso, aloja tu propia instancia de OSRM (o un proveedor gestionado
 * equivalente) y cambia OSRM_ROUTE_URL.
 */
export async function computeRoute(
  origin: RoutePoint,
  destination: RoutePoint,
): Promise<RouteResult> {
  const externalMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&travelmode=driving`;

  const url = `${OSRM_ROUTE_URL}/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`;

  const response = await fetch(url);

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`El servicio de rutas respondió ${response.status}: ${body.slice(0, 300)}`);
  }

  const data = await response.json();
  const route = data.routes?.[0];
  if (!route) {
    throw new Error('No se encontró una ruta entre los puntos seleccionados.');
  }

  const path: { lat: number; lng: number }[] = (route.geometry?.coordinates ?? []).map(
    ([lng, lat]: [number, number]) => ({ lat, lng }),
  );

  return {
    distanceMeters: route.distance ?? 0,
    durationSeconds: route.duration ?? 0,
    path,
    origin,
    destination,
    externalMapsUrl,
  };
}
