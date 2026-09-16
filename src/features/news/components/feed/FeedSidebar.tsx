import { Link } from 'react-router-dom';
import { PATHS } from '@/constants';

interface FeedSidebarProps {
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
 * Cột phải của community feed: chủ đề nổi bật và footer links.
 * Chỉ hiển thị từ breakpoint `lg` trở lên.
 */
export function FeedSidebar({ topics, onTopicSelect }: FeedSidebarProps) {
  return (
    <aside className="flex flex-col gap-4">
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
