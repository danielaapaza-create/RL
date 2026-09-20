import { WASH_STATS } from '@/data/washStats';
import type { LocationRecord } from '@/types/location';

interface LavaderoStatsPanelProps {
  locations: LocationRecord[];
  selectedId: string | null;
  markerColors: Map<string, string>;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function LavaderoStatsPanel({
  locations,
  selectedId,
  markerColors,
  onSelect,
  onEdit,
  onDelete,
}: LavaderoStatsPanelProps) {
  const rows = locations
    .filter((loc) => loc.duplicate_of === null)
    .map((loc) => ({ location: loc, stat: WASH_STATS.find((s) => s.locationCode === loc.code) ?? null }));

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="border-b border-slate-100 p-4">
        <h2 className="text-sm font-semibold text-slate-900">Lavaderos ({rows.length})</h2>
        <p className="mt-0.5 text-xs text-slate-500">Mix % Distribuye/Recoge y promedio mensual de jabas lavadas.</p>
      </div>

      <div className="flex flex-col gap-2 p-3">
        {rows.map(({ location, stat }) => (
          <div
            key={location.id}
            className={`rounded-lg border p-3 transition ${
              location.id === selectedId
                ? 'border-brand-300 bg-brand-50'
                : 'border-slate-100 bg-white hover:border-slate-200'
            }`}
          >
            <button
              type="button"
              onClick={() => onSelect(location.id)}
              className="flex w-full items-center gap-2 text-left"
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full border border-black/10"
                style={{ backgroundColor: markerColors.get(location.id) ?? '#94a3b8' }}
                aria-hidden="true"
              />
              <span className="truncate text-sm font-medium text-slate-900">{location.name}</span>
              <span className="ml-auto shrink-0 text-xs text-slate-400">{location.code}</span>
            </button>

            {stat ? (
              <div className="mt-2 grid grid-cols-3 gap-1.5">
                <StatTile value={`${stat.distributePercent}%`} label="Distribuye" />
                <StatTile value={`${100 - stat.distributePercent}%`} label="Recoge" />
                <StatTile value={stat.monthlyJabas.toLocaleString('es-PE')} label="Jabas/mes" />
              </div>
            ) : (
              <p className="mt-2 text-xs text-slate-400">Sin datos de distribución.</p>
            )}

            <div className="mt-2 flex justify-end gap-1">
              <button
                type="button"
                onClick={() => onSelect(location.id)}
                className="rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100"
              >
                Centrar
              </button>
              <button
                type="button"
                onClick={() => onEdit(location.id)}
                className="rounded-md px-2 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => onDelete(location.id)}
                className="rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-md bg-slate-50 px-1.5 py-1.5 text-center">
      <div className="text-sm font-semibold text-slate-900">{value}</div>
      <div className="text-[9px] uppercase tracking-wide text-slate-500">{label}</div>
    </div>
  );
}
