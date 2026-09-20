import { useMemo } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { MapView } from '@/components/map/MapView';
import { LavaderoStatsPanel } from '@/components/locations/LavaderoStatsPanel';
import { assignMarkerColors } from '@/utils/mapIcons';
import type { useLocations } from '@/hooks/useLocations';

export function DashboardPage({
  store,
  sidebarOpen,
  onCloseSidebar,
  onEdit,
  onDelete,
}: {
  store: ReturnType<typeof useLocations>;
  sidebarOpen: boolean;
  onCloseSidebar: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { locations, filtered, summary, filters, setFilters, selectedId, setSelectedId } = store;
  const markerColors = useMemo(() => assignMarkerColors(locations), [locations]);

  return (
    <div className="flex flex-1 overflow-hidden">
      <Sidebar
        locations={filtered}
        summary={summary}
        filters={filters}
        onFiltersChange={setFilters}
        selectedId={selectedId}
        onSelect={setSelectedId}
        open={sidebarOpen}
        onClose={onCloseSidebar}
        markerColors={markerColors}
      />

      <div className="relative flex-1">
        <MapView locations={filtered} selectedId={selectedId} onSelect={setSelectedId} markerColors={markerColors} />
      </div>

      <div
        className={`fixed inset-y-0 right-0 z-40 w-96 max-w-[90vw] shrink-0 translate-x-0 border-l border-slate-200 bg-white shadow-xl transition-transform duration-200 lg:static lg:z-auto lg:max-w-none lg:translate-x-0 lg:shadow-none ${
          selectedId ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 p-3 lg:hidden">
          <span className="text-sm font-semibold text-slate-700">Lavaderos</span>
          <button
            type="button"
            onClick={() => setSelectedId(null)}
            aria-label="Cerrar panel de lavaderos"
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>
        <LavaderoStatsPanel
          locations={locations}
          selectedId={selectedId}
          markerColors={markerColors}
          onSelect={setSelectedId}
          onEdit={(id) => {
            setSelectedId(id);
            onEdit();
          }}
          onDelete={(id) => {
            setSelectedId(id);
            onDelete();
          }}
        />
      </div>

      {selectedId && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
          onClick={() => setSelectedId(null)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
