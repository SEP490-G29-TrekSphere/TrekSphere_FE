import { AppSpinner } from '@/shared/ui';

export function MomentsLoading() {
  return (
    <output aria-live="polite" className="flex min-h-48 items-center justify-center">
      <AppSpinner size="default" className="text-primary" />
      <span className="sr-only">Đang tải khoảnh khắc...</span>
    </output>
  );
}
