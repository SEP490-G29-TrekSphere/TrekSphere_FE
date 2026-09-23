import { ArrowRight, Loader2, Lock, Send } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PATHS } from '@/constants';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import {
  COMMENT_SORT_OPTIONS,
  COMMENTS_LOAD_MORE_STEP,
  type CommentSortOrder,
  INITIAL_VISIBLE_COMMENTS,
} from '../../constants';
import { useBlogComments, useCreateBlogComment } from '../../hooks/useBlog';
import { FeedAvatar } from './FeedAvatar';

interface FeedCommentsSectionProps {
  blogId: string;
  detailLink: string;
  totalCommentsCount: number;
}

function formatCommentTime(iso?: string): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Vừa xong';
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay} ngày trước`;
  return date.toLocaleDateString('vi-VN');
}

export function FeedCommentsSection({
  blogId,
  detailLink,
  totalCommentsCount,
}: FeedCommentsSectionProps) {
  const user = useAppStore((state) => state.user);
  const isLoggedIn = Boolean(user);

  const [commentText, setCommentText] = useState('');
  const [commentSort, setCommentSort] = useState<CommentSortOrder>('newest');
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COMMENTS);

  const { data: commentsData, isLoading: isLoadingComments } = useBlogComments(blogId);
  const createCommentMutation = useCreateBlogComment(blogId);

  const comments = commentsData?.items ?? [];

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

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = commentText.trim();
    if (!trimmed) return;
    if (!isLoggedIn) {
      toast.warning('Vui lòng đăng nhập để bình luận.');
      return;
    }
    try {
      await createCommentMutation.mutateAsync({ content: trimmed });
      setCommentText('');
      toast.success('Đã gửi bình luận.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gửi bình luận thất bại.');
    }
  };

  return (
    <div className="mt-4 border-t border-border pt-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-bold text-primary sm:text-sm">
          Bình luận ({totalCommentsCount})
        </h3>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-muted-foreground">Sắp xếp:</span>
          <select
            value={commentSort}
            onChange={(e) => setCommentSort(e.target.value as CommentSortOrder)}
            className="cursor-pointer rounded-lg border border-border bg-card px-2 py-1 text-[11px] font-semibold text-primary outline-none transition-colors hover:bg-muted focus:border-primary"
          >
            {COMMENT_SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2.5">
        {isLoadingComments ? (
          <div className="flex items-center justify-center py-4 text-xs text-muted-foreground">
            <Loader2 className="mr-2 size-4 animate-spin" />
            Đang tải bình luận...
          </div>
        ) : displayedComments.length > 0 ? (
          <>
            {displayedComments.map((comment) => (
              <div
                key={comment.commentId}
                className="flex items-start gap-2.5 rounded-xl bg-muted/30 p-2.5 text-xs sm:text-sm"
              >
                <FeedAvatar src={comment.userAvatarUrl} name={comment.userFullName} size={28} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-primary">{comment.userFullName}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {formatCommentTime(comment.createdAt)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-primary/90 whitespace-pre-wrap break-words">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}

            <div className="flex flex-col items-center gap-1.5 pt-1 text-center">
              {hasMore && (
                <button
                  type="button"
                  onClick={handleLoadMore}
                  className="cursor-pointer rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold text-primary hover:bg-muted transition-colors shadow-2xs"
                >
                  Xem thêm {Math.min(COMMENTS_LOAD_MORE_STEP, sortedComments.length - visibleCount)}{' '}
                  bình luận khác
                </button>
              )}

              <Link
                to={detailLink}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary transition-colors hover:underline"
              >
                Xem chi tiết bài viết và tất cả bình luận ({totalCommentsCount})
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </>
        ) : (
          <p className="py-2 text-center text-xs text-muted-foreground">
            Chưa có bình luận nào. Hãy là người đầu tiên thảo luận!
          </p>
        )}
      </div>

      <div className="mt-3.5 border-t border-border/60 pt-3">
        {isLoggedIn ? (
          <form onSubmit={handleCommentSubmit} className="flex items-start gap-2.5">
            <FeedAvatar
              src={user?.avatarUrl}
              name={user?.name || user?.email || 'User'}
              size={34}
            />
            <div className="relative flex-1">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Viết bình luận công khai..."
                className="w-full rounded-full border border-border bg-muted/40 py-2 pl-3.5 pr-10 text-xs text-primary placeholder:text-muted-foreground/70 focus:border-primary focus:bg-card focus:outline-none sm:text-sm"
              />
              <button
                type="submit"
                disabled={!commentText.trim() || createCommentMutation.isPending}
                aria-label="Gửi bình luận"
                className="absolute right-1.5 top-1/2 flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {createCommentMutation.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Send className="size-3.5" />
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex items-center justify-between rounded-xl bg-muted/50 p-3 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Lock className="size-4 text-muted-foreground" />
              <span>Đăng nhập để tham gia bình luận</span>
            </div>
            <Link
              to={PATHS.LOGIN}
              className="rounded-full bg-primary px-3 py-1 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Đăng nhập
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
