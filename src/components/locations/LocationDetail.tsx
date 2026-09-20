import { Badge } from '@/components/common/Badge';
import { buildGoogleMapsUrlFromCoords } from '@/utils/googleMapsLink';
import { FARM_ZONES } from '@/data/farmZones';
import { WASH_ROUTES } from '@/data/washRoutes';
import type { LocationRecord } from '@/types/location';

interface LocationDetailProps {
  location: LocationRecord;
  onCenter: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const CATEGORY_LABEL: Record<string, string> = {
  almacen: 'Almacén',
  cliente: 'Cliente',
  proveedor: 'Proveedor',
  punto_entrega: 'Punto de entrega',
  oficina: 'Oficina',
  otro: 'Otro',
};

export function LocationDetail({ location, onCenter, onEdit, onDelete }: LocationDetailProps) {
  const hasCoords = location.latitude !== null && location.longitude !== null;
  const mapsUrl = hasCoords
    ? buildGoogleMapsUrlFromCoords(location.latitude as number, location.longitude as number)
    : location.original_url;

  const zoneRoutes = WASH_ROUTES.filter((route) => route.locationCode === location.code)
    .map((route) => ({ km: route.km, zone: FARM_ZONES.find((z) => z.id === route.zoneId) }))
    .filter((r): r is { km: number; zone: NonNullable<(typeof r)['zone']> } => !!r.zone)
    .sort((a, b) => a.km - b.km);

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{location.name}</h2>
        <p className="text-sm text-slate-500">{location.code}</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Badge tone="neutral">{CATEGORY_LABEL[location.category] ?? location.category}</Badge>
        {location.geolocation_status === 'geolocalizado' && <Badge tone="success">Geolocalizada</Badge>}
        {location.geolocation_status === 'pendiente' && <Badge tone="warning">Pendiente de geolocalización</Badge>}
        {location.geolocation_status === 'requiere_revision' && <Badge tone="warning">Requiere revisión</Badge>}
        {location.possible_physical_duplicate && (
          <Badge tone="danger">Posible duplicado físico — revisar</Badge>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
        <dt className="text-slate-400">Latitud</dt>
        <dd className="text-slate-800">{location.latitude ?? '—'}</dd>
        <dt className="text-slate-400">Longitud</dt>
        <dd className="text-slate-800">{location.longitude ?? '—'}</dd>
        <dt className="text-slate-400">Dirección</dt>
        <dd className="text-slate-800">{location.address ?? 'No disponible'}</dd>
        <dt className="text-slate-400">Registrado</dt>
        <dd className="text-slate-800">{new Date(location.created_at).toLocaleDateString('es-PE')}</dd>
      </dl>

      {location.resolution_error && (
        <div className="rounded-md bg-amber-50 p-3 text-xs text-amber-800">
          <strong>No se pudo resolver automáticamente:</strong> {location.resolution_error}
        </div>
      )}

      {location.description && (
        <div>
          <h3 className="text-xs font-semibold uppercase text-slate-400">Descripción</h3>
          <p className="mt-1 text-sm text-slate-700">{location.description}</p>
        </div>
      )}

      {location.observations && (
        <div>
          <h3 className="text-xs font-semibold uppercase text-slate-400">Observaciones</h3>
          <p className="mt-1 text-sm text-slate-700">{location.observations}</p>
        </div>
      )}

      {zoneRoutes.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase text-slate-400">
            Zonas de granjas ({zoneRoutes.length})
          </h3>
          <ul className="mt-1.5 flex flex-col gap-1">
            {zoneRoutes.map(({ km, zone }) => (
              <li
                key={zone.id}
                className="flex items-center justify-between rounded-md bg-slate-50 px-2.5 py-1.5 text-sm"
              >
                <span className="text-slate-700">{zone.name}</span>
                <span className="font-medium text-slate-900">{km} km</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {location.original_url && (
        <a
          href={location.original_url}
          target="_blank"
          rel="noreferrer"
          className="truncate text-xs text-brand-600 underline"
        >
          {location.original_url}
        </a>
      )}

      <div className="mt-auto grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={onCenter}
          disabled={!hasCoords}
          className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
        >
          Centrar en mapa
        </button>
        <a
          href={mapsUrl ?? undefined}
          target="_blank"
          rel="noreferrer"
          aria-disabled={!mapsUrl}
          className={`rounded-md border border-slate-200 px-3 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50 ${
            !mapsUrl ? 'pointer-events-none opacity-40' : ''
          }`}
        >
          Abrir en Google Maps
        </a>
        <button
          type="button"
          onClick={onEdit}
          className="rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Editar
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}
