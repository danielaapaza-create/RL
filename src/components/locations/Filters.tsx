import { LOCATION_CATEGORIES } from '@/types/location';
import type { LocationFilters } from '@/types/location';

export function Filters({
  filters,
  onChange,
}: {
  filters: LocationFilters;
  onChange: (next: LocationFilters) => void;
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-slate-100 p-3">
      <select
        value={filters.category}
        onChange={(e) => onChange({ ...filters, category: e.target.value as LocationFilters['category'] })}
        className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm"
      >
        <option value="todas">Todas las categorías</option>
        {LOCATION_CATEGORIES.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>

      <select
        value={filters.status}
        onChange={(e) => onChange({ ...filters, status: e.target.value as LocationFilters['status'] })}
        className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm"
      >
        <option value="todos">Todos los estados</option>
        <option value="geolocalizado">Geolocalizadas</option>
        <option value="pendiente">Pendientes</option>
        <option value="requiere_revision">Requieren revisión</option>
      </select>

      <label className="flex items-center gap-2 px-1 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={filters.onlyReviewNeeded}
          onChange={(e) => onChange({ ...filters, onlyReviewNeeded: e.target.checked })}
          className="h-4 w-4 rounded border-slate-300 text-brand-600"
        />
        Solo posibles duplicados
      </label>
    </div>
  );
}
