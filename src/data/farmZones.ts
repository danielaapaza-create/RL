import type { FarmZone } from '@/types/farmZone';

/**
 * Zonas de granjas a las que llegan los lavaderos. Coordenadas obtenidas de
 * fuentes geográficas públicas (Wikipedia, geodatos.net, deperu.com) para
 * cada localidad, salvo "Paiján Norte" y "Milagro" que provienen de enlaces
 * de Google Maps confirmados directamente por el usuario. Ninguna coordenada
 * fue inventada.
 *
 * "Paiján Norte" no tiene un centro poblado propio distinto de Paiján (es un
 * sector interno de la empresa dentro del mismo distrito): usa el mismo
 * punto que "Paiján" hasta que se confirme una ubicación distinta.
 */
export const FARM_ZONES: FarmZone[] = [
  { id: 'colan', name: 'Colán', latitude: -5.00631, longitude: -81.05888 },
  { id: 'sullana', name: 'Sullana', latitude: -4.90389, longitude: -80.68528 },
  { id: 'paita', name: 'Paita', latitude: -5.08917, longitude: -81.11444 },
  { id: 'olmos', name: 'Olmos', latitude: -5.98472, longitude: -79.74528 },
  { id: 'paijan_norte', name: 'Paiján Norte', latitude: -7.7341853, longitude: -79.3028999 },
  { id: 'paijan', name: 'Paiján', latitude: -7.7341853, longitude: -79.3028999 },
  { id: 'chiquitoy', name: 'Chiquitoy', latitude: -7.7336472, longitude: -79.00695 },
  { id: 'milagro', name: 'Milagro', latitude: -8.0230466, longitude: -79.0673302 },
  { id: 'quirihuac', name: 'Quirihuac', latitude: -8.06605815, longitude: -78.86157065 },
  { id: 'viru', name: 'Virú', latitude: -8.4143306, longitude: -78.7523611 },
  { id: 'guadalupito', name: 'Guadalupito', latitude: -8.9511861, longitude: -78.6248639 },
  { id: 'nepena', name: 'Nepeña', latitude: -9.17222, longitude: -78.35861 },
  { id: 'casma', name: 'Casma', latitude: -9.47417, longitude: -78.31056 },
];
