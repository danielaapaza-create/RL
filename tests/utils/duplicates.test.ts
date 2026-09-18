import { describe, expect, it } from 'vitest';
import { annotateDuplicates, locationsWithOwnMarker } from '@/utils/duplicates';
import type { LocationRecord } from '@/types/location';

function makeLocation(overrides: Partial<LocationRecord>): LocationRecord {
  return {
    id: overrides.id ?? 'id',
    code: overrides.code ?? 'CODE',
    name: overrides.name ?? 'Nombre',
    original_url: overrides.original_url ?? null,
    latitude: overrides.latitude ?? null,
    longitude: overrides.longitude ?? null,
    category: overrides.category ?? 'otro',
    description: overrides.description ?? null,
    observations: overrides.observations ?? null,
    address: overrides.address ?? null,
    geolocation_status: overrides.geolocation_status ?? 'pendiente',
    duplicate_of: overrides.duplicate_of ?? null,
    possible_physical_duplicate: overrides.possible_physical_duplicate ?? false,
    resolution_error: overrides.resolution_error ?? null,
    created_at: overrides.created_at ?? '2026-01-01T00:00:00.000Z',
    updated_at: overrides.updated_at ?? '2026-01-01T00:00:00.000Z',
  };
}

describe('annotateDuplicates', () => {
  it('detecta el enlace idéntico entre los registros 2 y 3 del prompt', () => {
    const locations = [
      makeLocation({ id: 'L02', original_url: 'https://goo.gl/maps/MYHaKdSbbAL2', latitude: -5.68, longitude: -78.78 }),
      makeLocation({ id: 'L03', original_url: 'https://goo.gl/maps/MYHaKdSbbAL2', latitude: -5.68, longitude: -78.78 }),
    ];

    const [l02, l03] = annotateDuplicates(locations);
    expect(l02.duplicate_of).toBeNull();
    expect(l03.duplicate_of).toBe('L02');
  });

  it('marca posibles duplicados físicos cuando coinciden coordenadas con enlaces distintos', () => {
    const locations = [
      makeLocation({ id: 'L06', original_url: 'https://maps.app.goo.gl/aaa', latitude: -9.104127, longitude: -78.541082 }),
      makeLocation({ id: 'L08', original_url: 'https://maps.app.goo.gl/bbb', latitude: -9.104127, longitude: -78.541082 }),
    ];

    const annotated = annotateDuplicates(locations);
    expect(annotated.every((l) => l.possible_physical_duplicate)).toBe(true);
    // Enlaces distintos: no debe marcarse duplicate_of (no es duplicado literal)
    expect(annotated.every((l) => l.duplicate_of === null)).toBe(true);
  });

  it('no marca duplicado físico cuando las coordenadas son distintas', () => {
    const locations = [
      makeLocation({ id: 'A', latitude: -5.7273151, longitude: -78.7986693 }),
      makeLocation({ id: 'B', latitude: -7.1828104, longitude: -78.4919801 }),
    ];
    const annotated = annotateDuplicates(locations);
    expect(annotated.every((l) => !l.possible_physical_duplicate)).toBe(true);
  });

  it('no elimina registros: conserva el total original', () => {
    const locations = [
      makeLocation({ id: '1' }),
      makeLocation({ id: '2' }),
      makeLocation({ id: '3' }),
    ];
    expect(annotateDuplicates(locations)).toHaveLength(3);
  });
});

describe('locationsWithOwnMarker', () => {
  it('excluye duplicados literales y registros sin coordenadas', () => {
    const locations = [
      makeLocation({ id: '1', latitude: -5.68, longitude: -78.78, duplicate_of: null }),
      makeLocation({ id: '2', latitude: -5.68, longitude: -78.78, duplicate_of: '1' }),
      makeLocation({ id: '3', latitude: null, longitude: null, duplicate_of: null }),
    ];
    const withMarker = locationsWithOwnMarker(locations);
    expect(withMarker.map((l) => l.id)).toEqual(['1']);
  });
});
