import * as vietmapgl from '@vietmap/vietmap-gl-js/dist/vietmap-gl.js';
import type { FeatureCollection, LineString, Polygon } from 'geojson';
import { AlertTriangle, Crosshair, Loader2, MapPinOff, Navigation } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  getVietMapStyleUrl,
  hasVietMapApiKey,
  VIETMAP_CONFIGURATION_MESSAGE,
} from '@/shared/map/vietmapSetup';
import type { SessionCheckpointStatus, TrackingLocationSample } from '../types';
import { checkpointMarkerAppearance, hasValidMapCoordinate } from '../utils/trackingMap';

interface CoordinatorTrackingMapProps {
  checkpoints: SessionCheckpointStatus[];
  currentLocation?: TrackingLocationSample;
  pendingCheckpointIds: string[];
  isGpsTracking: boolean;
  gpsError?: string;
}

const DEFAULT_CENTER: [number, number] = [108.2062, 16.0471];
const ROUTE_SOURCE_ID = 'coordinator-checkpoint-route';
const ROUTE_LAYER_ID = 'coordinator-checkpoint-route-line';
const ACCURACY_SOURCE_ID = 'coordinator-gps-accuracy';
const ACCURACY_FILL_LAYER_ID = 'coordinator-gps-accuracy-fill';
const ACCURACY_LINE_LAYER_ID = 'coordinator-gps-accuracy-line';

function createRouteLine(positions: [number, number][]): FeatureCollection<LineString> {
  return {
    type: 'FeatureCollection',
    features:
      positions.length < 2
        ? []
        : [
            {
              type: 'Feature',
              properties: {},
              geometry: { type: 'LineString', coordinates: positions },
            },
          ],
  };
}

function createAccuracyCircle(
  longitude: number,
  latitude: number,
  radiusMeters: number
): FeatureCollection<Polygon> {
  const earthRadiusMeters = 6_378_137;
  const latitudeRadians = (latitude * Math.PI) / 180;
  const points: [number, number][] = [];

  for (let index = 0; index <= 64; index += 1) {
    const bearing = (index / 64) * Math.PI * 2;
    const latitudeOffset = (radiusMeters / earthRadiusMeters) * Math.cos(bearing);
    const longitudeOffset =
      (radiusMeters / (earthRadiusMeters * Math.cos(latitudeRadians))) * Math.sin(bearing);
    points.push([
      longitude + (longitudeOffset * 180) / Math.PI,
      latitude + (latitudeOffset * 180) / Math.PI,
    ]);
  }

  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: { type: 'Polygon', coordinates: [points] },
      },
    ],
  };
}

function createCheckpointElement(order: number, color: string, fillColor: string): HTMLElement {
  const element = document.createElement('button');
  element.type = 'button';
  element.textContent = String(order);
  element.setAttribute('aria-label', `Checkpoint số ${order}`);
  Object.assign(element.style, {
    alignItems: 'center',
    background: fillColor,
    border: `3px solid ${color}`,
    borderRadius: '9999px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.28)',
    color: '#FFFFFF',
    cursor: 'pointer',
    display: 'flex',
    fontSize: '12px',
    fontWeight: '800',
    height: '30px',
    justifyContent: 'center',
    padding: '0',
    width: '30px',
  });
  return element;
}

function createCurrentLocationElement(): HTMLElement {
  const element = document.createElement('div');
  element.setAttribute('aria-label', 'Vị trí hiện tại của bạn');
  Object.assign(element.style, {
    background: '#2563EB',
    border: '4px solid #FFFFFF',
    borderRadius: '9999px',
    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.45)',
    height: '22px',
    width: '22px',
  });
  return element;
}

function createPopupContent(title: string, lines: string[]): HTMLElement {
  const content = document.createElement('div');
  content.className = 'space-y-1 text-sm';
  const heading = document.createElement('strong');
  heading.textContent = title;
  content.append(heading);
  for (const line of lines) {
    const paragraph = document.createElement('p');
    paragraph.textContent = line;
    content.append(paragraph);
  }
  return content;
}

