import type { WashRoute } from '@/types/farmZone';

/**
 * Relación lavadero -> zona de granja con el km ya calculado por la
 * empresa (tabla provista directamente, no recalculado por la app). La
 * columna interna "Rueda" (Norte/Centro/Sur) del archivo original no se usa
 * aquí: es una etiqueta operativa interna de la empresa, no relevante para
 * la relación lavadero-zona en sí.
 */
export const WASH_ROUTES: WashRoute[] = [
  // Edhel Group (L01)
  { locationCode: 'L01', zoneId: 'colan', km: 57 },
  { locationCode: 'L01', zoneId: 'sullana', km: 15 },
  { locationCode: 'L01', zoneId: 'paita', km: 4 },
  { locationCode: 'L01', zoneId: 'olmos', km: 218 },

  // Mendoza (L06)
  { locationCode: 'L06', zoneId: 'colan', km: 286 },
  { locationCode: 'L06', zoneId: 'sullana', km: 236 },
  { locationCode: 'L06', zoneId: 'paita', km: 234 },
  { locationCode: 'L06', zoneId: 'olmos', km: 148 },
  { locationCode: 'L06', zoneId: 'paijan_norte', km: 122 },
  { locationCode: 'L06', zoneId: 'paijan', km: 153 },
  { locationCode: 'L06', zoneId: 'chiquitoy', km: 168 },
  { locationCode: 'L06', zoneId: 'milagro', km: 177 },

  // CONSORCIO JSG (L07)
  { locationCode: 'L07', zoneId: 'paijan_norte', km: 62 },
  { locationCode: 'L07', zoneId: 'paijan', km: 57 },
  { locationCode: 'L07', zoneId: 'chiquitoy', km: 18 },
  { locationCode: 'L07', zoneId: 'milagro', km: 7 },
  { locationCode: 'L07', zoneId: 'quirihuac', km: 32.5 },
  { locationCode: 'L07', zoneId: 'viru', km: 64 },
  { locationCode: 'L07', zoneId: 'guadalupito', km: 129 },
  { locationCode: 'L07', zoneId: 'nepena', km: 180 },
  { locationCode: 'L07', zoneId: 'casma', km: 210 },

  // Yeyson (L08)
  { locationCode: 'L08', zoneId: 'quirihuac', km: 166 },
  { locationCode: 'L08', zoneId: 'viru', km: 101 },
  { locationCode: 'L08', zoneId: 'guadalupito', km: 38 },
  { locationCode: 'L08', zoneId: 'nepena', km: 40 },
  { locationCode: 'L08', zoneId: 'casma', km: 57 },

  // Compañía Andina (L09)
  { locationCode: 'L09', zoneId: 'quirihuac', km: 367 },
  { locationCode: 'L09', zoneId: 'viru', km: 302 },
  { locationCode: 'L09', zoneId: 'guadalupito', km: 240 },
  { locationCode: 'L09', zoneId: 'nepena', km: 207 },
  { locationCode: 'L09', zoneId: 'casma', km: 194 },
];
