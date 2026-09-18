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
}

export function Sidebar({
  locations,
  summary,
  filters,
  onFiltersChange,
  selectedId,
  onSelect,
}: SidebarProps) {
  return (
    <aside className="flex w-80 shrink-0 flex-col border-r border-slate-200 bg-white">
      <StatsCounters summary={summary} />
      <Filters filters={filters} onChange={onFiltersChange} />
      <div className="flex-1 overflow-hidden">
        <LocationList locations={locations} selectedId={selectedId} onSelect={onSelect} />
      </div>
    </aside>
  );
}
