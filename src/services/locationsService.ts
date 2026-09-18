import { isSupabaseConfigured, supabase } from './supabaseClient';
import { localStore } from './localStore';
import { annotateDuplicates } from '@/utils/duplicates';
import { INITIAL_LOCATIONS } from '@/data/initialLocations';
import type { ImportSummary, LocationInput, LocationRecord } from '@/types/location';

/**
 * Capa de acceso a datos de ubicaciones. Usa Supabase cuando hay credenciales
 * reales configuradas (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY); si no,
 * usa un almacenamiento local en el navegador para que la app funcione en
 * modo de desarrollo sin backend real (ver README.md, sección "Modo sin
 * credenciales").
 */

function toRecordFromSeed(seed: (typeof INITIAL_LOCATIONS)[number]): Omit<
  LocationRecord,
  'id' | 'created_at' | 'updated_at'
> {
  const hasCoords = seed.latitude != null && seed.longitude != null;
  return {
    code: seed.code,
    name: seed.name,
    original_url: seed.original_url,
    latitude: seed.latitude ?? null,
    longitude: seed.longitude ?? null,
    category: seed.category,
    description: seed.description ?? null,
    observations: seed.observations ?? null,
    address: seed.address ?? null,
    geolocation_status: hasCoords ? 'geolocalizado' : 'pendiente',
    duplicate_of: null,
    possible_physical_duplicate: false,
    resolution_error: seed.pending ? 'No fue posible resolver el enlace corto automáticamente.' : null,
  };
}

async function ensureSeeded(): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { count, error } = await supabase
      .from('locations')
      .select('id', { count: 'exact', head: true });
    if (error) throw error;
    if ((count ?? 0) > 0) return;

    const rows = INITIAL_LOCATIONS.map(toRecordFromSeed);
    const { error: insertError } = await supabase.from('locations').insert(rows);
    if (insertError) throw insertError;
    return;
  }

  if (!localStore.hasData()) {
    const now = new Date().toISOString();
    const seeded: LocationRecord[] = INITIAL_LOCATIONS.map((seed, i) => ({
      ...toRecordFromSeed(seed),
      id: `seed-${i + 1}`,
      created_at: now,
      updated_at: now,
    }));
    localStore.seed(annotateDuplicates(seeded));
  }
}

export async function listLocations(): Promise<LocationRecord[]> {
  await ensureSeeded();

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return annotateDuplicates((data ?? []) as LocationRecord[]);
  }

  return annotateDuplicates(localStore.list());
}

export async function createLocation(input: LocationInput): Promise<LocationRecord> {
  const base = {
    code: input.code.trim(),
    name: input.name.trim(),
    original_url: input.original_url?.trim() || null,
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
    category: input.category,
    description: input.description?.trim() || null,
    observations: input.observations?.trim() || null,
    address: input.address?.trim() || null,
    geolocation_status: (input.latitude != null && input.longitude != null
      ? 'geolocalizado'
      : 'pendiente') as LocationRecord['geolocation_status'],
    duplicate_of: null,
    possible_physical_duplicate: false,
    resolution_error: null,
  };

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('locations').insert(base).select().single();
    if (error) throw error;
    return data as LocationRecord;
  }

  return localStore.insert(base);
}

export async function updateLocation(
  id: string,
  patch: Partial<LocationInput> & { geolocation_status?: LocationRecord['geolocation_status'] },
): Promise<LocationRecord> {
  const cleanPatch: Partial<LocationRecord> = {
    ...(patch.code !== undefined && { code: patch.code.trim() }),
    ...(patch.name !== undefined && { name: patch.name.trim() }),
    ...(patch.original_url !== undefined && { original_url: patch.original_url?.trim() || null }),
    ...(patch.latitude !== undefined && { latitude: patch.latitude }),
    ...(patch.longitude !== undefined && { longitude: patch.longitude }),
    ...(patch.category !== undefined && { category: patch.category }),
    ...(patch.description !== undefined && { description: patch.description?.trim() || null }),
    ...(patch.observations !== undefined && { observations: patch.observations?.trim() || null }),
    ...(patch.address !== undefined && { address: patch.address?.trim() || null }),
    ...(patch.geolocation_status !== undefined && { geolocation_status: patch.geolocation_status }),
  };

  if (
    (patch.latitude !== undefined || patch.longitude !== undefined) &&
    patch.geolocation_status === undefined
  ) {
    cleanPatch.geolocation_status =
      cleanPatch.latitude != null && cleanPatch.longitude != null ? 'geolocalizado' : 'pendiente';
  }

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('locations')
      .update(cleanPatch)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as LocationRecord;
  }

  const updated = localStore.update(id, cleanPatch);
  if (!updated) throw new Error('Ubicación no encontrada.');
  return updated;
}

export async function deleteLocation(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('locations').delete().eq('id', id);
    if (error) throw error;
    return;
  }
  localStore.remove(id);
}

export function buildImportSummary(locations: LocationRecord[]): ImportSummary {
  return {
    total: locations.length,
    geolocalizadas: locations.filter((l) => l.geolocation_status === 'geolocalizado').length,
    pendientes: locations.filter((l) => l.geolocation_status === 'pendiente').length,
    duplicadasLiterales: locations.filter((l) => l.duplicate_of !== null).length,
    posiblesDuplicadasFisicas: locations.filter((l) => l.possible_physical_duplicate).length,
  };
}
