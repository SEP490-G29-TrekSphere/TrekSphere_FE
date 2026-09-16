import { Lock } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PATHS } from '@/constants';
import { ConfirmActionDialog, ReportModal } from '@/shared/ui';
import { toast } from '@/store/useToastStore';
import {
  COMMENT_SORT_OPTIONS,
  COMMENTS_LOAD_MORE_STEP,
  type CommentSortOrder,
  INITIAL_VISIBLE_COMMENTS,
} from '../constants';
import { useCreateBlogComment, useDeleteBlogComment, useUpdateBlogComment } from '../hooks/useBlog';
import type { BlogCommentItem } from '../types';
import { BlogCommentItemNode } from './BlogCommentItemNode';

interface BlogCommentsProps {
  comments: BlogCommentItem[];
  total?: number;
  isLoggedIn: boolean;
  /** userId của người đang đăng nhập — dùng để hiện nút Sửa/Xóa đúng chủ bình luận. */
  currentUserId?: string;
  /** ID bài viết — dùng để invalidate cache + gọi API comment. */
  blogId?: string;
}

/**
 * Khu vực bình luận cho trang chi tiết bài viết.
 * - Header trên cùng: Tiêu đề + Bộ chọn kiểu sắp xếp (Mới nhất / Cũ nhất).
 * - Danh sách bình luận dạng cây (replies).
 * - Form nhập bình luận / CTA đăng nhập chuyển xuống dưới cùng.
 */
export function BlogComments({
  comments,
  total,
  isLoggedIn,
  currentUserId,
  blogId,
}: BlogCommentsProps) {
  const [content, setContent] = useState('');
  const [commentSort, setCommentSort] = useState<CommentSortOrder>('newest');
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COMMENTS);

  const createMutation = useCreateBlogComment(blogId);
  const updateMutation = useUpdateBlogComment(blogId);
  const deleteMutation = useDeleteBlogComment(blogId);

  const [reportingComment, setReportingComment] = useState<BlogCommentItem | null>(null);
  const [deletingComment, setDeletingComment] = useState<BlogCommentItem | null>(null);

  const count = total ?? comments.length;

  const sortedComments = useMemo(() => {
    return [...comments].sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return commentSort === 'newest' ? timeB - timeA : timeA - timeB;
    });
  }, [comments, commentSort]);

  const displayedComments = sortedComments.slice(0, visibleCount);
  const hasMore = sortedComments.length > visibleCount;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + COMMENTS_LOAD_MORE_STEP);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) {
      toast.error('Vui lòng nhập nội dung bình luận.');
      return;
    }
    try {
      await createMutation.mutateAsync({ content: trimmed });
      setContent('');
      toast.success('Đã gửi bình luận.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gửi bình luận thất bại.');
    }
  };

  const handleReply = async (parentCommentId: string, replyContent: string) => {
    await createMutation.mutateAsync({ content: replyContent, parentCommentId });
    toast.success('Đã gửi trả lời.');
  };

  const handleEdit = async (commentId: string, newContent: string) => {
    await updateMutation.mutateAsync({ commentId, payload: { content: newContent } });
    toast.success('Đã cập nhật bình luận.');
  };

  const handleDeleteConfirm = async () => {
    if (!deletingComment) return;
    try {
      await deleteMutation.mutateAsync(deletingComment.commentId);
      toast.success('Đã xóa bình luận.');
      setDeletingComment(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Xóa bình luận thất bại.');
    }
  };

  return (
    <section className="mt-12 rounded-3xl bg-card p-6 sm:p-8 border border-border shadow-xs">
      {/* Header + Kiểu sắp xếp */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-primary sm:text-2xl">Bình luận ({count})</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">Sắp xếp:</span>
          <select
            value={commentSort}
            onChange={(e) => setCommentSort(e.target.value as CommentSortOrder)}
            className="cursor-pointer rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-primary outline-none hover:border-primary transition-colors"
          >
            {COMMENT_SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Danh sách bình luận */}
      {displayedComments.length > 0 ? (
        <>
          <ul className="mt-8 flex flex-col gap-4">
            {displayedComments.map((comment) => (
              <BlogCommentItemNode
                key={comment.commentId}
                comment={comment}
                depth={0}
                isLoggedIn={isLoggedIn}
                currentUserId={currentUserId}
                onReport={(c) => setReportingComment(c)}
                onReply={handleReply}
                onEdit={handleEdit}
                onDelete={(c) => setDeletingComment(c)}
              />
            ))}
          </ul>

          {hasMore && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={handleLoadMore}
                className="cursor-pointer rounded-full border border-border bg-card px-6 py-2.5 text-xs font-bold text-primary hover:bg-muted transition-colors shadow-2xs"
              >
                Xem thêm bình luận ({sortedComments.length - visibleCount} còn lại)
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="mt-6 text-center text-sm text-muted-foreground font-medium">
          Chưa có bình luận nào.
        </p>
      )}

      {/* Form bình luận đẩy xuống dưới cùng */}
      <div className="mt-8 border-t border-border pt-6">
        {isLoggedIn ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Viết bình luận của bạn..."
              className="w-full rounded-2xl border border-border bg-card p-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="cursor-pointer rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {createMutation.isPending ? 'Đang gửi...' : 'Gửi bình luận'}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex items-center justify-between rounded-2xl bg-amber-50 p-4 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/50">
            <div className="flex items-center gap-3">
              <Lock className="size-5 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                Vui lòng đăng nhập để tham gia bình luận
              </span>
            </div>
            <Link
              to={PATHS.LOGIN}
              className="rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90"
            >
              Đăng nhập
            </Link>
          </div>
        )}
      </div>

      {/* Modal Báo cáo Comment */}
      {reportingComment && (
        <ReportModal
          isOpen={Boolean(reportingComment)}
          onClose={() => setReportingComment(null)}
          targetId={reportingComment.commentId}
          targetType="COMMENT"
          targetTitle={reportingComment.content}
        />
      )}

      {/* Modal xác nhận xóa comment */}
      {deletingComment && (
        <ConfirmActionDialog
          title="Xóa bình luận?"
          description="Bình luận sẽ bị xóa vĩnh viễn và không thể khôi phục."
          detail={deletingComment.content}
          confirmLabel="Xóa"
          variant="destructive"
          isPending={deleteMutation.isPending}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingComment(null)}
        />
      )}
    </section>
  );
}
