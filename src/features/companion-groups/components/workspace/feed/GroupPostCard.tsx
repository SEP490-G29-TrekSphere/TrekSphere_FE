import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Edit2,
  Eye,
  EyeOff,
  MessageSquare,
  MoreVertical,
  Pin,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { toast } from '@/store/useToastStore';
import { POST_TYPE_META } from '../../../constants/workspace';
import { useToggleHideGroupPost } from '../../../hooks/useGroupFeedWorkspace';
import type { GroupPostResponse, GroupPostType } from '../../../types/workspace';
import { formatRelativeTime } from '../../../utils/workspaceDate';
import { MemberAvatar } from '../../detail/MemberAvatar';
import { CommentSection } from './CommentSection';

interface GroupPostCardProps {
  groupId: string;
  post: GroupPostResponse;
  currentUserId?: string;
  isLeader: boolean;
  onEdit: (post: GroupPostResponse) => void;
  onDelete: (post: GroupPostResponse) => void;
}

export function GroupPostCard({
  groupId,
  post,
  currentUserId,
  isLeader,
  onEdit,
  onDelete,
}: GroupPostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const postId = post.groupPostId || post.postId || post.id || '';
  const authorName = post.postedByFullName || post.authorName || 'Thành viên';
  const authorAvatar = post.postedByAvatarUrl || post.authorAvatarUrl;
  const authorRole = post.postedByRole || post.authorRole;
  const authorUserId = post.postedByUserId || post.authorUserId;
  const isAuthorLeader = authorRole === 'LEADER';
  const isAuthor = Boolean(currentUserId && authorUserId && currentUserId === authorUserId);
  const isHidden = post.status === 'HIDDEN' || Boolean(post.isHidden);
  const isPinned = Boolean(post.isPinned);

  const postType = (post.postType as GroupPostType) || 'GENERAL';
  const typeMeta = POST_TYPE_META[postType] || POST_TYPE_META.GENERAL;

  const toggleHideMutation = useToggleHideGroupPost(groupId);

  async function handleToggleHide() {
    if (!postId) return;

    try {
      await toggleHideMutation.mutateAsync(postId);
      toast.success(isHidden ? 'Đã hiện bài viết!' : 'Đã ẩn bài viết kiểm duyệt!');
      setShowMenu(false);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Không thể cập nhật trạng thái bài viết!';
      toast.error(errorMsg);
    }
  }

  return (
    <div
      className={cn(
        'rounded-3xl border bg-card shadow-xs transition overflow-hidden',
        isPinned ? 'border-primary/40 ring-1 ring-primary/20' : 'border-border',
        isHidden ? 'bg-muted/30 opacity-80 border-dashed border-destructive/30' : ''
      )}
    >
      {/* Pinned Top Banner */}
      {isPinned && (
        <div className="flex items-center gap-1.5 bg-primary/10 px-5 py-1.5 text-[11px] font-bold text-primary border-b border-primary/20">
          <Pin className="h-3 w-3" />
          <span>Bài viết được ghim bởi Trưởng nhóm</span>
        </div>
      )}

      {/* Main Card Content */}
      <div className="p-5 space-y-3.5">
        {/* Author & Header Section */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <MemberAvatar
              fullName={authorName}
              avatarUrl={authorAvatar ?? undefined}
              isLeader={isAuthorLeader}
              size="md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-foreground">{authorName}</h4>
                {isAuthorLeader && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-2 py-0.2 text-[10px] font-bold text-primary border border-primary/20">
                    <CheckCircle2 className="h-2.5 w-2.5" /> Trưởng nhóm
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                {formatRelativeTime(post.createdAt)}
              </p>
            </div>
          </div>

          {/* Badges & Actions */}
          <div className="flex items-center gap-2">
            {/* Post Type Badge */}
            <span
              className={cn(
                'rounded-full px-2.5 py-0.5 text-[10px] font-bold border',
                typeMeta.bgClass,
                typeMeta.textClass,
                typeMeta.borderClass
              )}
            >
              {typeMeta.label}
            </span>

            {/* Hidden Badge */}
            {isHidden && (
              <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-0.5 text-[10px] font-bold text-destructive border border-destructive/20">
                <EyeOff className="h-3 w-3" /> Đã ẩn
              </span>
            )}

            {/* Action Menu (Author / Leader) */}
            {(isAuthor || isLeader) && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowMenu((prev) => !prev)}
                  className="rounded-xl p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer"
                  title="Tùy chọn bài viết"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>

                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowMenu(false)}
                      aria-hidden="true"
                    />
                    <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-2xl border border-border bg-card p-1 shadow-lg">
                      {isAuthor && (
                        <button
                          type="button"
                          onClick={() => {
                            onEdit(post);
                            setShowMenu(false);
                          }}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-foreground hover:bg-muted transition cursor-pointer"
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
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-foreground hover:bg-muted transition cursor-pointer"
                        >
                          {isHidden ? (
                            <>
                              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>Hiện bài viết</span>
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
                            onDelete(post);
                            setShowMenu(false);
                          }}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-destructive hover:bg-destructive/10 transition cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Xóa bài viết</span>
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        {post.title && (
          <h3 className="text-sm font-extrabold text-foreground leading-snug">{post.title}</h3>
        )}

        {/* Content */}
        <p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
          {post.content}
        </p>

        {/* Image attachments if any */}
        {post.imageUrls && post.imageUrls.length > 0 && (
          <div className="grid grid-cols-2 gap-2 pt-1 sm:grid-cols-3">
            {post.imageUrls.map((imgUrl, idx) => (
              <img
                key={imgUrl || `img-${idx}`}
                src={imgUrl}
                alt={`Ảnh đính kèm ${idx + 1}`}
                className="h-36 w-full rounded-2xl object-cover border border-border"
              />
            ))}
          </div>
        )}

        {/* Post Footer Interaction */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <button
            type="button"
            onClick={() => setShowComments((prev) => !prev)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-muted/50 px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted transition cursor-pointer"
          >
            <MessageSquare className="h-3.5 w-3.5 text-primary" />
            <span>{post.commentCount > 0 ? `${post.commentCount} bình luận` : 'Bình luận'}</span>
            {showComments ? (
              <ChevronUp className="h-3.5 w-3.5 ml-1 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 ml-1 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Comment Section */}
      {showComments && (
        <CommentSection
          groupId={groupId}
          postId={postId}
          isLeader={isLeader}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
}
