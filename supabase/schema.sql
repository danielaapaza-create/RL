-- =============================================================================
-- GeoLogística — Modelo de datos (Supabase / PostgreSQL)
-- Ejecutar en el SQL editor del proyecto de Supabase, o vía `supabase db push`.
-- =============================================================================

create extension if not exists "pgcrypto";

create type geolocation_status as enum (
  'geolocalizado',
  'pendiente',
  'requiere_revision'
);

create type location_category as enum (
  'almacen',
  'cliente',
  'proveedor',
  'punto_entrega',
  'oficina',
  'otro'
);

create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  original_url text,
  latitude double precision,
  longitude double precision,
  category location_category not null default 'otro',
  description text,
  observations text,
  address text,
  geolocation_status geolocation_status not null default 'pendiente',
  duplicate_of uuid references public.locations (id) on delete set null,
  possible_physical_duplicate boolean not null default false,
  resolution_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint latitude_range check (
    latitude is null or (latitude >= -90 and latitude <= 90)
  ),
  constraint longitude_range check (
    longitude is null or (longitude >= -180 and longitude <= 180)
  ),
  -- Las ubicaciones pendientes no deben tener coordenadas; las geolocalizadas sí.
  constraint pending_has_no_coords check (
    geolocation_status <> 'pendiente' or (latitude is null and longitude is null)
  ),
  constraint geolocated_has_coords check (
    geolocation_status = 'pendiente' or (latitude is not null and longitude is not null)
  )
);

comment on table public.locations is 'Ubicaciones logísticas registradas en GeoLogística.';
comment on column public.locations.duplicate_of is 'Referencia a otro registro cuando el enlace original es idéntico (evita duplicar marcadores, conserva el registro).';
comment on column public.locations.possible_physical_duplicate is 'true si sus coordenadas coinciden con las de otro registro con enlace distinto; no se elimina automáticamente.';

-- Índices de apoyo para búsqueda y filtros
create index if not exists locations_category_idx on public.locations (category);
create index if not exists locations_status_idx on public.locations (geolocation_status);
create index if not exists locations_name_trgm_idx on public.locations using gin (name gin_trgm_ops);
create extension if not exists pg_trgm;

-- Trigger para mantener updated_at al día
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists locations_set_updated_at on public.locations;
create trigger locations_set_updated_at
  before update on public.locations
  for each row execute function public.set_updated_at();

-- Detección de posibles duplicados físicos (misma coordenada, distinto registro).
-- Se ejecuta bajo demanda desde la app (no como trigger) para evitar costos en
-- cada escritura; ver src/services/locationsService.ts -> refreshDuplicateFlags.
create or replace function public.mark_physical_duplicates()
returns void as $$
begin
  update public.locations l
  set possible_physical_duplicate = exists (
    select 1 from public.locations o
    where o.id <> l.id
      and o.latitude = l.latitude
      and o.longitude = l.longitude
      and l.latitude is not null
      and l.longitude is not null
  );
end;
$$ language plpgsql;
