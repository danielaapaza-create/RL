/**
 * Métricas de distribución y lavado por lavadero, provistas directamente
 * por el negocio (no calculadas por la app, salvo "Recoge" que es el
 * diferencial de "Distribuye": 100 - distributePercent).
 */
export interface WashStat {
  /** `code` del lavadero (LocationRecord.code), p. ej. "L01". */
  locationCode: string;
  /** Mix % Distribuye. */
  distributePercent: number;
  /** Promedio mensual de jabas lavadas. */
  monthlyJabas: number;
}
