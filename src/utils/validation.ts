import { isValidLatLng } from './googleMapsLink';
import type { LocationInput } from '@/types/location';

export interface ValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof LocationInput, string>>;
}

/**
 * Valida el formulario de ubicación antes de enviarlo a la capa de datos.
 * Reglas:
 *  - Nombre y código son obligatorios.
 *  - Si se ingresa latitud, debe ingresarse longitud (y viceversa).
 *  - Latitud entre -90 y 90; longitud entre -180 y 180.
 *  - El enlace, si se ingresa, debe ser una URL válida.
 */
export function validateLocationInput(input: LocationInput): ValidationResult {
  const errors: ValidationResult['errors'] = {};

  if (!input.name || input.name.trim().length < 2) {
    errors.name = 'El nombre debe tener al menos 2 caracteres.';
  }

  if (!input.code || input.code.trim().length < 2) {
    errors.code = 'El código debe tener al menos 2 caracteres.';
  }

  const hasLat = input.latitude !== null && input.latitude !== undefined;
  const hasLng = input.longitude !== null && input.longitude !== undefined;

  if (hasLat !== hasLng) {
    errors.latitude = 'Debes indicar latitud y longitud juntas, o dejar ambas vacías.';
    errors.longitude = errors.latitude;
  } else if (hasLat && hasLng) {
    if (!isValidLatLng(input.latitude as number, input.longitude as number)) {
      errors.latitude = 'Latitud debe estar entre -90 y 90, y longitud entre -180 y 180.';
      errors.longitude = errors.latitude;
    }
  }

  if (input.original_url) {
    try {
      void new URL(input.original_url);
    } catch {
      errors.original_url = 'El enlace no es una URL válida.';
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
