import { KeyRound, MoreHorizontal, NotebookPen, PencilLine } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PATHS } from '@/constants';
import { useToggleFollow } from '@/features/news';
import { getSafeImageUrl } from '@/utils/sanitize';

interface ProfileIdentityCardProps {
  name: string;
  avatarUrl?: string;
  /** Chỉ truyền ở chế độ hồ sơ của mình — không hiển thị email người khác. */
  email?: string;
  /** Nhãn vai trò (Trekker, Đối tác, ...) — bỏ qua nếu không xác định được. */
  roleLabel?: string;
  /** Số bài viết — lấy từ `/blogs?authorId=`, là số liệu thật. */
  blogCount?: number;
  isOwnProfile: boolean;
  /** Đường dẫn trang chỉnh sửa (chỉ dùng ở hồ sơ của mình). */
  editPath: string;
  /** Đường dẫn trang đổi mật khẩu (mặc định PATHS.CHANGE_PASSWORD). */
  changePasswordPath?: string;
  /** Id người dùng — cần cho nút Theo dõi ở hồ sơ người khác. */
  userId?: string;
}

const footerLinks = [
  { to: PATHS.ABOUT, label: 'Về chúng tôi' },
  { to: PATHS.TERMS, label: 'Điều khoản' },
  { to: PATHS.PRIVACY, label: 'Bảo mật' },
];

interface StatProps {
  label: string;
  value: string;
}

function Stat({ label, value }: StatProps) {
  return (
    <div className="min-w-0 flex-1 text-center">
      <p className="text-lg font-bold text-primary">{value}</p>
      <p className="truncate text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

/**
 * Card bên trái trang hồ sơ — theo reference AllTrails:
 * avatar lớn, tên, hàng chỉ số, nút hành động chính rồi các nút phụ dạng pill.
 *
 * `Người theo dõi` / `Đang theo dõi` hiển thị `—` chừng nào `FEATURES.SOCIAL`
 * chưa bật: repo có nguyên tắc không bịa số liệu khi BE chưa trả về.
 */
export function ProfileIdentityCard({
  name,
  avatarUrl,
  email,
  roleLabel,
  blogCount,
  isOwnProfile,
  editPath,
  changePasswordPath = PATHS.CHANGE_PASSWORD,
  userId,
}: ProfileIdentityCardProps) {
  const followMutation = useToggleFollow();
  const socialEnabled = followMutation.isAvailable;

  const safeAvatar = getSafeImageUrl(avatarUrl);
  const initial = name?.trim()?.[0]?.toUpperCase() || '?';

  return (
    <div className="flex flex-col gap-4">
      <section className="relative flex flex-col items-center rounded-3xl bg-card p-6 shadow-sm">
        <button
          type="button"
          aria-label="Tuỳ chọn hồ sơ"
          disabled
          title="Sắp ra mắt"
          className="absolute right-4 top-4 cursor-pointer rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          <MoreHorizontal className="size-5" />
        </button>

        {/* Avatar */}
        <div className="size-[120px] overflow-hidden rounded-full bg-muted ring-4 ring-muted">
          {safeAvatar ? (
            <img src={safeAvatar} alt={name} className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-primary text-4xl font-bold text-primary-foreground">
              {initial}
            </span>
          )}
        </div>

        {roleLabel ? (
          <span className="mt-4 inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary">
            {roleLabel}
          </span>
        ) : null}

        <h1 className="mt-3 text-center text-2xl font-bold leading-tight text-primary">{name}</h1>

        {/* Email chỉ hiện ở hồ sơ của chính mình */}
        {isOwnProfile && email ? (
          <p className="mt-1 max-w-full truncate text-sm text-muted-foreground">{email}</p>
        ) : null}

        {/* Chỉ số */}
        <div className="mt-5 flex w-full items-start divide-x divide-border">
          <Stat
            label="Bài viết"
            value={typeof blogCount === 'number' ? blogCount.toLocaleString('vi-VN') : '—'}
          />
          <Stat label="Người theo dõi" value="—" />
          <Stat label="Đang theo dõi" value="—" />
        </div>

        {/* Hành động chính */}
        {isOwnProfile ? (
          <Link
            to={editPath}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            <PencilLine className="size-4" />
            Chỉnh sửa hồ sơ
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => userId && followMutation.mutate({ userId, following: true })}
            disabled={!socialEnabled}
            title={socialEnabled ? undefined : 'Sắp ra mắt'}
            className="mt-5 inline-flex w-full cursor-pointer items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            Theo dõi
          </button>
        )}

        {/* Hành động phụ — chỉ có ý nghĩa với hồ sơ của mình */}
        {isOwnProfile ? (
          <div className="mt-3 flex w-full flex-col gap-2">
            <Link
              to={PATHS.TREKKER_BLOG_LIST}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-muted px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-accent"
            >
              <NotebookPen className="size-4" />
              Bài viết của tôi
            </Link>
            <Link
              to={changePasswordPath}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-muted px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-accent"
            >
              <KeyRound className="size-4" />
              Đổi mật khẩu
            </Link>
          </div>
        ) : null}
      </section>

      <footer className="px-2">
        <nav className="flex flex-wrap justify-center gap-x-3 gap-y-1.5">
          {footerLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} TrekSphere
        </p>
      </footer>
    </div>
  );
}
