import { Flag } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getUserProfilePath } from '@/constants';
import { toast } from '@/store/useToastStore';
import type { BlogCommentItem } from '../types';

interface BlogCommentItemNodeProps {
  comment: BlogCommentItem;
  depth: number;
  isLoggedIn: boolean;
  currentUserId?: string;
  onReport: (comment: BlogCommentItem) => void;
  onReply: (parentCommentId: string, content: string) => Promise<void>;
  onEdit: (commentId: string, content: string) => Promise<void>;
  onDelete: (comment: BlogCommentItem) => void;
}

const formatRelativeTime = (iso: string): string => {
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
};

/**
 * Một node bình luận hiển thị nội dung, avatar, các nút phản hồi/sửa/xóa/báo cáo,
 * và danh sách trả lời lồng nhau (replies tree).
 */
export function BlogCommentItemNode({
  comment,
  depth,
  isLoggedIn,
  currentUserId,
  onReport,
  onReply,
  onEdit,
  onDelete,
}: BlogCommentItemNodeProps) {
  const isOwner = Boolean(currentUserId) && comment.userId === currentUserId;

  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = replyContent.trim();
    if (!trimmed) {
      toast.error('Vui lòng nhập nội dung trả lời.');
      return;
    }
    setIsSubmittingReply(true);
    try {
      await onReply(comment.commentId, trimmed);
      setReplyContent('');
      setIsReplying(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gửi trả lời thất bại.');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const startEditing = () => {
    setEditContent(comment.content);
    setIsEditing(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = editContent.trim();
    if (!trimmed) {
      toast.error('Nội dung bình luận không được để trống.');
      return;
    }
    setIsSubmittingEdit(true);
    try {
      await onEdit(comment.commentId, trimmed);
      setIsEditing(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Cập nhật bình luận thất bại.');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  return (
    <li
      id={`comment-${comment.commentId}`}
      className="flex gap-4 rounded-2xl bg-card p-4 shadow-xs border border-border md:p-5 transition-all duration-300"
      style={depth > 0 ? { marginLeft: `${Math.min(depth, 3) * 1.5}rem` } : undefined}
    >
      {comment.userId ? (
        <Link
          to={getUserProfilePath(comment.userId)}
          className="shrink-0 hover:opacity-80 transition-opacity"
        >
          {comment.userAvatarUrl ? (
            <img
              src={comment.userAvatarUrl}
              alt={comment.userFullName}
              className="h-10 w-10 shrink-0 rounded-full object-cover md:h-12 md:w-12"
            />
          ) : (
            <div className="h-10 w-10 shrink-0 rounded-full bg-muted md:h-12 md:w-12 flex items-center justify-center font-bold text-primary">
              {comment.userFullName?.[0]?.toUpperCase() || '?'}
            </div>
          )}
        </Link>
      ) : comment.userAvatarUrl ? (
        <img
          src={comment.userAvatarUrl}
          alt={comment.userFullName}
          className="h-10 w-10 shrink-0 rounded-full object-cover md:h-12 md:w-12"
        />
      ) : (
        <div className="h-10 w-10 shrink-0 rounded-full bg-muted md:h-12 md:w-12" />
      )}
      <div className="flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {comment.userId ? (
              <Link
                to={getUserProfilePath(comment.userId)}
                className="text-sm font-semibold text-primary hover:underline md:text-base"
              >
                {comment.userFullName}
              </Link>
            ) : (
              <span className="text-sm font-semibold text-primary md:text-base">
                {comment.userFullName}
              </span>
            )}
            <span className="text-xs text-muted-foreground md:text-sm">
              {formatRelativeTime(comment.createdAt)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isOwner && !isEditing && (
              <>
                <button
                  type="button"
                  onClick={startEditing}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  Sửa
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(comment)}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                >
                  Xóa
                </button>
              </>
            )}
            {isLoggedIn && !isOwner && (
              <button
                type="button"
                onClick={() => onReport(comment)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                title="Báo cáo bình luận"
              >
                <Flag className="size-3.5" />
                <span>Báo cáo</span>
              </button>
            )}
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleEditSubmit} className="mt-2 flex flex-col gap-2">
            <textarea
              rows={2}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full rounded-xl border border-border bg-card p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={isSubmittingEdit}
                className="cursor-pointer rounded-full border border-border px-4 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmittingEdit}
                className="cursor-pointer rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {isSubmittingEdit ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </form>
        ) : (
          <p className="mt-2 text-sm leading-relaxed text-primary/90 md:text-base">
            {comment.content}
          </p>
        )}

        {isLoggedIn && !isEditing && (
          <button
            type="button"
            onClick={() => setIsReplying((v) => !v)}
            className="mt-2 cursor-pointer text-xs font-semibold text-primary hover:underline md:text-sm"
          >
            {isReplying ? 'Hủy trả lời' : 'Trả lời'}
          </button>
        )}

        {isReplying && (
          <form onSubmit={handleReplySubmit} className="mt-3 flex flex-col gap-2">
            <textarea
              rows={2}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={`Trả lời ${comment.userFullName}...`}
              className="w-full rounded-xl border border-border bg-card p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmittingReply}
                className="cursor-pointer rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {isSubmittingReply ? 'Đang gửi...' : 'Gửi trả lời'}
              </button>
            </div>
          </form>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <ul className="mt-4 flex flex-col gap-4">
            {comment.replies.map((reply) => (
              <BlogCommentItemNode
                key={reply.commentId}
                comment={reply}
                depth={depth + 1}
                isLoggedIn={isLoggedIn}
                currentUserId={currentUserId}
                onReport={onReport}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}
