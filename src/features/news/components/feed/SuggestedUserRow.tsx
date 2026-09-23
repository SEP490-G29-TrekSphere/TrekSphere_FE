import { X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getUserProfilePath } from '@/constants';
import type { SuggestedUser } from '../../types';
import { FeedAvatar } from './FeedAvatar';

interface SuggestedUserRowProps {
  user: SuggestedUser;
  /** Tắt khi `FEATURES.SOCIAL` chưa bật — nút vẫn hiển thị nhưng không bấm được. */
  disabled?: boolean;
  onToggleFollow?: (user: SuggestedUser, following: boolean) => void;
  onDismiss?: (user: SuggestedUser) => void;
}

/**
 * Một dòng trong khối "Gợi ý theo dõi": avatar, tên, dòng phụ,
 * nút Theo dõi và nút bỏ qua — theo reference AllTrails.
 */
export function SuggestedUserRow({
  user,
  disabled = false,
  onToggleFollow,
  onDismiss,
}: SuggestedUserRowProps) {
  const [following, setFollowing] = useState(Boolean(user.isFollowing));

  const handleToggle = () => {
    if (disabled) return;
    const next = !following;
    setFollowing(next);
    onToggleFollow?.(user, next);
  };

  return (
    <li className="flex items-center gap-3 py-2.5">
      <Link to={getUserProfilePath(user.userId)} aria-label={`Hồ sơ của ${user.fullName}`}>
        <FeedAvatar src={user.avatarUrl} name={user.fullName} size={36} />
      </Link>

      <div className="min-w-0 flex-1">
        <Link
          to={getUserProfilePath(user.userId)}
          className="block truncate text-sm font-semibold text-primary transition-colors hover:text-primary-hover"
        >
          {user.fullName}
        </Link>
        {user.subtitle ? (
          <p className="truncate text-xs text-muted-foreground">{user.subtitle}</p>
        ) : null}
      </div>

      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        title={disabled ? 'Sắp ra mắt' : undefined}
        className={`shrink-0 cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
          following
            ? 'bg-muted text-muted-foreground hover:bg-border'
            : 'bg-accent text-primary hover:bg-accent/80'
        }`}
      >
        {following ? 'Đang theo dõi' : 'Theo dõi'}
      </button>

      <button
        type="button"
        onClick={() => onDismiss?.(user)}
        aria-label={`Bỏ qua gợi ý ${user.fullName}`}
        className="shrink-0 cursor-pointer rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
      >
        <X className="size-4" />
      </button>
    </li>
  );
}
