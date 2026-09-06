import { Heart, MessageCircle, MoreHorizontal, ThumbsUp } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getUserProfilePath, PATHS } from '@/constants';
import { formatDate } from '@/utils/format';
import { getSafeImageUrl } from '@/utils/sanitize';
import { useToggleBlogLike, useToggleFollow } from '../../hooks/useSocial';
import type { BlogListItem } from '../../types';
import { FeedAvatar } from './FeedAvatar';

interface FeedPostCardProps {
  post: BlogListItem;
}

/** Nhãn hiển thị khi BE chưa trả về số liệu tương ứng. */
const EMPTY_STAT = '—';

interface StatProps {
  label: string;
  value: string;
}

function Stat({ label, value }: StatProps) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 truncate text-sm font-bold text-primary">{value}</p>
    </div>
  );
}

/**
 * Thẻ bài viết trong community feed — bố cục theo reference AllTrails:
 * header tác giả → ảnh lớn bo góc (nút tim nổi góc phải) → tiêu đề → tags →
 * hàng 3 chỉ số → divider → hàng hành động Thích / Bình luận.
 *
 * Các nút Thích và Theo dõi phụ thuộc `FEATURES.SOCIAL`; khi BE chưa có endpoint
 * chúng vẫn hiển thị đúng design nhưng ở trạng thái vô hiệu hoá.
 */
export function FeedPostCard({ post }: FeedPostCardProps) {
  const detailLink = PATHS.NEWS_DETAIL.replace(':blogId', post.blogId);
  const authorLink = getUserProfilePath(post.authorId);
  const coverUrl = getSafeImageUrl(post.coverImageUrl);

  const likeMutation = useToggleBlogLike();
  const followMutation = useToggleFollow();

  // State lạc quan: cập nhật ngay trên UI, BE là nguồn sự thật sau khi invalidate.
  const [liked, setLiked] = useState(Boolean(post.likedByMe));
  const [following, setFollowing] = useState(Boolean(post.isFollowingAuthor));

  const socialEnabled = likeMutation.isAvailable;
  const socialTitle = socialEnabled ? undefined : 'Sắp ra mắt';

  const likeCount =
    typeof post.likeCount === 'number'
      ? post.likeCount + (liked && !post.likedByMe ? 1 : 0) - (!liked && post.likedByMe ? 1 : 0)
      : undefined;

  const handleToggleLike = () => {
    if (!socialEnabled) return;
    const next = !liked;
    setLiked(next);
    likeMutation.mutate({ blogId: post.blogId, liked: next }, { onError: () => setLiked(!next) });
  };

  const handleToggleFollow = () => {
    if (!socialEnabled) return;
    const next = !following;
    setFollowing(next);
    followMutation.mutate(
      { userId: post.authorId, following: next },
      { onError: () => setFollowing(!next) }
    );
  };

  return (
    <article className="rounded-2xl bg-card p-4 shadow-sm sm:p-5">
      {/* Header tác giả */}
      <div className="flex items-start gap-3">
        <Link to={authorLink} aria-label={`Hồ sơ của ${post.authorName}`}>
          <FeedAvatar src={post.authorAvatarUrl} name={post.authorName} size={40} />
        </Link>

        <div className="min-w-0 flex-1">
          <Link
            to={authorLink}
            className="block truncate text-sm font-bold text-primary transition-colors hover:text-primary-hover"
          >
            {post.authorName}
          </Link>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>{formatDate(post.publishedAt)}</span>
            <span aria-hidden>·</span>
            <button
              type="button"
              onClick={handleToggleFollow}
              disabled={!socialEnabled}
              title={socialTitle}
              className="cursor-pointer font-semibold text-primary underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:no-underline"
            >
              {following ? 'Đang theo dõi' : 'Theo dõi'}
            </button>
          </p>
        </div>

        <button
          type="button"
          aria-label="Tuỳ chọn bài viết"
          disabled
          title="Sắp ra mắt"
          className="cursor-pointer rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          <MoreHorizontal className="size-5" />
        </button>
      </div>

      {/* Ảnh bìa */}
      <div className="relative mt-3 overflow-hidden rounded-xl bg-muted">
        <Link to={detailLink} aria-label={post.title} className="block aspect-[4/3]">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={post.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
              onError={(e) => {
                e.currentTarget.style.opacity = '0';
              }}
            />
          ) : null}
        </Link>

        {post.categoryName ? (
          <span className="pointer-events-none absolute left-3 top-3 inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary shadow-sm">
            {post.categoryName}
          </span>
        ) : null}

        <button
          type="button"
          onClick={handleToggleLike}
          disabled={!socialEnabled}
          title={socialTitle}
          aria-pressed={liked}
          aria-label={liked ? 'Bỏ thích bài viết' : 'Thích bài viết'}
          className="absolute right-3 top-3 flex size-9 cursor-pointer items-center justify-center rounded-full bg-card shadow-md transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
        >
          <Heart
            className={`size-[18px] ${liked ? 'fill-destructive text-destructive' : 'text-primary'}`}
          />
        </button>
      </div>

      {/* Tiêu đề */}
      <h2 className="mt-3 text-base font-bold leading-snug text-primary sm:text-lg">
        <Link to={detailLink} className="transition-colors hover:text-primary-hover">
          {post.title}
        </Link>
      </h2>

      {/* Tags */}
      {post.tags?.length ? (
        <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground">
          {post.tags.slice(0, 3).map((tag, index) => (
            <span key={tag} className="flex items-center gap-1.5">
              {index > 0 ? <span aria-hidden>·</span> : null}
              <span className="font-semibold text-primary/70">#{tag}</span>
            </span>
          ))}
        </p>
      ) : null}

      {/* Chỉ số */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <Stat
          label="Thời gian đọc"
          value={post.readingTimeMinutes ? `${post.readingTimeMinutes} phút` : EMPTY_STAT}
        />
        <Stat
          label="Lượt xem"
          value={
            typeof post.viewCount === 'number' ? post.viewCount.toLocaleString('vi-VN') : EMPTY_STAT
          }
        />
        <Stat
          label="Bình luận"
          value={
            typeof post.commentCount === 'number'
              ? post.commentCount.toLocaleString('vi-VN')
              : EMPTY_STAT
          }
        />
      </div>

      {/* Hành động */}
      <div className="mt-4 flex items-center gap-1 border-t border-border pt-3">
        <button
          type="button"
          onClick={handleToggleLike}
          disabled={!socialEnabled}
          title={socialTitle}
          className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent ${
            liked ? 'text-destructive' : 'text-muted-foreground'
          }`}
        >
          <ThumbsUp className="size-4" />
          Thích
        </button>

        <Link
          to={detailLink}
          className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted"
        >
          <MessageCircle className="size-4" />
          Bình luận
        </Link>

        {typeof likeCount === 'number' ? (
          <span className="ml-auto text-xs text-muted-foreground">
            {likeCount.toLocaleString('vi-VN')} lượt thích
          </span>
        ) : null}
      </div>
    </article>
  );
}
