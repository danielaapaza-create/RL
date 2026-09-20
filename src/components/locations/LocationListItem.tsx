import { Badge } from '@/components/common/Badge';
import type { LocationRecord } from '@/types/location';

const CATEGORY_LABEL: Record<string, string> = {
  almacen: 'Almacén',
  cliente: 'Cliente',
  proveedor: 'Proveedor',
  punto_entrega: 'Punto de entrega',
  oficina: 'Oficina',
  otro: 'Otro',
};

export function LocationListItem({
  location,
  active,
  onSelect,
  color,
}: {
  location: LocationRecord;
  active: boolean;
  onSelect: () => void;
  color?: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-lg border px-3 py-2 text-left transition ${
        active ? 'border-brand-300 bg-brand-50' : 'border-transparent hover:bg-slate-50'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2">
          {color && (
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full border border-black/10"
              style={{ backgroundColor: color }}
              aria-hidden="true"
            />
          )}
          <span className="truncate text-sm font-medium text-slate-900">{location.name}</span>
        </span>
        <span className="shrink-0 text-xs text-slate-400">{location.code}</span>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-1.5">
        <Badge tone="neutral">{CATEGORY_LABEL[location.category] ?? location.category}</Badge>
        {location.geolocation_status === 'geolocalizado' && <Badge tone="success">Geolocalizada</Badge>}
        {location.geolocation_status === 'pendiente' && <Badge tone="warning">Pendiente</Badge>}
        {location.geolocation_status === 'requiere_revision' && (
          <Badge tone="warning">Requiere revisión</Badge>
        )}
        {location.possible_physical_duplicate && <Badge tone="danger">Posible duplicado</Badge>}
      </div>
    </button>
  );
}
