import { AlertCircle, Bell, HelpCircle, Layers, MessageSquare, RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { AppEmptyState } from '@/shared/ui';
import { toast } from '@/store/useToastStore';
import { useDeleteGroupPost, useGroupPosts } from '../../../hooks/useGroupFeedWorkspace';
import type { GroupPostResponse, GroupPostType } from '../../../types/workspace';
import { CreatePostCard } from './CreatePostCard';
import { DeletePostConfirmModal } from './DeletePostConfirmModal';
import { EditPostModal } from './EditPostModal';
import { GroupPostCard } from './GroupPostCard';

interface GroupFeedTabProps {
  groupId: string;
  isLeader: boolean;
  currentUserId?: string;
}

type FeedFilterType = 'ALL' | GroupPostType;

const FEED_FILTER_TABS: { id: FeedFilterType; label: string; icon: typeof Layers }[] = [
  { id: 'ALL', label: 'Tất cả bài viết', icon: Layers },
  { id: 'ANNOUNCEMENT', label: 'Thông báo', icon: Bell },
  { id: 'DISCUSSION', label: 'Thảo luận', icon: MessageSquare },
  { id: 'QUESTION', label: 'Hỏi đáp', icon: HelpCircle },
];

export function GroupFeedTab({ groupId, isLeader, currentUserId }: GroupFeedTabProps) {
  const [activeFilter, setActiveFilter] = useState<FeedFilterType>('ALL');
  const [editingPost, setEditingPost] = useState<GroupPostResponse | null>(null);
  const [deletingPost, setDeletingPost] = useState<GroupPostResponse | null>(null);

  const { data: postsData, isLoading, isError, refetch } = useGroupPosts(groupId);
  const deletePostMutation = useDeleteGroupPost(groupId);

  // Normalize posts array whether API returns Page<GroupPostResponse> or GroupPostResponse[]
  const allPosts: GroupPostResponse[] = useMemo(() => {
    if (!postsData) return [];
    if (Array.isArray(postsData)) return postsData;
    if (Array.isArray(postsData.content)) return postsData.content;
    return [];
  }, [postsData]);

  // Filter posts based on activeFilter
  const filteredPosts = useMemo(() => {
    let list = [...allPosts];
    if (activeFilter !== 'ALL') {
      list = list.filter((p) => p.postType === activeFilter);
    }
    // Sort pinned posts first, then newest first
    return list.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  }, [allPosts, activeFilter]);

  async function handleConfirmDelete(postId: string) {
    try {
      await deletePostMutation.mutateAsync(postId);
      toast.success('Đã xóa bài viết thành công!');
      setDeletingPost(null);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Không thể xóa bài viết. Vui lòng thử lại!';
      toast.error(errorMsg);
    }
  }

  return (
    <div className="space-y-6">
      {/* Create New Post Card */}
      <CreatePostCard groupId={groupId} isLeader={isLeader} />

      {/* Filter Chips / Categories */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="scrollbar-none flex overflow-x-auto gap-1.5 rounded-2xl border border-border bg-card p-1.5 shadow-2xs">
          {FEED_FILTER_TABS.map((tab) => {
            const Icon = tab.icon;
            const count =
              tab.id === 'ALL'
                ? allPosts.length
                : allPosts.filter((p) => p.postType === tab.id).length;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={cn(
                  'flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer',
                  activeFilter === tab.id
                    ? 'bg-primary text-primary-foreground shadow-2xs'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.2 text-[10px] font-extrabold',
                    activeFilter === tab.id
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer shadow-2xs"
          title="Tải lại bảng tin"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Posts Content Area */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((skeletonId) => (
            <div
              key={skeletonId}
              className="rounded-3xl border border-border bg-card p-6 shadow-xs animate-pulse space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-muted" />
                <div className="space-y-2 flex-1">
                  <div className="h-3.5 w-36 rounded-md bg-muted" />
                  <div className="h-2.5 w-20 rounded-md bg-muted" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-3/4 rounded-md bg-muted" />
                <div className="h-3 w-full rounded-md bg-muted" />
                <div className="h-3 w-5/6 rounded-md bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-8 text-center space-y-3">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
          <h4 className="text-sm font-bold text-foreground">Không thể tải dữ liệu bảng tin</h4>
          <p className="text-xs text-muted-foreground">
            Đã xảy ra lỗi khi kết nối với máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-destructive px-4 py-2 text-xs font-bold text-destructive-foreground hover:bg-destructive/90 transition cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Thử lại
          </button>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card p-8">
          <AppEmptyState
            title="Chưa có bài viết nào"
            description={
              activeFilter === 'ALL'
                ? 'Nhóm chưa có bài thảo luận hoặc thông báo nào. Hãy đăng bài đầu tiên!'
                : `Không tìm thấy bài viết nào trong mục "${FEED_FILTER_TABS.find((t) => t.id === activeFilter)?.label}".`
            }
          />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post, idx) => {
            const postId = post.groupPostId || post.postId || post.id || `post-${idx}`;
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

      {/* Edit Post Modal */}
      <EditPostModal
        isOpen={Boolean(editingPost)}
        onClose={() => setEditingPost(null)}
        groupId={groupId}
        post={editingPost}
        isLeader={isLeader}
      />

      {/* Delete Post Confirm Modal */}
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
