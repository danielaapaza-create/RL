import { useEffect, useMemo, useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';
import { computeRoute } from '@/services/routesService';
import { getGoogleMapsBrowserKey } from '@/hooks/useGoogleMaps';
import type { LocationRecord } from '@/types/location';
import type { RouteResult } from '@/types/route';

function decodePolyline(encoded: string): { lat: number; lng: number }[] {
  // Decodificador estándar de polylines de Google (algoritmo público, sin dependencias externas).
  let index = 0;
  let lat = 0;
  let lng = 0;
  const points: { lat: number; lng: number }[] = [];

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }

  return points;
}

function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h} h ${m} min`;
}

export function RoutesPanel({ locations }: { locations: LocationRecord[] }) {
  const geolocated = useMemo(
    () => locations.filter((l) => l.latitude !== null && l.longitude !== null && l.duplicate_of === null),
    [locations],
  );

  const [originId, setOriginId] = useState('');
  const [destinationId, setDestinationId] = useState('');
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiKey = getGoogleMapsBrowserKey();

  async function handleCalculate() {
    const origin = geolocated.find((l) => l.id === originId);
    const destination = geolocated.find((l) => l.id === destinationId);
    if (!origin || !destination) return;

    setLoading(true);
    setError(null);
    setRoute(null);
    try {
      const result = await computeRoute(
        { locationId: origin.id, name: origin.name, latitude: origin.latitude as number, longitude: origin.longitude as number },
        {
          locationId: destination.id,
          name: destination.name,
          latitude: destination.latitude as number,
          longitude: destination.longitude as number,
        },
      );
      setRoute(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo calcular la ruta.');
    } finally {
      setLoading(false);
    }
  }

  const path = route?.polyline ? decodePolyline(route.polyline) : [];

  return (
    <div className="flex h-full">
      <div className="flex w-96 shrink-0 flex-col gap-4 overflow-y-auto border-r border-slate-200 bg-white p-5">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Calcular ruta</h2>
          <p className="mt-1 text-sm text-slate-500">
            Selecciona origen y destino entre las ubicaciones ya geolocalizadas. Preparado para incorporar múltiples
            paradas en el futuro.
          </p>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">Origen</span>
          <select value={originId} onChange={(e) => setOriginId(e.target.value)} className="input">
            <option value="">Selecciona una ubicación…</option>
            {geolocated.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} ({l.code})
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">Destino</span>
          <select value={destinationId} onChange={(e) => setDestinationId(e.target.value)} className="input">
            <option value="">Selecciona una ubicación…</option>
            {geolocated.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} ({l.code})
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={handleCalculate}
          disabled={!originId || !destinationId || originId === destinationId || loading}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {loading ? 'Calculando…' : 'Calcular ruta'}
        </button>

        {originId === destinationId && originId !== '' && (
          <p className="text-xs text-amber-600">Elige dos ubicaciones distintas.</p>
        )}

        {error && <div className="rounded-md bg-red-50 p-3 text-xs text-red-700">{error}</div>}

        {route && (
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Distancia</span>
              <span className="font-semibold text-slate-900">
                {(route.distanceMeters / 1000).toFixed(1)} km
              </span>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-slate-500">Tiempo estimado</span>
              <span className="font-semibold text-slate-900">{formatDuration(route.durationSeconds)}</span>
            </div>
            <a
              href={route.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 block text-center text-sm font-medium text-brand-600 underline"
            >
              Abrir ruta en Google Maps
            </a>
          </div>
        )}
      </div>

      <div className="flex-1">
        {!apiKey ? (
          <div className="flex h-full items-center justify-center bg-slate-100 text-sm text-slate-500">
            Configura VITE_GOOGLE_MAPS_BROWSER_KEY para visualizar la ruta en el mapa.
          </div>
        ) : (
          <APIProvider apiKey={apiKey}>
            <Map defaultCenter={{ lat: -9.19, lng: -75.02 }} defaultZoom={5} className="h-full w-full">
              {route && (
                <>
                  <AdvancedMarker position={{ lat: route.origin.latitude, lng: route.origin.longitude }}>
                    <Pin background="#16a34a" glyphColor="#fff" borderColor="#14532d" />
                  </AdvancedMarker>
                  <AdvancedMarker
                    position={{ lat: route.destination.latitude, lng: route.destination.longitude }}
                  >
                    <Pin background="#dc2626" glyphColor="#fff" borderColor="#7f1d1d" />
                  </AdvancedMarker>
                  {path.length > 0 && <RoutePolyline path={path} />}
                </>
              )}
            </Map>
          </APIProvider>
        )}
      </div>
    </div>
  );
}

function RoutePolyline({ path }: { path: { lat: number; lng: number }[] }) {
  // Se dibuja con la Maps JavaScript API directamente (google.maps.Polyline),
  // ya que @vis.gl/react-google-maps no expone un componente propio para ello.
  return <PolylineRenderer path={path} />;
}

function PolylineRenderer({ path }: { path: { lat: number; lng: number }[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || path.length === 0) return undefined;
    const polyline = new google.maps.Polyline({
      path,
      strokeColor: '#2657f5',
      strokeOpacity: 0.9,
      strokeWeight: 4,
    });
    polyline.setMap(map);
    return () => polyline.setMap(null);
  }, [map, path]);

  return null;
}
