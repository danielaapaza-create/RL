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

/**
 * Colores de estado (good/warning/critical) según el rango de distancia
 * acordado con el negocio. Son los colores de estado reservados del skill
 * de dataviz (nunca reusados como color categórico), que ya vienen
 * validados para leerse bien sobre el fondo del mapa.
 */
const DISTANCE_RANGES = [
  { max: 90, color: '#0ca30c', label: '≤ 90 km' },
  { max: 150, color: '#fab219', label: '91 – 150 km' },
  { max: Infinity, color: '#d03b3b', label: '≥ 151 km' },
] as const;

function lineColorForKm(km: number): string {
  return (DISTANCE_RANGES.find((range) => km <= range.max) ?? DISTANCE_RANGES[DISTANCE_RANGES.length - 1]).color;
}

function DistanceLegend() {
  return (
    <div className="absolute right-3 top-3 z-[1000] overflow-hidden rounded-md border border-slate-200 bg-white text-xs shadow-lg">
      <div className="bg-slate-800 px-3 py-1.5 text-center text-[11px] font-semibold uppercase tracking-wide text-white">
        Rango de distancia (km)
      </div>
      <div className="flex flex-col gap-2 p-2.5">
        {DISTANCE_RANGES.map((range) => (
          <div key={range.label} className="flex items-center gap-2">
            <svg width="26" height="10" viewBox="0 0 26 10" aria-hidden="true">
              <line x1="1" y1="5" x2="19" y2="5" stroke={range.color} strokeWidth="3" strokeDasharray="4 3" />
              <polygon points="18,1.5 25,5 18,8.5" fill={range.color} />
            </svg>
            <span className="text-slate-700">{range.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

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

      {allRoutes.length > 0 && <DistanceLegend />}

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
              color: lineColorForKm(route.km),
              weight: isActive ? 3.5 : 2,
              opacity: isActive ? 1 : dimmed ? 0.4 : 0.75,
              dashArray: '6 6',
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
