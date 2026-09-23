import { X } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

/**
 * Tracks open modal count to toggle document body overflow lock once for nested modals.
 */
let openModalCount = 0;

export interface AppModalShellProps {
  open: boolean;
  /** Triggered on backdrop click, close button click, or Escape key press. */
  onClose: () => void;
  children: React.ReactNode;
  /** Custom panel className. */
  className?: string;
  /** Custom backdrop className. */
  backdropClassName?: string;
  /** Whether clicking the backdrop closes the modal. Default is `true`. */
  closeOnBackdropClick?: boolean;
  /** Whether pressing Escape key closes the modal. Default is `true`. */
  closeOnEscape?: boolean;
  /** Whether to render an explicit close (X) button. Default is `false`. */
  showCloseButton?: boolean;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

/**
 * Shared modal shell providing backdrop, portal rendering, scroll locking, and keyboard shortcuts.
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
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      openModalCount -= 1;
      if (openModalCount === 0) {
        document.body.style.overflow = previousBodyOverflow;
        document.documentElement.style.overflow = previousHtmlOverflow;
      }
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    // biome-ignore lint/a11y/noStaticElementInteractions: backdrop acts as mouse shortcut alongside Escape and explicit close button
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overscroll-contain bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150',
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
            aria-label="Close"
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
