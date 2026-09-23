import { FileText, PenSquare } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PATHS } from '@/constants';
import { FeedPostCard } from '@/features/news/components/feed/FeedPostCard';
import { FeedPostSkeleton } from '@/features/news/components/feed/FeedPostSkeleton';
import { AppButton } from '@/shared/ui';
import { useUserBlogs } from '../../hooks/usePublicProfile';

interface ProfileBlogsPanelProps {
  userId?: string;
  isOwnProfile: boolean;
}

/**
 * Tab "Bài viết" trong trang hồ sơ — hiển thị danh sách các bài viết / blog
 * mà người dùng đã chia sẻ trên cộng đồng TrekSphere.
 */
export function ProfileBlogsPanel({ userId, isOwnProfile }: ProfileBlogsPanelProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useUserBlogs(userId, page);

  const posts = data?.items ?? [];
  const totalElements = data?.meta.totalElements ?? 0;
  const totalPages = data?.meta.totalPages ?? 1;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <FeedPostSkeleton />
        <FeedPostSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl bg-card p-10 text-center shadow-xs border border-border">
        <p className="text-sm font-semibold text-destructive">
          Không thể tải danh sách bài viết. Vui lòng thử lại sau.
        </p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl bg-card px-6 py-14 text-center shadow-xs border border-border">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <FileText className="size-7" />
        </div>
        <h3 className="mt-4 text-base font-bold text-foreground">Chưa có bài viết nào</h3>
        <p className="mx-auto mt-1.5 max-w-md text-xs text-muted-foreground">
          {isOwnProfile
            ? 'Bạn chưa đăng bài viết nào. Hãy chia sẻ trải nghiệm, kinh nghiệm leo núi và mẹo trekking của bạn với cộng đồng!'
            : 'Người dùng này chưa xuất bản bài viết nào.'}
        </p>
        {isOwnProfile && (
          <Link
            to={PATHS.TREKKER_BLOG_CREATE}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            <PenSquare className="size-4" />
            Viết bài đầu tiên
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
          <FileText className="size-4 text-primary" />
          Bài viết đã đăng ({totalElements})
        </h3>
        {isOwnProfile && (
          <Link
            to={PATHS.TREKKER_BLOG_CREATE}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-primary/20"
          >
            <PenSquare className="size-3.5" />
            Tạo bài viết mới
          </Link>
        )}
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <FeedPostCard key={post.blogId} post={post} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <AppButton
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            className="rounded-full"
          >
            Trang trước
          </AppButton>
          <span className="text-xs font-semibold text-muted-foreground">
            Trang {page} / {totalPages}
          </span>
          <AppButton
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            className="rounded-full"
          >
            Trang sau
          </AppButton>
        </div>
      )}
    </div>
  );
}
