import type { LocationRecord } from '@/types/location';

export function MarkerInfo({ location }: { location: LocationRecord }) {
  return (
    <div className="max-w-[220px] p-1">
      <p className="text-sm font-semibold text-slate-900">{location.name}</p>
      <p className="text-xs text-slate-500">{location.code}</p>
      {location.address && <p className="mt-1 text-xs text-slate-600">{location.address}</p>}
    </div>
  );
}
