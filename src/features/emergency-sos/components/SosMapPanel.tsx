import * as vietmapgl from '@vietmap/vietmap-gl-js/dist/vietmap-gl.js';
import { AlertTriangle, MapPin } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  getVietMapStyleUrl,
  hasVietMapApiKey,
  VIETMAP_CONFIGURATION_MESSAGE,
} from '@/shared/map/vietmapSetup';
import type { SosAlert } from '../types';

interface SosMapPanelProps {
  alert?: SosAlert;
}

function createSosPopupContent(alert: SosAlert): HTMLElement {
  const content = document.createElement('div');
  content.className = 'space-y-1 text-sm';

  const sender = document.createElement('strong');
  sender.textContent = alert.senderName;
  const tour = document.createElement('p');
  tour.textContent = alert.tourName;

  content.append(sender, tour);
  return content;
}

/** Bản đồ SOS dùng SDK và vector tiles chính thức của VietMap. */
export function SosMapPanel({ alert }: SosMapPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapLoadFailed, setMapLoadFailed] = useState(false);
  const hasApiKey = hasVietMapApiKey();

  useEffect(() => {
    if (!alert || !hasApiKey || !containerRef.current) return;

    setMapLoadFailed(false);
    const position: [number, number] = [alert.longitude, alert.latitude];
    const map = new vietmapgl.Map({
      container: containerRef.current,
      style: getVietMapStyleUrl(),
      center: position,
      zoom: 13,
      maxZoom: 18,
      renderWorldCopies: false,
    });

    map.addControl(new vietmapgl.NavigationControl({ showCompass: false }), 'bottom-right');
    map.on('error', () => setMapLoadFailed(true));

    const popup = new vietmapgl.Popup({ offset: 22 }).setDOMContent(createSosPopupContent(alert));
    const marker = new vietmapgl.Marker({ color: '#D32F2F' })
      .setLngLat(position)
      .setPopup(popup)
      .addTo(map);

    return () => {
      marker.remove();
      popup.remove();
      map.remove();
    };
  }, [alert, hasApiKey]);

  if (!alert) {
    return (
      <div
        className="flex h-full min-h-[340px] items-center justify-center rounded-[28px] p-6 text-center"
        style={{ backgroundColor: '#EFECE6' }}
      >
        <p className="text-sm font-semibold" style={{ color: '#6F7B75' }}>
          Chọn một tín hiệu SOS để xem vị trí trên bản đồ.
        </p>
      </div>
    );
  }

  if (!hasApiKey) {
    return (
      <div className="flex min-h-[340px] items-center justify-center rounded-[28px] border border-amber-200 bg-amber-50 p-6 text-center text-amber-800">
        <div className="max-w-sm space-y-2">
          <AlertTriangle className="mx-auto h-7 w-7" />
          <p className="text-sm font-semibold">{VIETMAP_CONFIGURATION_MESSAGE}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden rounded-[28px]"
      style={{ border: '1px solid #E6E2D1' }}
    >
      <div
        className="absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-white shadow-md"
        style={{ backgroundColor: '#D32F2F' }}
      >
        <MapPin className="h-3.5 w-3.5" />
        GPS: {alert.latitude.toFixed(4)}° N, {alert.longitude.toFixed(4)}° E
      </div>
      <div
        ref={containerRef}
        className="h-[340px] w-full"
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
