import { Link } from 'react-router-dom';
import { getNewsDetailPath } from '@/constants';
import type { BlogListItem } from '@/features/news';
import { getSafeImageUrl } from '@/utils/sanitize';

interface ProfilePhotoGridProps {
  posts: BlogListItem[];
  isLoading: boolean;
  emptyMessage: string;
}

/**
 * Tab "Ảnh" — lưới vuông 3 cột lấy ảnh bìa các bài viết của tác giả.
 * BE chưa có thư viện ảnh riêng, nên đây là nguồn ảnh thật duy nhất đang có.
 */
export function ProfilePhotoGrid({ posts, isLoading, emptyMessage }: ProfilePhotoGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="aspect-square animate-pulse rounded-lg bg-muted" aria-hidden />
        ))}
      </div>
    );
  }

  const photos = posts.filter((post) => getSafeImageUrl(post.coverImageUrl));

  if (photos.length === 0) {
    return (
      <div className="rounded-2xl bg-card py-16 text-center shadow-sm">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {photos.map((post) => (
        <Link
          key={post.blogId}
          to={getNewsDetailPath(post.blogId)}
          className="group aspect-square overflow-hidden rounded-lg bg-muted"
          aria-label={post.title}
        >
          <img
            src={getSafeImageUrl(post.coverImageUrl)}
            alt={post.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
      ))}
    </div>
  );
}
