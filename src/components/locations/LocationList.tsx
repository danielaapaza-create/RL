import { LocationListItem } from './LocationListItem';
import type { LocationRecord } from '@/types/location';

export function LocationList({
  locations,
  selectedId,
  onSelect,
  markerColors,
}: {
  locations: LocationRecord[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  markerColors: Map<string, string>;
}) {
  if (locations.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-slate-400">
        No hay ubicaciones que coincidan con los filtros.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 overflow-y-auto p-2">
      {locations.map((loc) => (
        <LocationListItem
          key={loc.id}
          location={loc}
          active={loc.id === selectedId}
          onSelect={() => onSelect(loc.id)}
          color={markerColors.get(loc.id)}
        />
      ))}
    </div>
  );
}
