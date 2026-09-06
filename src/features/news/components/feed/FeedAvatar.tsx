import { getSafeImageUrl } from '@/utils/sanitize';

interface FeedAvatarProps {
  src?: string;
  name: string;
  /** Đường kính tính bằng px. */
  size?: number;
  className?: string;
}

/**
 * Avatar tròn dùng chung trong community feed.
 * Không có ảnh (hoặc URL không an toàn) thì rơi về chữ cái đầu của tên.
 */
export function FeedAvatar({ src, name, size = 40, className = '' }: FeedAvatarProps) {
  const safeSrc = getSafeImageUrl(src);
  const initial = name?.trim()?.[0]?.toUpperCase() || 'U';

  return (
    <div
      className={`shrink-0 overflow-hidden rounded-full bg-accent ${className}`}
      style={{ width: size, height: size }}
    >
      {safeSrc ? (
        <img
          src={safeSrc}
          alt={name}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <span
          aria-hidden
          className="flex h-full w-full items-center justify-center font-bold text-primary"
          style={{ fontSize: size * 0.4 }}
        >
          {initial}
        </span>
      )}
    </div>
  );
}
