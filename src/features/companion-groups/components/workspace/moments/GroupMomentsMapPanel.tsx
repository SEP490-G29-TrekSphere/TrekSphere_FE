import * as vietmapgl from '@vietmap/vietmap-gl-js/dist/vietmap-gl.js';
import { AlertCircle, Compass, Expand, Globe, Map as MapIcon, MapPin, Moon } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  getVietMapStyleUrl,
  hasVietMapApiKey,
  type MapStyleType,
  VIETMAP_CONFIGURATION_MESSAGE,
} from '@/shared/map/vietmapSetup';
import type { MomentItem, MomentMapMarker, MomentMediaItem } from '../../../services/momentService';

interface GroupMomentsMapPanelProps {
  markers: MomentMapMarker[];
  moments?: MomentItem[];
  onPreviewImage?: (imageUrl: string) => void;
  onSelectMoment?: (moment: MomentItem) => void;
  className?: string;
}

export function GroupMomentsMapPanel({
  markers,
  moments = [],
  onPreviewImage,
  onSelectMoment,
  className,
}: GroupMomentsMapPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<vietmapgl.Map | null>(null);
  const markersRef = useRef<vietmapgl.Marker[]>([]);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [currentStyle, setCurrentStyle] = useState<MapStyleType>('standard');
  const hasKey = hasVietMapApiKey();

  // Valid markers with numeric coords
  const validMarkers = markers.filter(
    (m) =>
      typeof m.latitude === 'number' &&
      typeof m.longitude === 'number' &&
      !Number.isNaN(m.latitude) &&
      !Number.isNaN(m.longitude)
  );

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((m) => {
      m.remove();
    });
    markersRef.current = [];
  }, []);

  const renderMarkers = useCallback(
    (map: vietmapgl.Map, shouldFit = false) => {
      clearMarkers();
      if (validMarkers.length === 0) return;

      const bounds = new vietmapgl.LngLatBounds();

      // Group markers by coordinate to handle multiple posts at the same location (Spider/Flower offset)
      const coordCountMap = new Map<string, number>();
      const coordIndexMap = new Map<string, number>();

      validMarkers.forEach((m) => {
        const key = `${m.latitude.toFixed(4)},${m.longitude.toFixed(4)}`;
        coordCountMap.set(key, (coordCountMap.get(key) || 0) + 1);
      });

      validMarkers.forEach((m) => {
        const key = `${m.latitude.toFixed(4)},${m.longitude.toFixed(4)}`;
        const totalAtCoord = coordCountMap.get(key) || 1;
        const currentIndex = coordIndexMap.get(key) || 0;
        coordIndexMap.set(key, currentIndex + 1);

        // Apply micro offset if multiple moments share identical GPS
        let renderLng = m.longitude;
        let renderLat = m.latitude;

        if (totalAtCoord > 1) {
          const angle = (2 * Math.PI * currentIndex) / totalAtCoord;
          const offsetRadius = 0.00035; // ~35 meters offset in GPS coords
          renderLng += offsetRadius * Math.cos(angle);
          renderLat += offsetRadius * Math.sin(angle);
        }

        const position: [number, number] = [renderLng, renderLat];
        bounds.extend(position);

        // Find full moment to extract multi-images if available
        const matchedMoment = moments.find((mom) => mom.momentId === m.momentId);
        const mediaList: MomentMediaItem[] = matchedMoment?.mediaList || [];
        const hasMultiple = mediaList.length > 1;

        // Create Custom Marker DOM Element
        const el = document.createElement('div');
        el.className = 'treksphere-map-marker-anchor';
        el.style.width = '44px';
        el.style.height = '48px';
        el.style.cursor = 'pointer';

        el.innerHTML = `
        <div class="marker-card relative flex flex-col items-center select-none">
          <div class="w-10 h-10 rounded-2xl border-2 border-white shadow-xl overflow-hidden bg-zinc-900 transition-transform duration-200 pointer-events-none ${
            selectedMarkerId === m.momentId ? 'ring-3 ring-emerald-500 scale-110' : ''
          }">
            ${
              m.thumbnailUrl
                ? `<img src="${m.thumbnailUrl}" class="w-full h-full object-cover pointer-events-none" alt="Marker thumbnail" />`
                : `<div class="w-full h-full flex items-center justify-center bg-emerald-600 text-white text-xs font-bold pointer-events-none">📍</div>`
            }
          </div>
          ${
            hasMultiple
              ? `<div class="absolute -top-1 -right-1 bg-zinc-900/90 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full border border-white/60 shadow pointer-events-none">
                  +${mediaList.length}
                </div>`
              : ''
          }
          <div class="w-2.5 h-2.5 bg-emerald-600 rotate-45 -mt-1 rounded-xs border-r border-b border-white pointer-events-none"></div>
        </div>
      `;

        // Create Rich Popup DOM Element
        const popupDiv = document.createElement('div');
        popupDiv.className =
          'p-3 max-w-[280px] sm:max-w-[320px] rounded-2xl bg-white text-zinc-900 shadow-2xl space-y-2 select-text font-sans';

        // Render thumbnails row if multiple photos
        let multiPhotosHtml = '';
        if (hasMultiple) {
          multiPhotosHtml = `
          <div class="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
            ${mediaList
              .map((med, idx) => {
                const imgUrl = med.imageUrl || med.mediaUrl || '';
                return `
                <div class="relative shrink-0 w-12 h-12 rounded-lg overflow-hidden border border-zinc-200 cursor-pointer hover:opacity-80 transition" data-idx="${idx}">
                  <img src="${imgUrl}" class="w-full h-full object-cover" alt="Ảnh ${idx + 1}" data-img-url="${imgUrl}" />
                </div>
              `;
              })
              .join('')}
          </div>
        `;
        }

        popupDiv.innerHTML = `
        <div class="space-y-2">
          ${
            m.thumbnailUrl
              ? `<div class="relative w-full aspect-16/10 rounded-xl overflow-hidden bg-zinc-100 group cursor-pointer">
                  <img src="${m.thumbnailUrl}" class="main-popup-img w-full h-full object-cover hover:scale-105 transition duration-300" alt="Main photo" />
                  ${
                    hasMultiple
                      ? `<div class="absolute bottom-1.5 right-1.5 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                          ${mediaList.length} ảnh
                        </div>`
                      : ''
                  }
                </div>`
              : ''
          }
          ${multiPhotosHtml}
          <div>
            <h4 class="font-extrabold text-sm text-zinc-900 line-clamp-1 leading-snug">
              📍 ${m.placeName || m.locationName || 'Tọa độ hành trình'}
            </h4>
            ${
              m.altitude
                ? `<p class="text-[10px] font-bold text-emerald-600 font-mono mt-0.5">🏔 Độ cao: ${m.altitude}</p>`
                : ''
            }
            ${
              m.caption
                ? `<p class="text-[11px] text-zinc-600 line-clamp-2 mt-1 italic">"${m.caption}"</p>`
                : ''
            }
          </div>
          <div class="flex items-center justify-between text-[10px] text-zinc-400 pt-1.5 border-t border-zinc-200">
            <span>👤 ${m.authorName}</span>
            <span>📍 ${m.latitude.toFixed(3)}°, ${m.longitude.toFixed(3)}°</span>
          </div>
          ${
            matchedMoment && onSelectMoment
              ? `<button type="button" class="view-detail-btn w-full mt-1.5 py-1 text-center text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition cursor-pointer border border-emerald-200">
                  Xem chi tiết bài viết & bình luận
                </button>`
              : ''
          }
        </div>
      `;

        // Handle preview clicking on main or mini thumbnails
        if (onPreviewImage) {
          const allThumbImgs = popupDiv.querySelectorAll<HTMLImageElement>('img');
          allThumbImgs.forEach((img) => {
            img.addEventListener('click', () => {
              const url = img.getAttribute('data-img-url') || img.src;
              if (url) onPreviewImage(url);
            });
          });
        }

        // Handle click "Xem chi tiết bài viết"
        if (matchedMoment && onSelectMoment) {
          const detailBtn = popupDiv.querySelector('.view-detail-btn');
          if (detailBtn) {
            detailBtn.addEventListener('click', () => {
              onSelectMoment(matchedMoment);
            });
          }
        }

        const popup = new vietmapgl.Popup({
          offset: 26,
          closeButton: true,
          closeOnClick: false,
          className: 'treksphere-map-popup',
        }).setDOMContent(popupDiv);

        const marker = new vietmapgl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat(position)
          .setPopup(popup)
          .addTo(map);

        el.addEventListener('click', () => {
          setSelectedMarkerId(m.momentId);
          map.flyTo({
            center: position,
            zoom: Math.max(map.getZoom(), 14),
            speed: 1.2,
          });
        });

        markersRef.current.push(marker);
      });

      if (shouldFit && validMarkers.length > 1) {
        map.fitBounds(bounds, {
          padding: { top: 60, bottom: 60, left: 60, right: 60 },
          maxZoom: 16,
        });
      }
    },
    [clearMarkers, validMarkers, moments, selectedMarkerId, onPreviewImage, onSelectMoment]
  );

  useEffect(() => {
    if (!hasKey || !containerRef.current) return;

    // Default center to Vietnam or first marker
    const defaultCenter: [number, number] =
      validMarkers.length > 0
        ? [validMarkers[0].longitude, validMarkers[0].latitude]
        : [105.8342, 21.0278];

    const map = new vietmapgl.Map({
      container: containerRef.current,
      style: getVietMapStyleUrl(currentStyle),
      center: defaultCenter,
      zoom: validMarkers.length > 0 ? 12 : 5,
      maxZoom: 19,
      renderWorldCopies: false,
    });

    map.addControl(new vietmapgl.NavigationControl({ showCompass: true }), 'top-right');

    mapRef.current = map;

    map.on('load', () => {
      renderMarkers(map, true);
    });

    map.on('style.load', () => {
      renderMarkers(map, false);
    });

    return () => {
      clearMarkers();
      map.remove();
      mapRef.current = null;
    };
  }, [hasKey, clearMarkers, renderMarkers, currentStyle, validMarkers]);

  const handleFocusMarker = (marker: MomentMapMarker) => {
    setSelectedMarkerId(marker.momentId);
    if (!mapRef.current) return;

    mapRef.current.flyTo({
      center: [marker.longitude, marker.latitude],
      zoom: 15,
      speed: 1.4,
    });

    // Find and open popup
    const target = markersRef.current.find((m) => {
      const pos = m.getLngLat();
      return (
        Math.abs(pos.lng - marker.longitude) < 0.0001 &&
        Math.abs(pos.lat - marker.latitude) < 0.0001
      );
    });
    if (target) {
      target.togglePopup();
    }
  };

  const handleFitAll = () => {
    if (!mapRef.current || validMarkers.length === 0) return;
    const bounds = new vietmapgl.LngLatBounds();
    validMarkers.forEach((m) => {
      bounds.extend([m.longitude, m.latitude]);
    });
    mapRef.current.fitBounds(bounds, {
      padding: { top: 60, bottom: 60, left: 60, right: 60 },
      maxZoom: 16,
    });
  };

  const handleSwitchStyle = (newStyle: MapStyleType) => {
    if (newStyle === currentStyle) return;
    setCurrentStyle(newStyle);
    if (mapRef.current) {
      try {
        mapRef.current.setStyle(getVietMapStyleUrl(newStyle));
      } catch (err) {
        console.error('Failed to change map style:', err);
      }
    }
  };

  if (!hasKey) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/5 p-8 text-center',
          className
        )}
      >
        <AlertCircle className="h-10 w-10 text-amber-500 mb-3" />
        <h4 className="font-bold text-foreground text-base">Bản đồ VietMap chưa sẵn sàng</h4>
        <p className="mt-1 text-xs text-muted-foreground max-w-md">
          {VIETMAP_CONFIGURATION_MESSAGE}
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative w-full rounded-2xl overflow-hidden border border-border bg-card shadow-sm flex flex-col',
        className
      )}
    >
      {/* Map Header & Controls */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-xl border border-border/80 bg-background/90 backdrop-blur-md px-3 py-1.5 shadow-sm text-xs font-bold text-foreground">
          <MapPin className="h-4 w-4 text-primary" />
          <span>{validMarkers.length} Điểm check-in</span>
        </div>

        {/* Map Layer Style Switcher */}
        <div className="flex items-center rounded-xl border border-border/80 bg-background/90 backdrop-blur-md p-0.5 shadow-sm">
          <button
            type="button"
            onClick={() => handleSwitchStyle('standard')}
            className={cn(
              'flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer',
              currentStyle === 'standard'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
            title="Bản đồ mặc định (Vector)"
          >
            <MapIcon className="h-3 w-3" />
            <span className="hidden sm:inline">Chuẩn</span>
          </button>
          <button
            type="button"
            onClick={() => handleSwitchStyle('satellite')}
            className={cn(
              'flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer',
              currentStyle === 'satellite'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
            title="Bản đồ ảnh Vệ tinh"
          >
            <Globe className="h-3 w-3" />
            <span className="hidden sm:inline">Vệ tinh</span>
          </button>
          <button
            type="button"
            onClick={() => handleSwitchStyle('dark')}
            className={cn(
              'flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer',
              currentStyle === 'dark'
                ? 'bg-zinc-800 text-zinc-100 shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
            title="Bản đồ chế độ Tối (Dark mode)"
          >
            <Moon className="h-3 w-3" />
            <span className="hidden sm:inline">Dark</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleFitAll}
          className="flex items-center gap-1 rounded-xl border border-border/80 bg-background/90 backdrop-blur-md px-2.5 py-1.5 text-xs font-bold text-foreground hover:bg-muted transition shadow-sm cursor-pointer"
          title="Xem toàn bộ các điểm check-in"
        >
          <Expand className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Bao quát</span>
        </button>
      </div>

      {/* Map Canvas */}
      <div ref={containerRef} className="w-full h-[450px] sm:h-[540px] bg-muted" />

      {/* Bottom Horizontal Check-in list for quick jump */}
      {validMarkers.length > 0 && (
        <div className="border-t border-border/80 bg-background/95 backdrop-blur-xs p-2.5">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {validMarkers.map((marker) => {
              const isSelected = selectedMarkerId === marker.momentId;
              return (
                <button
                  type="button"
                  key={marker.momentId}
                  onClick={() => handleFocusMarker(marker)}
                  className={cn(
                    'shrink-0 flex items-center gap-2 rounded-xl border px-3 py-1.5 text-left transition cursor-pointer',
                    isSelected
                      ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                      : 'border-border/70 bg-card hover:bg-muted/70 text-foreground'
                  )}
                >
                  {marker.thumbnailUrl ? (
                    <img
                      src={marker.thumbnailUrl}
                      alt={marker.placeName || 'Check-in'}
                      className="h-7 w-7 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center text-xs">
                      📍
                    </div>
                  )}
                  <div className="max-w-[120px] truncate">
                    <p className="text-xs font-bold truncate">
                      {marker.placeName || marker.locationName || 'Điểm check-in'}
                    </p>
                    {marker.altitude && (
                      <p className="text-[10px] text-emerald-600 font-mono">{marker.altitude}</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State Overlay */}
      {validMarkers.length === 0 && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-xs p-6 text-center">
          <Compass className="h-10 w-10 text-muted-foreground/60 mb-2 animate-spin-slow" />
          <h4 className="font-bold text-foreground text-sm">Chưa có tọa độ GPS nào</h4>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm">
            Các khoảnh khắc được đăng kèm tọa độ GPS sẽ tự động hiển thị trên bản đồ hành trình này.
          </p>
        </div>
      )}
    </div>
  );
}
