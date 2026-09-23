import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useCallback, useEffect } from 'react';

interface MomentLightboxProps {
  urls: string[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

export function MomentLightbox({ urls, index, onIndexChange, onClose }: MomentLightboxProps) {
  const total = urls.length;
  const hasMultiple = total > 1;

  const goPrev = useCallback(() => {
    onIndexChange((index - 1 + total) % total);
  }, [index, onIndexChange, total]);

  const goNext = useCallback(() => {
    onIndexChange((index + 1) % total);
  }, [index, onIndexChange, total]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (!hasMultiple) return;
      if (event.key === 'ArrowLeft') goPrev();
      if (event.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev, hasMultiple, onClose]);

  const currentUrl = urls[index];
  if (!currentUrl) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Xem ảnh khoảnh khắc"
      className="fade-in fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/90 p-4 backdrop-blur-xs"
    >
      <button
        type="button"
        aria-label="Đóng xem ảnh"
        className="absolute inset-0 h-full w-full cursor-default border-0 bg-transparent"
        onClick={onClose}
      />

      <button
        type="button"
        onClick={onClose}
        aria-label="Đóng"
        className="absolute top-4 right-4 z-10 cursor-pointer rounded-full bg-white/10 p-2.5 text-white transition hover:bg-white/20"
      >
        <X className="h-5 w-5" />
      </button>

      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Ảnh trước"
            className="absolute left-3 z-10 cursor-pointer rounded-full bg-white/10 p-2.5 text-white transition hover:bg-white/20 sm:left-6"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Ảnh kế tiếp"
            className="absolute right-3 z-10 cursor-pointer rounded-full bg-white/10 p-2.5 text-white transition hover:bg-white/20 sm:right-6"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <span className="absolute bottom-5 z-10 rounded-full bg-black/60 px-3 py-1 font-bold text-[11px] text-white/90">
            {index + 1}/{total}
          </span>
        </>
      )}

      <img
        src={currentUrl}
        alt={`Ảnh khoảnh khắc ${index + 1}/${total}`}
        className="relative z-10 max-h-[85vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
      />
    </div>
  );
}
