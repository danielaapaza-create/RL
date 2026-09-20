/**
 * Zona de granjas a la que un lavadero puede llegar, con la distancia (km)
 * que la empresa ya tiene calculada para esa relación. Es un dato estático
 * del negocio (no editable desde la UI todavía), independiente del modelo
 * de `LocationRecord`.
 */
export interface FarmZone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

/** Relación lavadero -> zona de granja, con el km ya calculado por la empresa. */
export interface WashRoute {
  /** `code` del lavadero (LocationRecord.code), p. ej. "L01". */
  locationCode: string;
  /** id de la zona en FARM_ZONES. */
  zoneId: string;
  km: number;
}
