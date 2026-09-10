import { Loader2, RotateCcw, Send, X } from 'lucide-react';
import { useState } from 'react';
import { AppModalShell } from '@/shared/ui';

interface ReapplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupName: string;
  isPending: boolean;
  onConfirm: (message?: string) => void;
}

const MAX_MESSAGE_LENGTH = 500;

export function ReapplyModal({
  isOpen,
  onClose,
  groupName,
  isPending,
  onConfirm,
}: ReapplyModalProps) {
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  function handleConfirm() {
    onConfirm(message.trim() || undefined);
  }

  return (
    <AppModalShell
      open
      onClose={onClose}
      aria-label="Nộp lại đơn tham gia"
      className="flex max-w-md flex-col overflow-hidden border border-border p-0"
    >
      <button
        type="button"
        onClick={onClose}
        disabled={isPending}
        className="absolute top-4 right-4 z-10 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer disabled:opacity-50"
        aria-label="Đóng"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="border-border border-b bg-primary/5 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <RotateCcw className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bold text-foreground text-base">Nộp Lại Đơn Tham Gia</h2>
            <p className="text-muted-foreground text-xs">
              Gửi lại yêu cầu gia nhập nhóm <strong>{groupName}</strong>
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-6 text-xs">
        <p className="text-muted-foreground leading-relaxed">
          Bạn có thể bổ sung thêm thông tin về thể lực, kinh nghiệm hoặc lời nhắn mới để Trưởng nhóm
          dễ dàng xét duyệt lại đơn của bạn.
        </p>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="reapply-message" className="font-semibold text-foreground text-xs">
              Lời nhắn mới gửi Trưởng nhóm
            </label>
            <span className="text-[10px] text-muted-foreground">
              {message.length}/{MAX_MESSAGE_LENGTH}
            </span>
          </div>
          <textarea
            id="reapply-message"
            rows={3}
            maxLength={MAX_MESSAGE_LENGTH}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isPending}
            placeholder="VD: Mình đã cập nhật lại kinh nghiệm và chuẩn bị đầy đủ trang bị..."
            className="w-full resize-none rounded-xl border border-input bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2.5 border-border border-t bg-muted/10 px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="rounded-full border border-border bg-background px-4 py-2 font-semibold text-foreground text-xs hover:bg-muted cursor-pointer disabled:opacity-50"
        >
          Hủy
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isPending}
          className="flex items-center justify-center gap-1.5 rounded-full bg-primary px-5 py-2 font-bold text-primary-foreground text-xs hover:bg-primary-hover transition-colors shadow-xs cursor-pointer disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Đang gửi...</span>
            </>
          ) : (
            <>
              <Send className="h-3.5 w-3.5" />
              <span>Gửi đơn</span>
            </>
          )}
        </button>
      </div>
    </AppModalShell>
  );
}
