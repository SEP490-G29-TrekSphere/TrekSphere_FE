import { Eye, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getNewsDetailPath } from '@/constants';
import type { BlogListItem } from '@/features/news';
import { formatDate } from '@/utils/format';
import { getSafeImageUrl } from '@/utils/sanitize';

interface ProfileBlogGridProps {
  posts: BlogListItem[];
  isLoading: boolean;
  /** Câu hiển thị khi tác giả chưa có bài viết nào. */
  emptyMessage: string;
}

function BlogTile({ post }: { post: BlogListItem }) {
  const cover = getSafeImageUrl(post.coverImageUrl);

  return (
    <article className="overflow-hidden rounded-2xl bg-card shadow-sm transition-shadow hover:shadow-md">
      <Link to={getNewsDetailPath(post.blogId)} className="block aspect-[16/10] bg-muted">
        {cover ? (
          <img
            src={cover}
            alt={post.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
          />
        ) : null}
      </Link>

      <div className="p-4">
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-primary">
          <Link to={getNewsDetailPath(post.blogId)} className="hover:text-primary-hover">
            {post.title}
          </Link>
        </h3>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>{formatDate(post.publishedAt)}</span>
          <span className="inline-flex items-center gap-1">
            <Eye className="size-3.5" />
            {typeof post.viewCount === 'number' ? post.viewCount.toLocaleString('vi-VN') : '—'}
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageCircle className="size-3.5" />
            {typeof post.commentCount === 'number'
              ? post.commentCount.toLocaleString('vi-VN')
              : '—'}
          </span>
        </div>
      </div>
    </article>
  );
}

/** Tab "Bài viết" — lưới bài viết của tác giả, dữ liệu từ `/blogs?authorId=`. */
export function ProfileBlogGrid({ posts, isLoading, emptyMessage }: ProfileBlogGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="overflow-hidden rounded-2xl bg-card shadow-sm" aria-hidden>
            <div className="aspect-[16/10] animate-pulse bg-muted" />
            <div className="space-y-2 p-4">
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-2xl bg-card py-16 text-center shadow-sm">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {posts.map((post) => (
        <BlogTile key={post.blogId} post={post} />
      ))}
    </div>
  );
}
