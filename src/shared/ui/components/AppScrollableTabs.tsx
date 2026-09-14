import { ChevronLeft, ChevronRight } from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export interface AppScrollableTabsProps {
  children: React.ReactNode;
  className?: string;
  scrollStep?: number;
}

export function AppScrollableTabs({
  children,
  className,
  scrollStep = 220,
}: AppScrollableTabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollability = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    // Cho phép dung sai 2px do làm tròn sub-pixel
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    checkScrollability();

    // Lắng nghe resize & scroll
    const resizeObserver = new ResizeObserver(() => {
      checkScrollability();
    });

    resizeObserver.observe(el);
    el.addEventListener('scroll', checkScrollability, { passive: true });

    return () => {
      resizeObserver.disconnect();
      el.removeEventListener('scroll', checkScrollability);
    };
  }, [checkScrollability]);

  const handleScroll = (direction: 'left' | 'right') => {
    const el = containerRef.current;
    if (!el) return;

    const delta = direction === 'left' ? -scrollStep : scrollStep;
    el.scrollBy({ left: delta, behavior: 'smooth' });
  };

  return (
    <div className={cn('relative flex items-center group/tabscroll w-full', className)}>
      {/* Nút cuộn trái */}
      {canScrollLeft && (
        <div className="absolute left-1 z-20 flex items-center">
          <button
            type="button"
            onClick={() => handleScroll('left')}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-background/95 text-foreground shadow-md ring-1 ring-border/50 backdrop-blur-xs transition hover:bg-muted hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Cuộn sang trái"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Hiệu ứng gradient fade bên trái */}
      {canScrollLeft && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-10 bg-gradient-to-r from-card to-transparent rounded-l-2xl"
        />
      )}

      {/* Container cuộn danh sách tabs */}
      <div
        ref={containerRef}
        className="scrollbar-none flex w-full overflow-x-auto rounded-2xl border border-border bg-card p-1.5 shadow-xs scroll-smooth"
      >
        {children}
      </div>

      {/* Hiệu ứng gradient fade bên phải */}
      {canScrollRight && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-10 bg-gradient-to-l from-card to-transparent rounded-r-2xl"
        />
      )}

      {/* Nút cuộn phải */}
      {canScrollRight && (
        <div className="absolute right-1 z-20 flex items-center">
          <button
            type="button"
            onClick={() => handleScroll('right')}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-background/95 text-foreground shadow-md ring-1 ring-border/50 backdrop-blur-xs transition hover:bg-muted hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Cuộn sang phải"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
