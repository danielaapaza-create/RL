import L from 'leaflet';

const BASE_WIDTH = 24;
const BASE_HEIGHT = 32;

/**
 * Paleta categórica de 8 colores (ver skill de dataviz, references/palette.md),
 * asignada en orden fijo — nunca ciclada al azar por sesión — para que cada
 * ubicación tenga siempre el mismo color entre recargas.
 *
 * Nota de accesibilidad: validada con `validate_palette.js`, los 8 colores a
 * la vez (contexto "todos contra todos", como puntos en un mapa) no superan
 * el piso de distinción para daltonismo — el propio skill documenta que solo
 * garantiza 3 colores simultáneos en ese escenario. Por eso el nombre de cada
 * ubicación siempre está disponible (lista lateral, popup al hacer clic): el
 * color es una ayuda visual adicional, nunca el único identificador.
 */
const CATEGORICAL_PALETTE = [
  '#2a78d6', // azul
  '#eb6834', // naranja
  '#1baf7a', // aqua
  '#eda100', // amarillo
  '#e87ba4', // magenta
  '#008300', // verde
  '#4a3aa7', // violeta
  '#e34948', // rojo
];

/**
 * Asigna un color fijo por ubicación (una por lavadero), en un orden estable
 * que no cambia con filtros/búsqueda: se calcula sobre el conjunto completo
 * de ubicaciones con marcador propio (excluye duplicados literales),
 * ordenado por código.
 */
export function assignMarkerColors<T extends { id: string; code: string; duplicate_of: string | null }>(
  locations: T[],
): Map<string, string> {
  const eligible = locations
    .filter((loc) => loc.duplicate_of === null)
    .slice()
    .sort((a, b) => a.code.localeCompare(b.code));

  const colors = new Map<string, string>();
  eligible.forEach((loc, index) => {
    colors.set(loc.id, CATEGORICAL_PALETTE[index % CATEGORICAL_PALETTE.length]);
  });
  return colors;
}

/**
 * Pin de marcador dibujado como SVG inline (divIcon), en vez de las imágenes
 * por defecto de Leaflet: evita el problema clásico de rutas de assets rotas
 * al empaquetar con Vite, y permite colorear por categoría igual que antes.
 *
 * `pixelOffset` desplaza el ícono en pantalla (no la posición geográfica
 * real del marcador) mediante `iconAnchor`, un truco para separar
 * visualmente pines que comparten exactamente las mismas coordenadas —
 * el desplazamiento se mantiene constante en píxeles sin importar el zoom.
 */
export function createPinIcon(color: string, scale = 1, pixelOffset: [number, number] = [0, 0]): L.DivIcon {
  const width = Math.round(BASE_WIDTH * scale);
  const height = Math.round(BASE_HEIGHT * scale);
  const [dx, dy] = pixelOffset;

  return L.divIcon({
    className: '',
    html: `<svg width="${width}" height="${height}" viewBox="0 0 ${BASE_WIDTH} ${BASE_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z" fill="${color}" stroke="#1e293b" stroke-width="1.2" />
      <circle cx="12" cy="12" r="4.5" fill="#ffffff" />
    </svg>`,
    iconSize: [width, height],
    iconAnchor: [width / 2 - dx, height - dy],
    popupAnchor: [0, -height],
  });
}

/**
 * Calcula un desplazamiento en píxeles por ubicación, para separar
 * visualmente marcadores que comparten coordenadas idénticas (posibles
 * duplicados físicos): los reparte en un pequeño círculo alrededor del
 * punto real, en vez de dibujarlos uno encima del otro.
 */
export function computePixelOffsets<T extends { id: string; latitude: number | null; longitude: number | null }>(
  locations: T[],
): Map<string, [number, number]> {
  const groups = new Map<string, string[]>();
  for (const loc of locations) {
    if (loc.latitude === null || loc.longitude === null) continue;
    const key = `${loc.latitude.toFixed(6)},${loc.longitude.toFixed(6)}`;
    const ids = groups.get(key) ?? [];
    ids.push(loc.id);
    groups.set(key, ids);
  }

  const offsets = new Map<string, [number, number]>();
  for (const ids of groups.values()) {
    const n = ids.length;
    if (n === 1) {
      offsets.set(ids[0], [0, 0]);
      continue;
    }
    const radius = 12 + Math.min(n, 6) * 2;
    ids.forEach((id, i) => {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2;
      offsets.set(id, [Math.round(radius * Math.cos(angle)), Math.round(radius * Math.sin(angle))]);
    });
  }
  return offsets;
}
