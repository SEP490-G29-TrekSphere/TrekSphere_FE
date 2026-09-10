import { AlertTriangle } from 'lucide-react';
import { AppButton } from '@/shared/ui';

interface GroupDetailErrorStateProps {
  embedded?: boolean;
  message: string;
  onBack: () => void;
  onRetry: () => void;
}

export function GroupDetailErrorState({
  onBack,
  onRetry,
  embedded = false,
  message,
}: GroupDetailErrorStateProps) {
  return (
    <div
      className={
        embedded
          ? 'flex flex-col items-center justify-center py-16 text-center'
          : 'flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-background p-6 text-center'
      }
    >
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-border bg-card p-8 shadow-sm">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
        <h1 className="font-bold text-foreground text-xl">Không thể tải thông tin nhóm</h1>
        <p className="text-muted-foreground text-xs leading-relaxed">{message}</p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <AppButton
            variant="outline"
            onClick={onBack}
            className="rounded-full px-5 font-bold text-xs"
          >
            Quay lại danh sách
          </AppButton>
          <AppButton onClick={onRetry} className="rounded-full px-5 font-bold text-xs">
            Thử lại
          </AppButton>
        </div>
      </div>
    </div>
  );
}
