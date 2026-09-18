import { Sidebar } from '@/components/layout/Sidebar';
import { MapView } from '@/components/map/MapView';
import { LocationDetail } from '@/components/locations/LocationDetail';
import type { useLocations } from '@/hooks/useLocations';

export function DashboardPage({
  store,
  onEdit,
  onDelete,
}: {
  store: ReturnType<typeof useLocations>;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { filtered, summary, filters, setFilters, selectedId, setSelectedId, selected } = store;

  return (
    <div className="flex flex-1 overflow-hidden">
      <Sidebar
        locations={filtered}
        summary={summary}
        filters={filters}
        onFiltersChange={setFilters}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />

      <div className="relative flex-1">
        <MapView locations={filtered} selectedId={selectedId} onSelect={setSelectedId} />
      </div>

      {selected && (
        <div className="w-96 shrink-0 border-l border-slate-200 bg-white">
          <LocationDetail
            location={selected}
            onCenter={() => setSelectedId(selected.id)}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      )}
    </div>
  );
}
