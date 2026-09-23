import {
  CheckCircle2,
  Edit2,
  Eye,
  EyeOff,
  Loader2,
  MessageSquareReply,
  MoreVertical,
  Trash2,
} from 'lucide-react';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { toast } from '@/store/useToastStore';
import { COMMENT_CONTENT_MAX_LENGTH } from '../../../constants/workspace';
import {
  useToggleHideGroupComment,
  useUpdateGroupComment,
} from '../../../hooks/useGroupFeedWorkspace';
import type { GroupPostCommentResponse } from '../../../types/workspace';
import { formatRelativeTime } from '../../../utils/workspaceDate';
import { MemberAvatar } from '../../detail/MemberAvatar';

interface CommentItemProps {
  groupId: string;
  postId: string;
  comment: GroupPostCommentResponse;
  currentUserId?: string;
  isLeader: boolean;
  isReply?: boolean;
  onDelete: (comment: GroupPostCommentResponse) => void;
  onReply: (comment: GroupPostCommentResponse) => void;
}

export function CommentItem({
  groupId,
  postId,
  comment,
  currentUserId,
  isLeader,
  isReply = false,
  onDelete,
  onReply,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content || '');
  const [showMenu, setShowMenu] = useState(false);

  const commentId = comment.groupPostCommentId || comment.commentId || comment.id || '';
  const authorName = comment.answeredByFullName || comment.authorName || 'Thành viên';
  const authorAvatar = comment.answeredByAvatarUrl || comment.authorAvatarUrl;
  const authorRole = comment.answeredByRole || comment.authorRole;
  const authorUserId = comment.answeredByUserId || comment.authorUserId;
  const isAuthorLeader = authorRole === 'LEADER';
  const isAuthor = Boolean(currentUserId && authorUserId && currentUserId === authorUserId);
  const isHidden = comment.status === 'HIDDEN';

  const updateCommentMutation = useUpdateGroupComment(groupId, postId);
  const toggleHideMutation = useToggleHideGroupComment(groupId, postId);

  async function handleSaveEdit() {
    if (!commentId || !editContent.trim()) return;

    try {
      await updateCommentMutation.mutateAsync({
        commentId,
        payload: { content: editContent.trim() },
      });
      toast.success('Đã cập nhật bình luận!');
      setIsEditing(false);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Không thể cập nhật bình luận. Vui lòng thử lại!';
      toast.error(errorMsg);
    }
  }

  async function handleToggleHide() {
    if (!commentId) return;

    try {
      await toggleHideMutation.mutateAsync(commentId);
      toast.success(isHidden ? 'Đã hiện bình luận!' : 'Đã ẩn bình luận kiểm duyệt!');
      setShowMenu(false);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Không thể cập nhật trạng thái bình luận!';
      toast.error(errorMsg);
    }
  }

  const replies = comment.replies || [];

  return (
    <div className={cn('space-y-2', isReply ? 'pt-1' : '')}>
      <div
        className={cn(
          'group/comment flex gap-3 rounded-2xl p-3 transition',
          isHidden
            ? 'bg-destructive/5 border border-destructive/20 opacity-75'
            : isReply
              ? 'bg-muted/30 hover:bg-muted/60'
              : 'bg-muted/40 hover:bg-muted/70'
        )}
      >
        {/* Avatar */}
        <MemberAvatar
          fullName={authorName}
          avatarUrl={authorAvatar ?? undefined}
          isLeader={isAuthorLeader}
          size="sm"
          className="mt-0.5"
        />

        {/* Main Comment Area */}
        <div className="flex-1 min-w-0 space-y-1">
          {/* Header line */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="font-bold text-foreground">{authorName}</span>
              {isAuthorLeader && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.2 text-[10px] font-bold text-primary">
                  <CheckCircle2 className="h-2.5 w-2.5" /> Trưởng nhóm
                </span>
              )}
              <span className="text-[11px] text-muted-foreground">
                • {formatRelativeTime(comment.createdAt)}
              </span>
              {isHidden && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-destructive/10 px-1.5 py-0.2 text-[10px] font-bold text-destructive">
                  <EyeOff className="h-2.5 w-2.5" /> Đã ẩn
                </span>
              )}
            </div>

            {/* Action Menu button (Author or Leader) */}
            {(isAuthor || isLeader) && !isEditing && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowMenu((prev) => !prev)}
                  className="opacity-0 group-hover/comment:opacity-100 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer"
                  title="Tùy chọn bình luận"
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </button>

                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowMenu(false)}
                      aria-hidden="true"
                    />
                    <div className="absolute right-0 top-full z-20 mt-1 w-36 rounded-xl border border-border bg-card p-1 shadow-lg">
                      {isAuthor && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(true);
                            setEditContent(comment.content);
                            setShowMenu(false);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-foreground hover:bg-muted transition cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>Chỉnh sửa</span>
                        </button>
                      )}

                      {isLeader && (
                        <button
                          type="button"
                          onClick={handleToggleHide}
                          disabled={toggleHideMutation.isPending}
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-foreground hover:bg-muted transition cursor-pointer"
                        >
                          {isHidden ? (
                            <>
                              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>Hiện bình luận</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>Ẩn kiểm duyệt</span>
                            </>
                          )}
                        </button>
                      )}

                      {(isAuthor || isLeader) && (
                        <button
                          type="button"
                          onClick={() => {
                            onDelete(comment);
                            setShowMenu(false);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-destructive hover:bg-destructive/10 transition cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Xóa</span>
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Content or Edit Box */}
          {isEditing ? (
            <div className="space-y-2 pt-1">
              <textarea
                rows={2}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                maxLength={COMMENT_CONTENT_MAX_LENGTH}
                className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition resize-none"
              />
              <div className="flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={updateCommentMutation.isPending}
                  className="rounded-lg px-2.5 py-1 text-[11px] font-semibold text-muted-foreground hover:bg-muted transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={updateCommentMutation.isPending || !editContent.trim()}
                  className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1 text-[11px] font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition cursor-pointer"
                >
                  {updateCommentMutation.isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <span>Lưu</span>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs leading-relaxed text-foreground whitespace-pre-wrap">
              {comment.replyToFullName && isReply && (
                <span className="font-bold text-primary mr-1 hover:underline cursor-pointer">
                  @{comment.replyToFullName}
                </span>
              )}
              {comment.content}
            </p>
          )}

          {/* Footer Action Buttons */}
          {!isEditing && (
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => onReply(comment)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-primary transition cursor-pointer"
              >
                <MessageSquareReply className="h-3 w-3" />
                <span>Trả lời</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Nested Replies List (2-level hierarchy) */}
      {!isReply && replies.length > 0 && (
        <div className="ml-5 border-l-2 border-border/60 pl-3.5 space-y-2">
          {replies.map((reply, rIdx) => {
            const replyId =
              reply.groupPostCommentId || reply.commentId || reply.id || `reply-${rIdx}`;
            return (
              <CommentItem
                key={replyId}
                groupId={groupId}
                postId={postId}
                comment={reply}
                currentUserId={currentUserId}
                isLeader={isLeader}
                isReply
                onDelete={onDelete}
                onReply={onReply}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
