import * as vietmapgl from '@vietmap/vietmap-gl-js/dist/vietmap-gl.js';
import { AlertTriangle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  getVietMapStyleUrl,
  hasVietMapApiKey,
  VIETMAP_CONFIGURATION_MESSAGE,
} from '@/shared/map/vietmapSetup';
import { getIncidentTypeLabel } from '../../../constants/sos';
import type { SosAlertResponse } from '../../../types/sos';

interface SosLocationMapProps {
  alerts: SosAlertResponse[];
  className?: string;
  heightClassName?: string;
}

function createSosPopupContent(alert: SosAlertResponse): HTMLElement {
  const content = document.createElement('div');
  content.className = 'space-y-1 text-sm';

  const sender = document.createElement('strong');
  sender.textContent = alert.senderName;

  const incident = document.createElement('p');
  incident.textContent = getIncidentTypeLabel(alert.incidentTypeCode);

  const time = document.createElement('p');
  time.className = 'text-xs text-neutral-500';
  time.textContent = new Date(alert.createdAt).toLocaleString('vi-VN');

  const status = document.createElement('span');
  status.className =
    alert.status === 'OPEN'
      ? 'inline-block rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-700'
      : 'inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700';
  status.textContent = alert.status === 'OPEN' ? 'Đang mở' : 'Đã đóng';

  content.append(sender, incident, time, status);
  return content;
}

export function SosLocationMap({
  alerts,
  className,
  heightClassName = 'h-[280px]',
}: SosLocationMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapLoadFailed, setMapLoadFailed] = useState(false);
  const hasApiKey = hasVietMapApiKey();

  const located = alerts.filter(
    (a): a is SosAlertResponse & { latitude: number; longitude: number } =>
      a.latitude != null && a.longitude != null
  );
  const locatedKey = located.map((a) => `${a.sosAlertId}:${a.latitude}:${a.longitude}`).join('|');

  // biome-ignore lint/correctness/useExhaustiveDependencies: locatedKey is a stable proxy for `located`'s contents (id+coords); depending on `located` itself would recreate the map every render since it's a new array each time
  useEffect(() => {
    if (!hasApiKey || !containerRef.current || located.length === 0) return;

    setMapLoadFailed(false);
    const first: [number, number] = [located[0].longitude, located[0].latitude];
    const map = new vietmapgl.Map({
      container: containerRef.current,
      style: getVietMapStyleUrl(),
      center: first,
      zoom: 13,
      maxZoom: 18,
      renderWorldCopies: false,
    });

    map.addControl(new vietmapgl.NavigationControl({ showCompass: false }), 'bottom-right');
    map.on('error', () => setMapLoadFailed(true));

    const markers = located.map((alert) => {
      const position: [number, number] = [alert.longitude, alert.latitude];
      const popup = new vietmapgl.Popup({ offset: 22 }).setDOMContent(createSosPopupContent(alert));
      return new vietmapgl.Marker({ color: '#D32F2F' })
        .setLngLat(position)
        .setPopup(popup)
        .addTo(map);
    });

    if (located.length > 1) {
      map.on('load', () => {
        const bounds = new vietmapgl.LngLatBounds();
        located.forEach((alert) => {
          bounds.extend([alert.longitude, alert.latitude]);
        });
        map.fitBounds(bounds, { padding: 48, maxZoom: 15 });
      });
    }

    return () => {
      markers.forEach((marker) => {
        marker.remove();
      });
      map.remove();
    };
  }, [hasApiKey, locatedKey]);

  if (located.length === 0) {
    return (
      <div
        className={`flex min-h-[180px] items-center justify-center rounded-2xl border border-border bg-muted/40 p-4 text-center ${className ?? ''}`}
      >
        <p className="text-xs font-medium text-muted-foreground">
          Không có dữ liệu vị trí cho tín hiệu SOS này.
        </p>
      </div>
    );
  }

  if (!hasApiKey) {
    return (
      <div
        className={`flex min-h-[180px] items-center justify-center rounded-2xl border border-amber-300 bg-amber-50 p-4 text-center text-amber-800 ${className ?? ''}`}
      >
        <div className="max-w-sm space-y-1.5">
          <AlertTriangle className="mx-auto h-5 w-5" />
          <p className="text-xs font-semibold">{VIETMAP_CONFIGURATION_MESSAGE}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-border ${className ?? ''}`}>
      <div
        ref={containerRef}
        className={`w-full ${heightClassName}`}
        role="region"
        aria-label="Bản đồ vị trí SOS"
      />
      {mapLoadFailed && (
        <div className="absolute bottom-3 left-3 right-3 z-10 rounded-xl bg-white/95 px-3 py-2 text-xs font-semibold text-amber-800 shadow-md">
          Không thể tải bản đồ VietMap. Vui lòng kiểm tra API key hoặc kết nối mạng.
        </div>
      )}
    </div>
  );
}
