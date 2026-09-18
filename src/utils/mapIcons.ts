import L from 'leaflet';

const BASE_WIDTH = 24;
const BASE_HEIGHT = 32;

/**
 * Pin de marcador dibujado como SVG inline (divIcon), en vez de las imágenes
 * por defecto de Leaflet: evita el problema clásico de rutas de assets rotas
 * al empaquetar con Vite, y permite colorear por categoría igual que antes.
 */
export function createPinIcon(color: string, scale = 1): L.DivIcon {
  const width = Math.round(BASE_WIDTH * scale);
  const height = Math.round(BASE_HEIGHT * scale);

  return L.divIcon({
    className: '',
    html: `<svg width="${width}" height="${height}" viewBox="0 0 ${BASE_WIDTH} ${BASE_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z" fill="${color}" stroke="#1e293b" stroke-width="1.2" />
      <circle cx="12" cy="12" r="4.5" fill="#ffffff" />
    </svg>`,
    iconSize: [width, height],
    iconAnchor: [width / 2, height],
    popupAnchor: [0, -height],
  });
}
