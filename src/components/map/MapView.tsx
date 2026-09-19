import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import type { Map as LeafletMap, Marker as LeafletMarker } from 'leaflet';
import { MarkerInfo } from './MarkerInfo';
import { createPinIcon, computePixelOffsets } from '@/utils/mapIcons';
import { locationsWithOwnMarker } from '@/utils/duplicates';
import { computeBounds } from '@/utils/geo';
import type { LocationRecord } from '@/types/location';

const CATEGORY_COLOR: Record<string, string> = {
  almacen: '#2563eb',
  cliente: '#16a34a',
  proveedor: '#d97706',
  punto_entrega: '#dc2626',
  oficina: '#7c3aed',
  otro: '#475569',
};

const DEFAULT_CENTER: [number, number] = [-9.19, -75.02]; // centro aproximado de Perú
const DEFAULT_ZOOM = 5;

function FitBoundsOnData({ locations }: { locations: LocationRecord[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    const bounds = computeBounds(locations);
    if (!bounds) return;

    if (bounds.north === bounds.south && bounds.east === bounds.west) {
      map.setView([bounds.north, bounds.east], 14);
      return;
    }

    map.fitBounds(
      [
        [bounds.south, bounds.west],
        [bounds.north, bounds.east],
      ],
      { padding: [64, 64] },
    );
  }, [map, locations]);

  return null;
}

interface MapViewProps {
  locations: LocationRecord[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function MapView({ locations, selectedId, onSelect }: MapViewProps) {
  const markers = useMemo(() => locationsWithOwnMarker(locations), [locations]);
  const pixelOffsets = useMemo(() => computePixelOffsets(markers), [markers]);
  const markerRefs = useRef(new Map<string, LeafletMarker>());
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    if (!selectedId) return;
    markerRefs.current.get(selectedId)?.openPopup();
  }, [selectedId, markers]);

  return (
    <MapContainer
      ref={mapRef}
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitBoundsOnData locations={markers} />

      {markers.map((loc) => (
        <Marker
          key={loc.id}
          position={[loc.latitude as number, loc.longitude as number]}
          icon={createPinIcon(
            CATEGORY_COLOR[loc.category] ?? '#475569',
            loc.id === selectedId ? 1.15 : 1,
            pixelOffsets.get(loc.id) ?? [0, 0],
          )}
          eventHandlers={{ click: () => onSelect(loc.id) }}
          ref={(instance) => {
            if (instance) markerRefs.current.set(loc.id, instance);
            else markerRefs.current.delete(loc.id);
          }}
        >
          <Popup>
            <MarkerInfo location={loc} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
