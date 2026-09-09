import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { type ToastMessage, useToastStore } from '@/store/useToastStore';

const toastConfig: Record<
  ToastMessage['type'],
  {
    icon: typeof CheckCircle2;
    iconBg: string;
    iconColor: string;
    progressBarColor: string;
    borderColor: string;
    defaultTitle: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    progressBarColor: 'bg-emerald-500',
    borderColor: 'border-emerald-200/80 dark:border-emerald-800/50',
    defaultTitle: 'Thành công',
  },
  error: {
    icon: AlertCircle,
    iconBg: 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400',
    iconColor: 'text-rose-600 dark:text-rose-400',
    progressBarColor: 'bg-rose-500',
    borderColor: 'border-rose-200/80 dark:border-rose-800/50',
    defaultTitle: 'Đã xảy ra lỗi',
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
    iconColor: 'text-amber-600 dark:text-amber-400',
    progressBarColor: 'bg-amber-500',
    borderColor: 'border-amber-200/80 dark:border-amber-800/50',
    defaultTitle: 'Cảnh báo',
  },
  info: {
    icon: Info,
    iconBg: 'bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400',
    iconColor: 'text-sky-600 dark:text-sky-400',
    progressBarColor: 'bg-sky-500',
    borderColor: 'border-sky-200/80 dark:border-sky-800/50',
    defaultTitle: 'Thông tin',
  },
};

function ToastItem({ toast: t }: { toast: ToastMessage }) {
  const removeToast = useToastStore((state) => state.removeToast);
  const duration = t.duration ?? 4000;

  const [remainingTime, setRemainingTime] = useState(duration);
  const [isPaused, setIsPaused] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const lastTickRef = useRef<number>(Date.now());

  const config = toastConfig[t.type];
  const Icon = config.icon;
  const displayTitle = t.title || (t.message.length > 50 ? config.defaultTitle : undefined);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      removeToast(t.id);
    }, 200);
  }, [removeToast, t.id]);

  // Timer loop for auto dismiss & smooth progress bar
  useEffect(() => {
    if (isPaused || isExiting) {
      lastTickRef.current = Date.now();
      return;
    }

    lastTickRef.current = Date.now();
    const interval = setInterval(() => {
      const now = Date.now();
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;

      setRemainingTime((prev) => {
        const next = prev - delta;
        if (next <= 0) {
          clearInterval(interval);
          handleDismiss();
          return 0;
        }
        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isPaused, isExiting, handleDismiss]);

  const progressPercent = Math.max(0, Math.min(100, (remainingTime / duration) * 100));

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`pointer-events-auto relative flex w-full max-w-[380px] items-start gap-3 overflow-hidden rounded-xl border bg-white/95 p-4 shadow-xl backdrop-blur-md transition-all duration-200 dark:bg-[#1C2822]/95 ${
        config.borderColor
      } ${
        isExiting
          ? 'opacity-0 translate-x-4 scale-95'
          : 'animate-in fade-in-0 slide-in-from-top-3 duration-300'
      }`}
      role="alert"
    >
      {/* Status Icon */}
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${config.iconBg}`}
      >
        <Icon className="h-5 w-5 stroke-[2.2]" />
      </div>

      {/* Content */}
      <div className="flex-1 pt-0.5 min-w-0 pr-1">
        {displayTitle && (
          <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 leading-snug tracking-tight">
            {displayTitle}
          </h4>
        )}
        <p
          className={`text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed break-words ${
            displayTitle ? 'mt-0.5' : 'text-sm font-medium text-neutral-800 dark:text-neutral-200'
          }`}
        >
          {t.message}
        </p>
      </div>

      {/* Close Button */}
      <button
        type="button"
        onClick={handleDismiss}
        className="shrink-0 -mr-1 -mt-1 rounded-lg p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100/80 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
        aria-label="Đóng thông báo"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-neutral-100 dark:bg-neutral-800/60 overflow-hidden">
        <div
          className={`h-full transition-all duration-75 ease-linear ${config.progressBarColor}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}

export function AppGlobalToast() {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <div
      className="fixed top-20 right-5 z-[100] flex max-h-[calc(100vh-6rem)] w-full flex-col items-end gap-2.5 p-0 sm:w-auto pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}
