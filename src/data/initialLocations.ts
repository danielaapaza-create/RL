import type { LocationInput } from '@/types/location';

/**
 * Carga inicial de las 9 referencias solicitadas.
 *
 * Cómo se obtuvo cada coordenada:
 * - #1, #2, #3, #6, #7, #8, #9: enlaces cortos de Google Maps, resueltos en el
 *   momento de análisis siguiendo su redirección HTTP (302) hacia la URL larga
 *   de Google Maps, de la que se extrajeron las coordenadas y el nombre del
 *   lugar cuando estaban disponibles. Ninguna coordenada fue inventada.
 * - #4 y #5: coordenadas explícitas ya presentes en el propio enlace (`?q=`).
 *
 * Hallazgos relevantes para la importación (ver utils/duplicates.ts):
 * - Los enlaces #2 y #3 son literalmente idénticos (misma URL).
 * - Al resolver, #1 (Edhel Group) y #2/#3 (Anthony) apuntan a las mismas
 *   coordenadas (-5.6838846, -78.7869977): posible duplicado físico.
 * - #6 y #8 resuelven a las mismas coordenadas (-9.104127, -78.541082):
 *   posible duplicado físico.
 * - #7 y #9 resuelven a las mismas coordenadas (-9.609734, -77.508260):
 *   posible duplicado físico.
 *
 * Ninguno de estos duplicados físicos se fusiona automáticamente: se
 * conservan los 9 registros y se marcan como "posible duplicado" para que
 * un usuario los revise (regla de negocio: nunca eliminar automáticamente
 * ubicaciones que comparten coordenadas).
 */

export interface SeedLocation extends LocationInput {
  /** URL original tal como fue provista, para trazabilidad y detección de duplicados literales. */
  original_url: string;
  /** true si no fue posible resolver coordenadas para este enlace. */
  pending?: boolean;
}

export const INITIAL_LOCATIONS: SeedLocation[] = [
  {
    code: 'L01',
    name: 'Edhel Group',
    original_url: 'https://maps.app.goo.gl/dFWxKu7KvmkwSxeY7',
    latitude: -5.6838846,
    longitude: -78.7869977,
    category: 'punto_entrega',
    description: 'Lavadero. Resuelto desde enlace corto de Google Maps.',
    observations: 'Coincide en coordenadas con los registros L02 (Anthony) y L03 (posible duplicado físico).',
  },
  {
    code: 'L02',
    name: 'Anthony',
    original_url: 'https://goo.gl/maps/MYHaKdSbbAL2',
    latitude: -5.6838846,
    longitude: -78.7869977,
    category: 'punto_entrega',
    description: 'Lavadero. Resuelto desde enlace corto de Google Maps.',
    observations: 'Enlace original idéntico al registro L03.',
  },
  {
    code: 'L03',
    name: 'Anthony (duplicado de L02)',
    original_url: 'https://goo.gl/maps/MYHaKdSbbAL2',
    latitude: -5.6838846,
    longitude: -78.7869977,
    category: 'punto_entrega',
    description: 'Enlace original idéntico al de L02. No genera un marcador independiente en el mapa; se conserva como referencia duplicada.',
    observations: 'Duplicado literal de L02 (misma URL original).',
  },
  {
    code: 'L04',
    name: 'Mi granja, Avícola Abby SAC',
    original_url: 'https://www.google.com/maps?q=-5.7273151,-78.7986693&z=17&hl=es',
    latitude: -5.7273151,
    longitude: -78.7986693,
    category: 'cliente',
    description: 'Lavadero. Coordenadas extraídas directamente del parámetro "q" del enlace.',
  },
  {
    code: 'L05',
    name: 'Soto',
    original_url: 'https://www.google.com/maps?q=-7.1828104,-78.4919801&z=17&hl=es',
    latitude: -7.1828104,
    longitude: -78.4919801,
    category: 'cliente',
    description: 'Lavadero. Coordenadas extraídas directamente del parámetro "q" del enlace.',
  },
  {
    code: 'L06',
    name: 'Mendoza',
    original_url: 'https://maps.app.goo.gl/RDAMK6Jya6Nz56qAA',
    latitude: -9.104127,
    longitude: -78.541082,
    category: 'almacen',
    description: 'Lavadero. Resuelto desde enlace corto de Google Maps.',
    observations: 'Coincide en coordenadas con el registro L08 (Yeyson — posible duplicado físico).',
  },
  {
    code: 'L07',
    name: 'CONSORCIO JSG',
    original_url: 'https://maps.app.goo.gl/Y6A6b62Vz3ChQY5GA',
    latitude: -9.609734,
    longitude: -77.50826,
    category: 'almacen',
    description: 'Lavadero. Resuelto desde enlace corto de Google Maps.',
    observations: 'Coincide en coordenadas con el registro L09 (Compañía Andina — posible duplicado físico).',
  },
  {
    code: 'L08',
    name: 'Yeyson',
    original_url: 'https://maps.app.goo.gl/Qxik1apV1Ya1e8Df6',
    latitude: -9.104127,
    longitude: -78.541082,
    category: 'proveedor',
    description: 'Lavadero. Resuelto desde enlace corto de Google Maps.',
    observations: 'Coincide en coordenadas con el registro L06 (Mendoza — posible duplicado físico).',
  },
  {
    code: 'L09',
    name: 'Compañía Andina',
    original_url: 'https://maps.app.goo.gl/GxdfjQu2yii7AHhR8',
    latitude: -9.609734,
    longitude: -77.50826,
    category: 'proveedor',
    description: 'Lavadero. Resuelto desde enlace corto de Google Maps.',
    observations: 'Coincide en coordenadas con el registro L07 (CONSORCIO JSG — posible duplicado físico).',
  },
];
