import { describe, expect, it } from 'vitest';
import { validateLocationInput } from '@/utils/validation';
import type { LocationInput } from '@/types/location';

function baseInput(overrides: Partial<LocationInput> = {}): LocationInput {
  return {
    code: 'L10',
    name: 'Almacén de prueba',
    category: 'almacen',
    ...overrides,
  };
}

describe('validateLocationInput', () => {
  it('acepta un formulario válido sin coordenadas (pendiente)', () => {
    const result = validateLocationInput(baseInput());
    expect(result.valid).toBe(true);
  });

  it('acepta un formulario válido con coordenadas dentro de rango', () => {
    const result = validateLocationInput(baseInput({ latitude: -12.05, longitude: -77.03 }));
    expect(result.valid).toBe(true);
  });

  it('rechaza nombre vacío', () => {
    const result = validateLocationInput(baseInput({ name: '' }));
    expect(result.valid).toBe(false);
    expect(result.errors.name).toBeDefined();
  });

  it('rechaza código vacío', () => {
    const result = validateLocationInput(baseInput({ code: '' }));
    expect(result.valid).toBe(false);
    expect(result.errors.code).toBeDefined();
  });

  it('rechaza latitud fuera de rango (-90 a 90)', () => {
    const result = validateLocationInput(baseInput({ latitude: 120, longitude: -77 }));
    expect(result.valid).toBe(false);
    expect(result.errors.latitude).toBeDefined();
  });

  it('rechaza longitud fuera de rango (-180 a 180)', () => {
    const result = validateLocationInput(baseInput({ latitude: -12, longitude: 200 }));
    expect(result.valid).toBe(false);
    expect(result.errors.longitude).toBeDefined();
  });

  it('rechaza latitud sin longitud (deben ir juntas o ambas vacías)', () => {
    const result = validateLocationInput(baseInput({ latitude: -12 }));
    expect(result.valid).toBe(false);
  });

  it('rechaza un enlace original que no es una URL válida', () => {
    const result = validateLocationInput(baseInput({ original_url: 'no-es-url' }));
    expect(result.valid).toBe(false);
    expect(result.errors.original_url).toBeDefined();
  });
});
