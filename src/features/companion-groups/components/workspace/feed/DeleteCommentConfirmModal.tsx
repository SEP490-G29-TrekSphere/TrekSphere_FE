import { AlertTriangle, Loader2, Trash2, X } from 'lucide-react';
import { AppModalShell } from '@/shared/ui';
import type { GroupPostCommentResponse } from '../../../types/workspace';

interface DeleteCommentConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  comment: GroupPostCommentResponse | null;
  isPending: boolean;
  onConfirmDelete: (commentId: string) => void;
}

export function DeleteCommentConfirmModal({
  isOpen,
  onClose,
  comment,
  isPending,
  onConfirmDelete,
}: DeleteCommentConfirmModalProps) {
  if (!isOpen || !comment) return null;

  const commentId = comment.groupPostCommentId || comment.commentId || comment.id || '';

  function handleConfirm() {
    if (!commentId) return;
    onConfirmDelete(commentId);
  }

  return (
    <AppModalShell
      open
      onClose={onClose}
      aria-label="Xác nhận xóa bình luận"
      className="flex max-w-md flex-col overflow-hidden border border-border p-0"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2 text-destructive">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <h3 className="text-base font-bold text-foreground">Xóa bình luận</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="rounded-lg p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      <div className="space-y-3 px-5 py-4 text-xs leading-relaxed text-muted-foreground">
        <p>Bạn có chắc chắn muốn xóa bình luận này không? Nội dung sẽ bị gỡ bỏ khỏi bài viết.</p>

        {comment.replies && comment.replies.length > 0 && (
          <div className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <strong>Lưu ý:</strong> Bình luận này có{' '}
              <span className="font-bold">{comment.replies.length} phản hồi</span>. Xóa bình luận
              cha sẽ xóa toàn bộ các phản hồi bên dưới.
            </div>
          </div>
        )}

        {(!comment.replies || comment.replies.length === 0) && (
          <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <div>
              <strong>Lưu ý:</strong> Hành động này không thể hoàn tác.
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/20 px-5 py-3">
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-muted disabled:opacity-50 cursor-pointer"
        >
          Hủy bỏ
        </button>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={isPending || !commentId}
          className="inline-flex items-center gap-1.5 rounded-xl bg-destructive px-4 py-2 text-xs font-bold text-destructive-foreground transition hover:bg-destructive/90 disabled:opacity-50 cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Đang xóa...</span>
            </>
          ) : (
            <>
              <Trash2 className="h-3.5 w-3.5" />
              <span>Xác nhận xóa</span>
            </>
          )}
        </button>
      </div>
    </AppModalShell>
  );
}
