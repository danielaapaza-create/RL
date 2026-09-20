import type { WashStat } from '@/types/washStat';

/**
 * Datos tal como los provee el negocio ("Lavaderos (Incluye CBA)"). Para
 * Anthony (L02) la tabla original traía dos filas con valores distintos
 * (4% / 2,076 jabas y 96% / 50,067 jabas); el usuario confirmó usar la
 * primera fila (4% / 2,076).
 */
export const WASH_STATS: WashStat[] = [
  { locationCode: 'L01', distributePercent: 91, monthlyJabas: 131365 }, // Edhel Group
  { locationCode: 'L02', distributePercent: 4, monthlyJabas: 2076 }, // Anthony
  { locationCode: 'L04', distributePercent: 0, monthlyJabas: 31216 }, // Mi granja, Avícola Abby SAC
  { locationCode: 'L05', distributePercent: 0, monthlyJabas: 54949 }, // Soto
  { locationCode: 'L06', distributePercent: 85, monthlyJabas: 119393 }, // Mendoza
  { locationCode: 'L07', distributePercent: 55, monthlyJabas: 184289 }, // CONSORCIO JSG
  { locationCode: 'L08', distributePercent: 0, monthlyJabas: 42195 }, // Yeyson
  { locationCode: 'L09', distributePercent: 100, monthlyJabas: 62982 }, // Compañía Andina
];
