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

// minmax(0,1fr) para el nombre (trunca en vez de empujar el resto), y
// columnas fijas para cifras/acciones — evita que una <table> con
// table-layout:auto comprima la última columna cuando falta espacio.
const GRID_COLUMNS = 'grid-cols-[minmax(0,1fr)_38px_42px_58px_40px]';

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
      <div className="border-b border-slate-100 px-3 py-2">
        <h2 className="text-sm font-semibold text-slate-900">Lavaderos ({rows.length})</h2>
      </div>

      <div className={`grid ${GRID_COLUMNS} items-center gap-1 border-b border-slate-100 px-2 py-1.5 text-[9px] font-medium uppercase tracking-wide text-slate-400`}>
        <span>Lavadero</span>
        <span className="text-right">Distrib.</span>
        <span className="text-right">Recoge</span>
        <span className="text-right">Jabas/mes</span>
        <span />
      </div>

      {rows.map(({ location, stat }) => (
        <div
          key={location.id}
          className={`grid ${GRID_COLUMNS} cursor-pointer items-center gap-1 border-b border-slate-50 px-2 py-1.5 text-xs transition ${
            location.id === selectedId ? 'bg-brand-50' : 'hover:bg-slate-50'
          }`}
          onClick={() => onSelect(location.id)}
        >
          <div className="flex min-w-0 items-center gap-1.5">
            <span
              className="h-2 w-2 shrink-0 rounded-full border border-black/10"
              style={{ backgroundColor: markerColors.get(location.id) ?? '#94a3b8' }}
              aria-hidden="true"
            />
            <span className="truncate font-medium text-slate-900" title={location.name}>
              {location.name}
            </span>
          </div>
          <span className="text-right tabular-nums text-slate-700">
            {stat ? `${stat.distributePercent}%` : '—'}
          </span>
          <span className="text-right tabular-nums text-slate-700">
            {stat ? `${100 - stat.distributePercent}%` : '—'}
          </span>
          <span className="text-right tabular-nums text-slate-700">
            {stat ? stat.monthlyJabas.toLocaleString('es-PE') : '—'}
          </span>
          <span className="flex items-center justify-end gap-0.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(location.id);
              }}
              aria-label={`Editar ${location.name}`}
              title="Editar"
              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-brand-600"
            >
              <PencilIcon />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(location.id);
              }}
              aria-label={`Eliminar ${location.name}`}
              title="Eliminar"
              className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
            >
              <TrashIcon />
            </button>
          </span>
        </div>
      ))}
    </div>
  );
}

function PencilIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M13.5 3.5l3 3L6 17H3v-3L13.5 3.5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M4 5.5h12M8 5.5V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1.5M15 5.5l-.7 10.15A2 2 0 0 1 12.3 17.5H7.7a2 2 0 0 1-1.995-1.85L5 5.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
