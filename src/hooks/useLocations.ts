import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  buildImportSummary,
  createLocation,
  deleteLocation,
  listLocations,
  updateLocation,
} from '@/services/locationsService';
import type { LocationFilters, LocationInput, LocationRecord } from '@/types/location';

const DEFAULT_FILTERS: LocationFilters = {
  search: '',
  category: 'todas',
  status: 'todos',
  onlyReviewNeeded: false,
};

export function useLocations() {
  const [locations, setLocations] = useState<LocationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<LocationFilters>(DEFAULT_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listLocations();
      setLocations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las ubicaciones.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const add = useCallback(
    async (input: LocationInput) => {
      const created = await createLocation(input);
      await refresh();
      setSelectedId(created.id);
      return created;
    },
    [refresh],
  );

  const edit = useCallback(
    async (id: string, patch: Partial<LocationInput>) => {
      await updateLocation(id, patch);
      await refresh();
    },
    [refresh],
  );

  const remove = useCallback(
    async (id: string) => {
      await deleteLocation(id);
      if (selectedId === id) setSelectedId(null);
      await refresh();
    },
    [refresh, selectedId],
  );

  const filtered = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return locations.filter((loc) => {
      if (loc.duplicate_of) return false; // no listar duplicados literales como registros independientes
      if (filters.category !== 'todas' && loc.category !== filters.category) return false;
      if (filters.status !== 'todos' && loc.geolocation_status !== filters.status) return false;
      if (filters.onlyReviewNeeded && !loc.possible_physical_duplicate) return false;
      if (!search) return true;
      return (
        loc.name.toLowerCase().includes(search) ||
        loc.code.toLowerCase().includes(search) ||
        (loc.address ?? '').toLowerCase().includes(search)
      );
    });
  }, [locations, filters]);

  const summary = useMemo(() => buildImportSummary(locations), [locations]);

  const selected = useMemo(
    () => locations.find((l) => l.id === selectedId) ?? null,
    [locations, selectedId],
  );

  return {
    locations,
    filtered,
    loading,
    error,
    filters,
    setFilters,
    selectedId,
    setSelectedId,
    selected,
    summary,
    add,
    edit,
    remove,
    refresh,
  };
}
