import { useEffect, useMemo, useState } from 'react';
import { APIProvider, AdvancedMarker, Map, Pin, useMap } from '@vis.gl/react-google-maps';
import { MarkerInfo } from './MarkerInfo';
import { locationsWithOwnMarker } from '@/utils/duplicates';
import { computeBounds } from '@/utils/geo';
import { getGoogleMapsBrowserKey } from '@/hooks/useGoogleMaps';
import type { LocationRecord } from '@/types/location';

const CATEGORY_COLOR: Record<string, string> = {
  almacen: '#2563eb',
  cliente: '#16a34a',
  proveedor: '#d97706',
  punto_entrega: '#dc2626',
  oficina: '#7c3aed',
  otro: '#475569',
};

const DEFAULT_CENTER = { lat: -9.19, lng: -75.02 }; // centro aproximado de Perú
const DEFAULT_ZOOM = 5;

function FitBoundsOnData({ locations }: { locations: LocationRecord[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    const bounds = computeBounds(locations);
    if (!bounds) return;

    if (bounds.north === bounds.south && bounds.east === bounds.west) {
      map.setCenter({ lat: bounds.north, lng: bounds.east });
      map.setZoom(14);
      return;
    }

    map.fitBounds(
      {
        north: bounds.north,
        south: bounds.south,
        east: bounds.east,
        west: bounds.west,
      },
      64,
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
  const apiKey = getGoogleMapsBrowserKey();
  const [openInfoId, setOpenInfoId] = useState<string | null>(null);

  const markers = useMemo(() => locationsWithOwnMarker(locations), [locations]);

  useEffect(() => {
    if (selectedId) setOpenInfoId(selectedId);
  }, [selectedId]);

  if (!apiKey) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 bg-slate-100 p-8 text-center">
        <p className="text-lg font-medium text-slate-700">El mapa de Google no está configurado</p>
        <p className="max-w-md text-sm text-slate-500">
          Define <code className="rounded bg-slate-200 px-1.5 py-0.5 text-xs">VITE_GOOGLE_MAPS_BROWSER_KEY</code> en
          tu archivo <code className="rounded bg-slate-200 px-1.5 py-0.5 text-xs">.env</code> para visualizar el mapa
          interactivo. Mientras tanto, puedes gestionar ubicaciones desde el listado y el panel de detalle.
        </p>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        mapId={import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || undefined}
        defaultCenter={DEFAULT_CENTER}
        defaultZoom={DEFAULT_ZOOM}
        gestureHandling="greedy"
        disableDefaultUI={false}
        className="h-full w-full"
      >
        <FitBoundsOnData locations={markers} />

        {markers.map((loc) => (
          <AdvancedMarker
            key={loc.id}
            position={{ lat: loc.latitude as number, lng: loc.longitude as number }}
            onClick={() => {
              onSelect(loc.id);
              setOpenInfoId(loc.id);
            }}
          >
            <Pin
              background={CATEGORY_COLOR[loc.category] ?? '#475569'}
              borderColor="#1e293b"
              glyphColor="#ffffff"
              scale={loc.id === selectedId ? 1.15 : 1}
            />
          </AdvancedMarker>
        ))}

        {markers
          .filter((loc) => loc.id === openInfoId)
          .map((loc) => (
            <MarkerInfo key={loc.id} location={loc} onClose={() => setOpenInfoId(null)} />
          ))}
      </Map>
    </APIProvider>
  );
}
