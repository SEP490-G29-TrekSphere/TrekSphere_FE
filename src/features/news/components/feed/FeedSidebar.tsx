import { PenLine } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PATHS } from '@/constants';
import { useSuggestedUsers, useToggleFollow } from '../../hooks/useSocial';
import type { SuggestedUser } from '../../types';
import { SuggestedUserRow } from './SuggestedUserRow';

interface FeedSidebarProps {
  isLoggedIn: boolean;
  /** Tag phổ biến rút từ các bài đang hiển thị trong feed. */
  topics: string[];
  /** Bấm một chủ đề sẽ đưa tag đó vào ô tìm kiếm. */
  onTopicSelect: (topic: string) => void;
}

const footerLinks = [
  { to: PATHS.ABOUT, label: 'Về chúng tôi' },
  { to: PATHS.TERMS, label: 'Điều khoản' },
  { to: PATHS.PRIVACY, label: 'Bảo mật' },
  { to: PATHS.CONTACT, label: 'Liên hệ' },
];

/**
 * Cột phải của community feed: nút viết bài, khối gợi ý theo dõi
 * (phụ thuộc `FEATURES.SOCIAL`), chủ đề nổi bật và footer links.
 * Chỉ hiển thị từ breakpoint `lg` trở lên.
 */
export function FeedSidebar({ isLoggedIn, topics, onTopicSelect }: FeedSidebarProps) {
  const { users, isLoading, isAvailable } = useSuggestedUsers(8);
  const followMutation = useToggleFollow();

  const handleToggleFollow = (user: SuggestedUser, following: boolean) => {
    followMutation.mutate({ userId: user.userId, following });
  };

  return (
    <aside className="flex flex-col gap-4">
      {/* Viết bài */}
      <Link
        to={isLoggedIn ? PATHS.BLOG_CREATE : PATHS.LOGIN}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
      >
        <PenLine className="size-4" />
        Viết bài mới
      </Link>

      {/* Gợi ý theo dõi */}
      <section className="rounded-2xl bg-card p-4 shadow-sm">
        <h2 className="text-sm font-bold text-primary">Gợi ý theo dõi</h2>

        {!isAvailable ? (
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Tính năng theo dõi đang được phát triển. Bạn sẽ sớm nhận được gợi ý từ những người có
            cùng sở thích khám phá.
          </p>
        ) : isLoading ? (
          <ul className="mt-2 space-y-3">
            {[0, 1, 2].map((i) => (
              <li key={i} className="flex items-center gap-3" aria-hidden>
                <div className="size-9 animate-pulse rounded-full bg-muted" />
                <div className="h-3.5 flex-1 animate-pulse rounded bg-muted" />
              </li>
            ))}
          </ul>
        ) : users.length === 0 ? (
          <p className="mt-2 text-xs text-muted-foreground">Chưa có gợi ý nào cho bạn.</p>
        ) : (
          <ul className="mt-1 divide-y divide-border">
            {users.map((user) => (
              <SuggestedUserRow key={user.userId} user={user} onToggleFollow={handleToggleFollow} />
            ))}
          </ul>
        )}
      </section>

      {/* Chủ đề nổi bật */}
      {topics.length > 0 ? (
        <section className="rounded-2xl bg-card p-4 shadow-sm">
          <h2 className="text-sm font-bold text-primary">Chủ đề nổi bật</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {topics.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => onTopicSelect(topic)}
                className="cursor-pointer rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-accent"
              >
                #{topic}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {/* Footer */}
      <footer className="px-2 pb-4">
        <nav className="flex flex-wrap gap-x-3 gap-y-1.5">
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
        <p className="mt-3 text-xs text-muted-foreground">
          © {new Date().getFullYear()} TrekSphere
        </p>
      </footer>
    </aside>
  );
}
