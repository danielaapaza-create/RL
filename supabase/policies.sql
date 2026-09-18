-- =============================================================================
-- GeoLogística — Políticas de acceso (Row Level Security)
-- =============================================================================
-- Este proyecto se entrega como base de una sola organización/usuario final.
-- Las políticas de ejemplo permiten lectura y escritura solo a usuarios
-- autenticados de Supabase. Ajusta según tu modelo de autenticación real
-- (por ejemplo, restringiendo por columna `owner_id` si hay múltiples clientes).

alter table public.locations enable row level security;

-- Lectura: cualquier usuario autenticado puede leer todas las ubicaciones.
drop policy if exists "locations_select_authenticated" on public.locations;
create policy "locations_select_authenticated"
  on public.locations for select
  to authenticated
  using (true);

-- Inserción: cualquier usuario autenticado puede crear ubicaciones.
drop policy if exists "locations_insert_authenticated" on public.locations;
create policy "locations_insert_authenticated"
  on public.locations for insert
  to authenticated
  with check (true);

-- Actualización: cualquier usuario autenticado puede editar ubicaciones.
drop policy if exists "locations_update_authenticated" on public.locations;
create policy "locations_update_authenticated"
  on public.locations for update
  to authenticated
  using (true)
  with check (true);

-- Eliminación: cualquier usuario autenticado puede eliminar ubicaciones.
drop policy if exists "locations_delete_authenticated" on public.locations;
create policy "locations_delete_authenticated"
  on public.locations for delete
  to authenticated
  using (true);

-- NOTA DE SEGURIDAD:
-- Si el frontend usará la app sin autenticación de usuarios (modo interno/demo),
-- reemplaza `to authenticated` por `to anon` únicamente en un entorno controlado
-- y nunca en producción con datos sensibles. La clave "service_role" jamás debe
-- usarse en el frontend: solo dentro de supabase/functions (Edge Functions).
