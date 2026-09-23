import { MOMENT_GALLERY_PREVIEW_LIMIT } from '../constants';
import type { MomentItem } from '../types';
import { getMomentImageUrls } from '../utils/momentMedia';

interface MomentMediaGalleryProps {
  moment: MomentItem;

  onSelectImage: (index: number) => void;

  onShowAll: () => void;
}

interface GalleryTileProps {
  url: string;
  index: number;
  label: string;
  className: string;
  onClick: () => void;
  overlay?: string;
}

function GalleryTile({ url, index, label, className, onClick, overlay }: GalleryTileProps) {
  return (
    <button type="button" onClick={onClick} className={className} aria-label={label}>
      <img
        src={url}
        alt={`${label} ${index + 1}`}
        loading="lazy"
        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
      />
      {overlay ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 font-extrabold text-base text-white backdrop-blur-2xs sm:text-lg">
          {overlay}
        </div>
      ) : null}
    </button>
  );
}

const TILE_BASE =
  'group relative w-full cursor-pointer overflow-hidden border-0 bg-black/10 p-0 text-left';

export function MomentMediaGallery({ moment, onSelectImage, onShowAll }: MomentMediaGalleryProps) {
  const urls = getMomentImageUrls(moment);
  const total = urls.length;
  if (total === 0) return null;

  const label = moment.caption || 'Ảnh khoảnh khắc';

  if (total === 1) {
    return (
      <div className="w-full bg-black/5">
        <GalleryTile
          url={urls[0]}
          index={0}
          label={label}
          onClick={() => onSelectImage(0)}
          className={`${TILE_BASE} block aspect-16/9 max-h-[460px] sm:aspect-21/9`}
        />
      </div>
    );
  }

  if (total === 2) {
    return (
      <div className="grid max-h-[380px] w-full grid-cols-2 gap-1 overflow-hidden bg-black/5">
        {urls.slice(0, 2).map((url, index) => (
          <GalleryTile
            key={url}
            url={url}
            index={index}
            label={label}
            onClick={() => onSelectImage(index)}
            className={`${TILE_BASE} aspect-square`}
          />
        ))}
      </div>
    );
  }

  if (total === 3) {
    return (
      <div className="grid max-h-[380px] w-full grid-cols-3 gap-1 overflow-hidden bg-black/5">
        <GalleryTile
          url={urls[0]}
          index={0}
          label={label}
          onClick={() => onSelectImage(0)}
          className={`${TILE_BASE} col-span-2 aspect-square h-full sm:aspect-auto`}
        />
        <div className="col-span-1 grid h-full grid-rows-2 gap-1">
          {urls.slice(1, 3).map((url, offset) => (
            <GalleryTile
              key={url}
              url={url}
              index={offset + 1}
              label={label}
              onClick={() => onSelectImage(offset + 1)}
              className={`${TILE_BASE} aspect-square h-full`}
            />
          ))}
        </div>
      </div>
    );
  }

  const visibleUrls = urls.slice(0, MOMENT_GALLERY_PREVIEW_LIMIT);
  const hiddenCount = total - MOMENT_GALLERY_PREVIEW_LIMIT;

  return (
    <div className="grid max-h-[400px] w-full grid-cols-2 gap-1 overflow-hidden bg-black/5">
      {visibleUrls.map((url, index) => {
        const isOverflowTile = index === MOMENT_GALLERY_PREVIEW_LIMIT - 1 && hiddenCount > 0;
        return (
          <GalleryTile
            key={url}
            url={url}
            index={index}
            label={label}
            onClick={() => (isOverflowTile ? onShowAll() : onSelectImage(index))}
            className={`${TILE_BASE} aspect-4/3 sm:aspect-video`}
            overlay={isOverflowTile ? `+${hiddenCount + 1} ảnh` : undefined}
          />
        );
      })}
    </div>
  );
}
