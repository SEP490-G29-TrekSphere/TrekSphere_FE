import '@vietmap/vietmap-gl-js/dist/vietmap-gl.css';

const vietMapApiKey = import.meta.env.VITE_VIETMAP_API_KEY?.trim() ?? '';

export const VIETMAP_CONFIGURATION_MESSAGE =
  'Chưa cấu hình VITE_VIETMAP_API_KEY nên không thể tải bản đồ VietMap.';

export function hasVietMapApiKey(): boolean {
  return vietMapApiKey.length > 0;
}

export function getVietMapStyleUrl(): string {
  if (!hasVietMapApiKey()) throw new Error(VIETMAP_CONFIGURATION_MESSAGE);
  return `https://maps.vietmap.vn/maps/styles/tm/style.json?apikey=${encodeURIComponent(vietMapApiKey)}`;
}
