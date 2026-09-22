import { getSafeImageUrl } from '@/utils/sanitize';
import type { MomentItem, MomentMediaItem } from '../types';

export function getMomentMediaUrl(media?: MomentMediaItem): string | undefined {
  return getSafeImageUrl(media?.imageUrl || media?.mediaUrl);
}

export function getMomentMediaKey(media: MomentMediaItem, index: number): string {
  return media.momentMediaId || media.mediaId || `moment-media-${index}`;
}

export function collectMomentMedia(moments: MomentItem[]): MomentMediaItem[] {
  return moments.flatMap((moment) => moment.mediaList ?? []);
}

export function getMomentImageUrls(moment: MomentItem): string[] {
  return (moment.mediaList ?? [])
    .map((media) => getMomentMediaUrl(media))
    .filter((url): url is string => Boolean(url));
}
