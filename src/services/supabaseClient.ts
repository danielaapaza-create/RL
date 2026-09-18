import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * true cuando existen credenciales reales de Supabase configuradas.
 * La app debe poder ejecutarse en modo desarrollo SIN credenciales: en ese
 * caso se usa el repositorio local (ver services/localStore.ts) en lugar de
 * lanzar errores de conexión.
 */
export const isSupabaseConfigured = Boolean(
  url && anonKey && !url.includes('xxxxxxxxxxxxxxxx') && !anonKey.includes('REEMPLAZA'),
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url, anonKey)
  : null;
