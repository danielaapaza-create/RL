import { RoutesPanel } from '@/components/routes/RoutesPanel';
import type { LocationRecord } from '@/types/location';

export function RoutesPage({ locations }: { locations: LocationRecord[] }) {
  return (
    <div className="flex-1 overflow-hidden">
      <RoutesPanel locations={locations} />
    </div>
  );
}
