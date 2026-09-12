import '@vietmap/vietmap-gl-js/dist/vietmap-gl.css';

const vietMapApiKey = import.meta.env.VITE_VIETMAP_API_KEY?.trim() ?? '';

export const VIETMAP_CONFIGURATION_MESSAGE =
  'Chưa cấu hình VITE_VIETMAP_API_KEY trong file .env nên không thể tải bản đồ VietMap.';

export function hasVietMapApiKey(): boolean {
  return vietMapApiKey.length > 0;
}

export type MapStyleType = 'standard' | 'satellite' | 'dark' | 'light';

export const MAP_STYLE_OPTIONS: { id: MapStyleType; label: string; iconName: string }[] = [
  { id: 'standard', label: 'Tiêu chuẩn', iconName: 'Map' },
  { id: 'satellite', label: 'Vệ tinh', iconName: 'Satellite' },
  { id: 'dark', label: 'Bản đồ Tối', iconName: 'Moon' },
  { id: 'light', label: 'Bản đồ Sáng', iconName: 'Sun' },
];

export function getVietMapStyleUrl(styleType: MapStyleType = 'standard'): string | object {
  if (!hasVietMapApiKey()) throw new Error(VIETMAP_CONFIGURATION_MESSAGE);

  if (styleType === 'satellite') {
    // High-resolution satellite raster layer
    return {
      version: 8,
      sources: {
        'satellite-tiles': {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          ],
          tileSize: 256,
          attribution:
            'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
          maxzoom: 19,
        },
      },
      layers: [
        {
          id: 'satellite-layer',
          type: 'raster',
          source: 'satellite-tiles',
          minzoom: 0,
          maxzoom: 22,
        },
      ],
    };
  }

  if (styleType === 'dark') {
    return `https://maps.vietmap.vn/maps/styles/dark/style.json?apikey=${encodeURIComponent(vietMapApiKey)}`;
  }

  if (styleType === 'light') {
    return `https://maps.vietmap.vn/maps/styles/light/style.json?apikey=${encodeURIComponent(vietMapApiKey)}`;
  }

  // Default 'standard' VietMap vector style
  return `https://maps.vietmap.vn/maps/styles/tm/style.json?apikey=${encodeURIComponent(vietMapApiKey)}`;
}
