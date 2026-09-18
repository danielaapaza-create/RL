import type { LocationRecord } from '@/types/location';

/**
 * Almacenamiento local (localStorage) usado cuando Supabase no está
 * configurado, para que la aplicación sea totalmente funcional en modo de
 * desarrollo sin credenciales reales. Expone la misma forma de datos que la
 * tabla `locations` de Supabase, para que locationsService.ts pueda usar
 * cualquiera de los dos backends de forma transparente.
 */

const STORAGE_KEY = 'geologistica.locations.v1';

function readAll(): LocationRecord[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LocationRecord[]) : [];
  } catch {
    return [];
  }
}

function writeAll(records: LocationRecord[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function generateId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const localStore = {
  hasData(): boolean {
    return readAll().length > 0;
  },

  list(): LocationRecord[] {
    return readAll();
  },

  seed(records: LocationRecord[]): void {
    writeAll(records);
  },

  insert(record: Omit<LocationRecord, 'id' | 'created_at' | 'updated_at'>): LocationRecord {
    const now = new Date().toISOString();
    const full: LocationRecord = {
      ...record,
      id: generateId(),
      created_at: now,
      updated_at: now,
    };
    const all = readAll();
    all.push(full);
    writeAll(all);
    return full;
  },

  update(id: string, patch: Partial<LocationRecord>): LocationRecord | null {
    const all = readAll();
    const idx = all.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    const updated: LocationRecord = {
      ...all[idx],
      ...patch,
      updated_at: new Date().toISOString(),
    };
    all[idx] = updated;
    writeAll(all);
    return updated;
  },

  remove(id: string): void {
    writeAll(readAll().filter((r) => r.id !== id));
  },

  replaceAll(records: LocationRecord[]): void {
    writeAll(records);
  },
};
