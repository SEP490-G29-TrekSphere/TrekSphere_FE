import { ChevronRight, MessageSquare } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from '@/store/useToastStore';
import { useDeleteGroupPost, useGroupPosts } from '../../../hooks/useGroupFeedWorkspace';
import type { GroupPostResponse } from '../../../types/workspace';
import { DeletePostConfirmModal } from '../feed/DeletePostConfirmModal';
import { EditPostModal } from '../feed/EditPostModal';
import { GroupPostCard } from '../feed/GroupPostCard';

const MAX_VISIBLE_POSTS = 3;

interface LeaderPostsWidgetProps {
  groupId: string;
  isLeader: boolean;
  currentUserId?: string;
  onViewFullFeed: () => void;
}

export function LeaderPostsWidget({
  groupId,
  isLeader,
  currentUserId,
  onViewFullFeed,
}: LeaderPostsWidgetProps) {
  const { data: postsData, isLoading } = useGroupPosts(groupId, { size: 20 });
  const [editingPost, setEditingPost] = useState<GroupPostResponse | null>(null);
  const [deletingPost, setDeletingPost] = useState<GroupPostResponse | null>(null);
  const deletePostMutation = useDeleteGroupPost(groupId);

  const leaderPosts = useMemo(() => {
    if (!postsData) return [];
    const all = Array.isArray(postsData) ? postsData : (postsData.content ?? []);
    return all
      .filter((p) => (p.postedByRole || p.authorRole) === 'LEADER')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, MAX_VISIBLE_POSTS);
  }, [postsData]);

  async function handleConfirmDelete(postId: string) {
    try {
      await deletePostMutation.mutateAsync(postId);
      toast.success('Đã xóa bài viết thành công!');
      setDeletingPost(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Không thể xóa bài viết. Vui lòng thử lại!');
    }
  }

  return (
    <div className="space-y-3 rounded-3xl border border-border bg-card p-6 shadow-xs">
      <div className="flex items-center justify-between gap-3">
        <h4 className="font-bold text-muted-foreground text-xs uppercase tracking-wider">
          Bài đăng của Trưởng nhóm
        </h4>
        <button
          type="button"
          onClick={onViewFullFeed}
          className="inline-flex items-center gap-0.5 text-[11px] font-bold text-primary hover:underline cursor-pointer"
        >
          Xem tất cả bài đăng
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {isLoading ? (
        <div className="h-24 animate-pulse rounded-2xl bg-muted" />
      ) : leaderPosts.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-8 text-center">
          <MessageSquare className="h-6 w-6 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Trưởng nhóm chưa đăng bài viết nào.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaderPosts.map((post, idx) => {
            const postId = post.groupPostId || post.postId || post.id || `leader-post-${idx}`;
            return (
              <GroupPostCard
                key={postId}
                groupId={groupId}
                post={post}
                currentUserId={currentUserId}
                isLeader={isLeader}
                onEdit={(p) => setEditingPost(p)}
                onDelete={(p) => setDeletingPost(p)}
              />
            );
          })}
        </div>
      )}

      <EditPostModal
        isOpen={Boolean(editingPost)}
        onClose={() => setEditingPost(null)}
        groupId={groupId}
        post={editingPost}
        isLeader={isLeader}
      />
      <DeletePostConfirmModal
        isOpen={Boolean(deletingPost)}
        onClose={() => setDeletingPost(null)}
        post={deletingPost}
        isPending={deletePostMutation.isPending}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
}
