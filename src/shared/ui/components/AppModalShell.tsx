import { X } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

/**
 * Đếm số modal đang mở để chỉ khoá/mở scroll của <body> đúng một lần
 * khi có nhiều modal chồng nhau.
 */
let openModalCount = 0;

export interface AppModalShellProps {
  open: boolean;
  /** Gọi khi người dùng bấm ra ngoài, bấm nút X hoặc nhấn Esc. */
  onClose: () => void;
  children: React.ReactNode;
  /** Class cho khung nội dung (panel), không phải backdrop. */
  className?: string;
  /** Class cho backdrop — dùng khi cần z-index hoặc màu nền khác. */
  backdropClassName?: string;
  /** Tắt khi modal đang xử lý tác vụ không được huỷ giữa chừng. */
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  /** Hiện nút X ở góc phải trên của panel. */
  showCloseButton?: boolean;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

/**
 * Khung modal dùng chung: backdrop + click ra ngoài để đóng + phím Esc +
 * khoá scroll nền, render qua portal nên không bị `overflow`/`transform`
 * của component cha cắt mất.
 *
 * Dùng cho các modal viết tay. Modal dựng trên `@/components/ui/dialog`
 * (Base UI) đã có sẵn những hành vi này nên không cần bọc thêm.
 */
export function AppModalShell({
  open,
  onClose,
  children,
  className,
  backdropClassName,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  showCloseButton = false,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: AppModalShellProps) {
  // Chỉ đóng khi cả mousedown lẫn mouseup đều rơi trên backdrop. Nếu người
  // dùng bôi đen text bên trong rồi nhả chuột ra ngoài thì modal không đóng.
  const pressStartedOnBackdrop = useRef(false);

  const handleBackdropMouseDown = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    pressStartedOnBackdrop.current = event.target === event.currentTarget;
  }, []);

  const handleBackdropMouseUp = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const shouldClose = pressStartedOnBackdrop.current && event.target === event.currentTarget;
      pressStartedOnBackdrop.current = false;
      if (shouldClose && closeOnBackdropClick) onClose();
    },
    [closeOnBackdropClick, onClose]
  );

  useEffect(() => {
    if (!open || !closeOnEscape) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, closeOnEscape, onClose]);

  useEffect(() => {
    if (!open) return;

    openModalCount += 1;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      openModalCount -= 1;
      if (openModalCount === 0) document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    // biome-ignore lint/a11y/noStaticElementInteractions: backdrop chỉ là lối tắt chuột, Esc và nút đóng mới là đường chính
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150',
        backdropClassName
      )}
      onMouseDown={handleBackdropMouseDown}
      onMouseUp={handleBackdropMouseUp}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        className={cn(
          'relative w-full max-w-md rounded-2xl bg-card p-6 text-card-foreground shadow-xl animate-in zoom-in-95 duration-150',
          className
        )}
      >
        {children}
        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="absolute right-4 top-4 cursor-pointer rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>,
    document.body
  );
}
