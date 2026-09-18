export interface RoutePoint {
  locationId: string;
  name: string;
  latitude: number;
  longitude: number;
}

export interface RouteResult {
  distanceMeters: number;
  durationSeconds: number;
  /** Polyline codificada (formato Google) para dibujar la ruta en el mapa. */
  polyline: string | null;
  origin: RoutePoint;
  destination: RoutePoint;
  /** URL para abrir la misma ruta directamente en Google Maps. */
  googleMapsUrl: string;
}

export interface RouteRequestError {
  message: string;
  code?: string;
}
