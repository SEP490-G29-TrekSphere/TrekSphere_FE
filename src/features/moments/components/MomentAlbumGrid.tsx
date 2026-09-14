import { ImageIcon } from 'lucide-react';
import { formatDate } from '@/utils/format';
import type { MomentMediaItem } from '../types';
import { getMomentMediaKey, getMomentMediaUrl } from '../utils/momentMedia';
import { MomentEmptyState } from './MomentEmptyState';
import { MomentsLoading } from './MomentsLoading';

interface MomentAlbumGridProps {
  media: MomentMediaItem[];
  isLoading: boolean;
  emptyDescription: string;
  /** Mở lightbox tại đúng vị trí ảnh được bấm. */
  onSelectImage: (index: number) => void;
}

/** Lưới ảnh gom từ toàn bộ khoảnh khắc. */
export function MomentAlbumGrid({
  media,
  isLoading,
  emptyDescription,
  onSelectImage,
}: MomentAlbumGridProps) {
  if (isLoading) return <MomentsLoading />;

  const items = media
    .map((item, index) => ({ item, index, url: getMomentMediaUrl(item) }))
    .filter((entry): entry is { item: MomentMediaItem; index: number; url: string } =>
      Boolean(entry.url)
    );

  if (items.length === 0) {
    return (
      <MomentEmptyState icon={ImageIcon} title="Album ảnh trống" description={emptyDescription} />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {items.map(({ item, url }, position) => (
        <button
          type="button"
          key={getMomentMediaKey(item, position)}
          onClick={() => onSelectImage(position)}
          className="group relative aspect-square cursor-pointer overflow-hidden rounded-xl border border-border bg-black/10 p-0 text-left shadow-2xs transition hover:shadow-md"
        >
          <img
            src={url}
            alt={`Ảnh khoảnh khắc ${position + 1}`}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
          {item.createdAt ? (
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 via-transparent to-transparent p-2.5 text-white opacity-0 transition group-hover:opacity-100">
              <p className="text-[10px] text-white/90">{formatDate(item.createdAt)}</p>
            </div>
          ) : null}
        </button>
      ))}
    </div>
  );
}
