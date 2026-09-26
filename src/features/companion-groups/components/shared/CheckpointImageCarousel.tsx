import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface CheckpointImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
  imgClassName?: string;
}

export function CheckpointImageCarousel({
  images,
  alt,
  className,
  imgClassName,
}: CheckpointImageCarouselProps) {
  const [index, setIndex] = useState(0);

  if (images.length === 0) return null;

  const goPrev = () => setIndex((i) => (i - 1 + images.length) % images.length);
  const goNext = () => setIndex((i) => (i + 1) % images.length);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <img
        src={images[index]}
        alt={alt}
        className={cn('h-full w-full object-cover', imgClassName)}
        loading="lazy"
      />
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Ảnh trước"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white transition hover:bg-black/70 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Ảnh sau"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white transition hover:bg-black/70 cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <span className="absolute bottom-1.5 right-1.5 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-white">
            {index + 1}/{images.length}
          </span>
        </>
      )}
    </div>
  );
}