export function CoordinatorTrackingMap({
  checkpoints,
  currentLocation,
  pendingCheckpointIds,
  isGpsTracking,
  gpsError,
}: CoordinatorTrackingMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<vietmapgl.Map | undefined>(undefined);
  const markerRefs = useRef<vietmapgl.Marker[]>([]);
  const hasFittedRef = useRef(false);
  const [mapReady, setMapReady] = useState(false);
  const [mapLoadFailed, setMapLoadFailed] = useState(false);
  const hasApiKey = hasVietMapApiKey();
  const pendingIds = useMemo(() => new Set(pendingCheckpointIds), [pendingCheckpointIds]);
  const mappedCheckpoints = useMemo(
    () =>
      checkpoints.filter((checkpoint) =>
        hasValidMapCoordinate(checkpoint.latitude, checkpoint.longitude)
      ),
    [checkpoints]
  );
  const hasCurrentLocation = hasValidMapCoordinate(
    currentLocation?.latitude,
    currentLocation?.longitude
  );
  const missingCoordinateCount = checkpoints.length - mappedCheckpoints.length;

  useEffect(() => {
    if (!hasApiKey || !containerRef.current) return;

    const map = new vietmapgl.Map({
      container: containerRef.current,
      style: getVietMapStyleUrl(),
      center: DEFAULT_CENTER,
      zoom: 6,
      maxZoom: 18,
      renderWorldCopies: false,
    });
    mapRef.current = map;
    map.addControl(new vietmapgl.NavigationControl({ showCompass: false }), 'bottom-right');
    map.on('load', () => {
      setMapLoadFailed(false);
      setMapReady(true);
    });
    map.on('error', () => setMapLoadFailed(true));

    return () => {
      markerRefs.current.forEach((marker) => {
        marker.remove();
      });
      markerRefs.current = [];
      map.remove();
      mapRef.current = undefined;
      hasFittedRef.current = false;
    };
  }, [hasApiKey]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    markerRefs.current.forEach((marker) => {
      marker.remove();
    });
    markerRefs.current = [];

    const checkpointPositions: [number, number][] = mappedCheckpoints.map((checkpoint) => [
      checkpoint.longitude as number,
      checkpoint.latitude as number,
    ]);
    const routeData = createRouteLine(checkpointPositions);
    const routeSource = map.getSource(ROUTE_SOURCE_ID) as vietmapgl.GeoJSONSource | undefined;
    if (routeSource) {
      routeSource.setData(routeData);
    } else {
      map.addSource(ROUTE_SOURCE_ID, { type: 'geojson', data: routeData });
      map.addLayer({
        id: ROUTE_LAYER_ID,
        type: 'line',
        source: ROUTE_SOURCE_ID,
        paint: {
          'line-color': '#64748B',
          'line-opacity': 0.65,
          'line-width': 3,
          'line-dasharray': [2, 2],
        },
      });
    }

    for (const checkpoint of mappedCheckpoints) {
      const appearance = checkpointMarkerAppearance(
        checkpoint,
        pendingIds.has(checkpoint.checkpointId)
      );
      const popupLines = [`Trạng thái: ${appearance.label}`];
      if (checkpoint.note) popupLines.push(`Ghi chú: ${checkpoint.note}`);
      const popup = new vietmapgl.Popup({ offset: 20 }).setDOMContent(
        createPopupContent(checkpoint.checkpointName, popupLines)
      );
      const marker = new vietmapgl.Marker({
        element: createCheckpointElement(
          checkpoint.checkpointOrder,
          appearance.color,
          appearance.fillColor
        ),
      })
        .setLngLat([checkpoint.longitude as number, checkpoint.latitude as number])
        .setPopup(popup)
        .addTo(map);
      markerRefs.current.push(marker);
    }

    const allPositions = [...checkpointPositions];
    if (hasCurrentLocation && currentLocation) {
      const currentPosition: [number, number] = [
        currentLocation.longitude,
        currentLocation.latitude,
      ];
      allPositions.push(currentPosition);
      const currentPopupLines = [
        `Cập nhật: ${new Date(currentLocation.recordedAt).toLocaleTimeString('vi-VN')}`,
      ];
      if (currentLocation.accuracyMeters) {
        currentPopupLines.push(
          `Độ chính xác: khoảng ${Math.round(currentLocation.accuracyMeters)} m`
        );
      }
      const marker = new vietmapgl.Marker({ element: createCurrentLocationElement() })
        .setLngLat(currentPosition)
        .setPopup(
          new vietmapgl.Popup({ offset: 18 }).setDOMContent(
            createPopupContent('Vị trí hiện tại của bạn', currentPopupLines)
          )
        )
        .addTo(map);
      markerRefs.current.push(marker);
    }

    const accuracyData: FeatureCollection<Polygon> =
      hasCurrentLocation && currentLocation?.accuracyMeters && currentLocation.accuracyMeters > 0
        ? createAccuracyCircle(
            currentLocation.longitude,
            currentLocation.latitude,
            currentLocation.accuracyMeters
          )
        : { type: 'FeatureCollection', features: [] };
    const accuracySource = map.getSource(ACCURACY_SOURCE_ID) as vietmapgl.GeoJSONSource | undefined;
    if (accuracySource) {
      accuracySource.setData(accuracyData);
    } else {
      map.addSource(ACCURACY_SOURCE_ID, { type: 'geojson', data: accuracyData });
      map.addLayer({
        id: ACCURACY_FILL_LAYER_ID,
        type: 'fill',
        source: ACCURACY_SOURCE_ID,
        paint: { 'fill-color': '#60A5FA', 'fill-opacity': 0.12 },
      });
      map.addLayer({
        id: ACCURACY_LINE_LAYER_ID,
        type: 'line',
        source: ACCURACY_SOURCE_ID,
        paint: { 'line-color': '#2563EB', 'line-width': 2 },
      });
    }

    if (!hasFittedRef.current && allPositions.length > 0) {
      hasFittedRef.current = true;
      if (allPositions.length === 1) {
        map.easeTo({ center: allPositions[0], zoom: 15 });
      } else {
        const bounds = new vietmapgl.LngLatBounds(allPositions[0], allPositions[0]);
        allPositions.slice(1).forEach((position) => {
          bounds.extend(position);
        });
        map.fitBounds(bounds, { padding: 36, maxZoom: 15 });
      }
    }
  }, [currentLocation, hasCurrentLocation, mapReady, mappedCheckpoints, pendingIds]);

  return (
    <section
      className="overflow-hidden rounded-3xl bg-white"
      style={{ border: '1px solid #E6E2D1' }}
    >
      <div className="flex flex-col gap-3 border-b border-[#E6E2D1] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-[#06261D]">
            <Navigation className="h-5 w-5" />
            Bản đồ hành trình
          </h2>
          <p className="mt-0.5 text-xs font-medium text-[#6F7B75]">
            Theo dõi vị trí hiện tại so với các checkpoint của tour.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-[#6F7B75]">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Chưa đến
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Chờ đồng bộ
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500" /> Đã check-in
          </span>
        </div>
      </div>

      <div className="relative min-h-[380px]">
        {hasApiKey ? (
          <div
            ref={containerRef}
            className="h-[380px] w-full"
            role="region"
            aria-label="Bản đồ hành trình và checkpoint"
          />
        ) : (
          <div className="flex h-[380px] items-center justify-center bg-amber-50 p-6 text-center text-amber-800">
            <div className="max-w-sm space-y-2">
              <AlertTriangle className="mx-auto h-7 w-7" />
              <p className="text-sm font-semibold">{VIETMAP_CONFIGURATION_MESSAGE}</p>
            </div>
          </div>
        )}

        {hasApiKey && hasCurrentLocation && currentLocation && (
          <button
            type="button"
            onClick={() =>
              mapRef.current?.easeTo({
                center: [currentLocation.longitude, currentLocation.latitude],
                zoom: Math.max(mapRef.current.getZoom(), 16),
              })
            }
            className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-xs font-bold text-[#06261D] shadow-md"
            title="Đưa bản đồ về vị trí hiện tại"
          >
            <Crosshair className="h-4 w-4" />
            Vị trí của tôi
          </button>
        )}

        {hasApiKey && !hasCurrentLocation && (
          <div className="pointer-events-none absolute left-3 top-3 z-10 inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-[#6F7B75] shadow-md">
            {isGpsTracking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MapPinOff className="h-4 w-4" />
            )}
            {isGpsTracking ? 'Đang chờ vị trí GPS...' : 'Chưa có vị trí hiện tại'}
          </div>
        )}

        {hasApiKey && (mapLoadFailed || gpsError || missingCoordinateCount > 0) && (
          <div className="absolute bottom-3 left-3 right-3 z-10 space-y-1 rounded-xl bg-white/95 px-3 py-2 text-xs font-semibold text-amber-800 shadow-md sm:right-auto">
            {mapLoadFailed && <p>Không thể tải bản đồ VietMap. Dữ liệu GPS vẫn được lưu.</p>}
            {gpsError && <p>{gpsError}</p>}
            {missingCoordinateCount > 0 && (
              <p>{missingCoordinateCount} checkpoint chưa có tọa độ nên không thể hiển thị.</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
