import { CornerDownRight, Loader2, MessageSquare, Send, X } from 'lucide-react';
import type { FormEvent } from 'react';
import { useRef, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import { COMMENT_CONTENT_MAX_LENGTH } from '../../../constants/workspace';
import {
  useCreateGroupComment,
  useDeleteGroupComment,
  useGroupPostDetail,
} from '../../../hooks/useGroupFeedWorkspace';
import type { GroupPostCommentResponse } from '../../../types/workspace';
import { MemberAvatar } from '../../detail/MemberAvatar';
import { CommentItem } from './CommentItem';
import { DeleteCommentConfirmModal } from './DeleteCommentConfirmModal';

interface CommentSectionProps {
  groupId: string;
  postId: string;
  isLeader: boolean;
  currentUserId?: string;
}

export function CommentSection({ groupId, postId, isLeader, currentUserId }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ commentId: string; authorName: string } | null>(
    null
  );
  const [deletingComment, setDeletingComment] = useState<GroupPostCommentResponse | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const user = useAppStore((state) => state.user);
  const { data: postDetail, isLoading } = useGroupPostDetail(groupId, postId);
  const createCommentMutation = useCreateGroupComment(groupId, postId);
  const deleteCommentMutation = useDeleteGroupComment(groupId, postId);

  const comments: GroupPostCommentResponse[] = postDetail?.comments || [];

  function handleReply(targetComment: GroupPostCommentResponse) {
    const targetId =
      targetComment.groupPostCommentId || targetComment.commentId || targetComment.id || '';
    const authorName = targetComment.answeredByFullName || targetComment.authorName || 'Thành viên';
    setReplyingTo({ commentId: targetId, authorName });
    inputRef.current?.focus();
  }

  function handleCancelReply() {
    setReplyingTo(null);
  }

  async function handleSendComment(e: FormEvent) {
    e.preventDefault();
    const content = newComment.trim();
    if (!content) return;

    try {
      await createCommentMutation.mutateAsync({
        content,
        replyToCommentId: replyingTo?.commentId,
      });
      setNewComment('');
      setReplyingTo(null);
      toast.success(replyingTo ? 'Đã gửi câu trả lời!' : 'Đã gửi bình luận!');
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Không thể gửi bình luận. Vui lòng thử lại!';
      toast.error(errorMsg);
    }
  }

  async function handleConfirmDelete(commentId: string) {
    try {
      await deleteCommentMutation.mutateAsync(commentId);
      toast.success('Đã xóa bình luận thành công!');
      setDeletingComment(null);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Không thể xóa bình luận. Vui lòng thử lại!';
      toast.error(errorMsg);
    }
  }

  return (
    <div className="border-t border-border/60 bg-muted/20 px-5 py-4 space-y-4">
      {/* Create Comment Form */}
      <form onSubmit={handleSendComment} className="space-y-2">
        {/* Replying To Banner */}
        {replyingTo && (
          <div className="flex items-center justify-between rounded-xl bg-primary/10 px-3 py-1.5 text-xs text-primary border border-primary/20">
            <div className="flex items-center gap-1.5 min-w-0">
              <CornerDownRight className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">
                Đang trả lời <strong>@{replyingTo.authorName}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={handleCancelReply}
              className="rounded-md p-0.5 text-primary/70 hover:bg-primary/20 hover:text-primary transition cursor-pointer"
              title="Hủy trả lời"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <div className="flex gap-3">
          <MemberAvatar
            fullName={user?.name || 'Tôi'}
            avatarUrl={user?.avatarUrl}
            isLeader={isLeader}
            size="sm"
            className="mt-1"
          />

          <div className="flex-1 min-w-0 flex gap-2">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                maxLength={COMMENT_CONTENT_MAX_LENGTH}
                placeholder={
                  replyingTo
                    ? `Trả lời @${replyingTo.authorName}...`
                    : 'Viết câu trả lời hoặc thảo luận...'
                }
                disabled={createCommentMutation.isPending}
                className="w-full rounded-2xl border border-border bg-background px-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition"
              />
            </div>

            <button
              type="submit"
              disabled={createCommentMutation.isPending || !newComment.trim()}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition hover:bg-primary/90 disabled:opacity-40 cursor-pointer shadow-xs"
              title={replyingTo ? 'Gửi câu trả lời' : 'Gửi bình luận'}
            >
              {createCommentMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Comment List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-4 text-xs text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span>Đang tải bình luận...</span>
        </div>
      ) : comments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-3 text-center text-muted-foreground">
          <MessageSquare className="h-5 w-5 opacity-40 mb-1" />
          <p className="text-xs">Chưa có bình luận nào. Hãy là người đầu tiên thảo luận!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment, index) => {
            const commentId =
              comment.groupPostCommentId || comment.commentId || comment.id || `c-${index}`;
            return (
              <CommentItem
                key={commentId}
                groupId={groupId}
                postId={postId}
                comment={comment}
                currentUserId={currentUserId}
                isLeader={isLeader}
                onDelete={(c) => setDeletingComment(c)}
                onReply={handleReply}
              />
            );
          })}
        </div>
      )}

      {/* Delete Comment Dialog */}
      <DeleteCommentConfirmModal
        isOpen={Boolean(deletingComment)}
        onClose={() => setDeletingComment(null)}
        comment={deletingComment}
        isPending={deleteCommentMutation.isPending}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
}
