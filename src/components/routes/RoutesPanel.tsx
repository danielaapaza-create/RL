import { useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import { computeRoute } from '@/services/routesService';
import { createPinIcon } from '@/utils/mapIcons';
import type { LocationRecord } from '@/types/location';
import type { RouteResult } from '@/types/route';

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

  const path: [number, number][] = route?.path.map((p) => [p.lat, p.lng]) ?? [];

  return (
    <div className="flex h-full flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
      <div className="flex w-full shrink-0 flex-col gap-4 border-b border-slate-200 bg-white p-5 lg:h-full lg:w-96 lg:overflow-y-auto lg:border-b-0 lg:border-r">
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
              href={route.externalMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 block text-center text-sm font-medium text-brand-600 underline"
            >
              Abrir ruta en Google Maps
            </a>
          </div>
        )}
      </div>

      <div className="h-[60vh] shrink-0 lg:h-auto lg:flex-1">
        <MapContainer center={[-9.19, -75.02]} zoom={5} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {route && (
            <>
              <Marker
                position={[route.origin.latitude, route.origin.longitude]}
                icon={createPinIcon('#16a34a')}
              />
              <Marker
                position={[route.destination.latitude, route.destination.longitude]}
                icon={createPinIcon('#dc2626')}
              />
              {path.length > 0 && (
                <Polyline positions={path} pathOptions={{ color: '#2657f5', weight: 4, opacity: 0.9 }} />
              )}
            </>
          )}
        </MapContainer>
      </div>
    </div>
  );
}
