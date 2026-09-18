export interface RoutePoint {
  locationId: string;
  name: string;
  latitude: number;
  longitude: number;
}

export interface RouteResult {
  distanceMeters: number;
  durationSeconds: number;
  /** Puntos del trazado de la ruta, listos para dibujar como polilínea. */
  path: { lat: number; lng: number }[];
  origin: RoutePoint;
  destination: RoutePoint;
  /** URL para abrir la misma ruta en Google Maps (solo enlace, no usa ninguna API). */
  externalMapsUrl: string;
}

export interface RouteRequestError {
  message: string;
  code?: string;
}
