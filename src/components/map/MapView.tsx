import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMap } from 'react-leaflet';
import type { Map as LeafletMap, Marker as LeafletMarker } from 'leaflet';
import { MarkerInfo } from './MarkerInfo';
import { createPinIcon, createZoneIcon, computePixelOffsets } from '@/utils/mapIcons';
import { locationsWithOwnMarker } from '@/utils/duplicates';
import { computeBounds } from '@/utils/geo';
import { FARM_ZONES } from '@/data/farmZones';
import { WASH_ROUTES } from '@/data/washRoutes';
import type { LocationRecord } from '@/types/location';

const DEFAULT_CENTER: [number, number] = [-9.19, -75.02]; // centro aproximado de Perú
const DEFAULT_ZOOM = 5;

function FitBoundsOnData({ locations }: { locations: { latitude: number | null; longitude: number | null }[] }) {
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
  markerColors: Map<string, string>;
}

export function MapView({ locations, selectedId, onSelect, markerColors }: MapViewProps) {
  const markers = useMemo(() => locationsWithOwnMarker(locations), [locations]);
  const pixelOffsets = useMemo(() => computePixelOffsets(markers), [markers]);
  const markerRefs = useRef(new Map<string, LeafletMarker>());
  const mapRef = useRef<LeafletMap | null>(null);

  const selectedLocation = markers.find((loc) => loc.id === selectedId) ?? null;

  const visibleCodes = useMemo(() => new Set(markers.map((loc) => loc.code)), [markers]);

  const allRoutes = useMemo(() => {
    return WASH_ROUTES.filter((route) => visibleCodes.has(route.locationCode))
      .map((route) => ({
        route,
        zone: FARM_ZONES.find((z) => z.id === route.zoneId),
        location: markers.find((m) => m.code === route.locationCode),
      }))
      .filter(
        (r): r is { route: (typeof WASH_ROUTES)[number]; zone: (typeof FARM_ZONES)[number]; location: LocationRecord } =>
          !!r.zone && !!r.location,
      );
  }, [markers, visibleCodes]);

  const activeRoutes = useMemo(
    () => (selectedLocation ? allRoutes.filter((r) => r.route.locationCode === selectedLocation.code) : []),
    [allRoutes, selectedLocation],
  );

  const activeZoneIds = useMemo(() => new Set(activeRoutes.map((r) => r.zone.id)), [activeRoutes]);

  const boundsSource = useMemo(() => {
    if (selectedLocation && activeRoutes.length > 0) {
      return [selectedLocation, ...activeRoutes.map((r) => r.zone)];
    }
    return [...markers, ...FARM_ZONES];
  }, [markers, activeRoutes, selectedLocation]);

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

      <FitBoundsOnData locations={boundsSource} />

      {allRoutes.map(({ route, zone, location }) => {
        const isActive = selectedLocation ? route.locationCode === selectedLocation.code : false;
        const dimmed = selectedLocation !== null && !isActive;

        return (
          <Polyline
            key={`${route.locationCode}-${route.zoneId}`}
            positions={[
              [location.latitude as number, location.longitude as number],
              [zone.latitude, zone.longitude],
            ]}
            pathOptions={{
              color: isActive ? '#0f172a' : '#94a3b8',
              weight: isActive ? 2.5 : 1,
              opacity: dimmed ? 0.15 : isActive ? 0.85 : 0.45,
              dashArray: isActive ? '5 5' : '2 6',
            }}
          >
            <Tooltip direction="center" permanent={isActive} sticky className="!text-xs !font-medium">
              {location.name} → {zone.name}: {route.km} km
            </Tooltip>
          </Polyline>
        );
      })}

      {FARM_ZONES.map((zone) => (
        <Marker key={zone.id} position={[zone.latitude, zone.longitude]} icon={createZoneIcon(activeZoneIds.has(zone.id))}>
          <Popup>
            <div className="max-w-[180px] p-1">
              <p className="text-sm font-semibold text-slate-900">{zone.name}</p>
              <p className="text-xs text-slate-500">Zona de granjas</p>
            </div>
          </Popup>
        </Marker>
      ))}

      {markers.map((loc) => (
        <Marker
          key={loc.id}
          position={[loc.latitude as number, loc.longitude as number]}
          icon={createPinIcon(
            markerColors.get(loc.id) ?? '#475569',
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
