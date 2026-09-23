import { getSafeImageUrl } from '@/utils/sanitize';
import type { MomentItem, MomentMediaItem } from '../types';

/** Lấy URL ảnh an toàn của một media (API trả về `imageUrl` hoặc `mediaUrl` tùy endpoint). */
export function getMomentMediaUrl(media?: MomentMediaItem): string | undefined {
  return getSafeImageUrl(media?.imageUrl || media?.mediaUrl);
}

/** Khóa React ổn định cho một media trong danh sách. */
export function getMomentMediaKey(media: MomentMediaItem, index: number): string {
  return media.momentMediaId || media.mediaId || `moment-media-${index}`;
}

/** Gom toàn bộ ảnh của các khoảnh khắc thành một album phẳng. */
export function collectMomentMedia(moments: MomentItem[]): MomentMediaItem[] {
  return moments.flatMap((moment) => moment.mediaList ?? []);
}

/** Danh sách URL ảnh hợp lệ của một khoảnh khắc — dùng cho lightbox và gallery. */
export function getMomentImageUrls(moment: MomentItem): string[] {
  return (moment.mediaList ?? [])
    .map((media) => getMomentMediaUrl(media))
    .filter((url): url is string => Boolean(url));
}
