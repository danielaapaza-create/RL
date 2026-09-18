import { Filters } from '@/components/locations/Filters';
import { LocationList } from '@/components/locations/LocationList';
import { StatsCounters } from '@/components/locations/StatsCounters';
import type { ImportSummary, LocationFilters, LocationRecord } from '@/types/location';

interface SidebarProps {
  locations: LocationRecord[];
  summary: ImportSummary;
  filters: LocationFilters;
  onFiltersChange: (f: LocationFilters) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
  open: boolean;
  onClose: () => void;
}

export function Sidebar({
  locations,
  summary,
  filters,
  onFiltersChange,
  selectedId,
  onSelect,
  open,
  onClose,
}: SidebarProps) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-80 max-w-[85vw] shrink-0 flex-col border-r border-slate-200 bg-white transition-transform duration-200 md:static md:z-auto md:max-w-none md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 p-3 md:hidden">
          <span className="text-sm font-semibold text-slate-700">Ubicaciones</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar panel de ubicaciones"
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        <StatsCounters summary={summary} />
        <Filters filters={filters} onChange={onFiltersChange} />
        <div className="flex-1 overflow-hidden">
          <LocationList
            locations={locations}
            selectedId={selectedId}
            onSelect={(id) => {
              onSelect(id);
              onClose();
            }}
          />
        </div>
      </aside>
    </>
  );
}
