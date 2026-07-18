import { Link } from 'react-router-dom';
import { PATHS } from '@/constants';
import { AppLogo } from '@/shared/ui';

const EXPLORE_LINKS = [
  { label: 'Trang chủ', to: PATHS.HOME },
  { label: 'Tour du lịch', to: PATHS.TOURS },
  { label: 'Cộng đồng', to: PATHS.COMMUNITY },
  { label: 'Tin tức', to: PATHS.NEWS },
];

const SUPPORT_LINKS = [
  { label: 'Về chúng tôi', to: PATHS.ABOUT },
  { label: 'Liên hệ', to: PATHS.CONTACT },
  { label: 'Điều khoản sử dụng', to: PATHS.TERMS },
  { label: 'Chính sách bảo mật', to: PATHS.PRIVACY },
];

const SOCIAL = [
  {
    label: 'Facebook',
    href: 'https://facebook.com',
    icon: (
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com',
    icon: (
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com',
    icon: (
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
      </svg>
    ),
  },
];

/**
 * PublicFooter — footer cho landing page. Multi-column v2.
 */
export default function PublicFooter() {
  return (
    <footer className="footer-v2">
      {/* Main grid */}
      <div className="mx-auto max-w-none w-full px-4 sm:px-6 pt-14 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Column 1: Brand */}
          <div className="lg:col-span-1">
            <AppLogo height={40} to={PATHS.HOME} tone="light" />
            <p className="mt-4 text-sm text-white/60 leading-relaxed max-w-xs">
              Trải nghiệm trekking chuyên nghiệp, an toàn và bền vững tại Việt Nam.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {SOCIAL.map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="footer-social-btn"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Khám Phá */}
          <div>
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-5">
              Khám Phá
            </h3>
            <ul className="space-y-3">
              {EXPLORE_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Hỗ Trợ */}
          <div>
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-5">
              Hỗ Trợ
            </h3>
            <ul className="space-y-3">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Liên Hệ */}
          <div>
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-5">
              Liên Hệ
            </h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-2">
                <svg
                  className="w-4 h-4 mt-0.5 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                  />
                </svg>
                <span>123 Đường Trekking, Hà Nội, Việt Nam</span>
              </li>
              <li className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                  />
                </svg>
                <a href="mailto:hello@treksphere.vn" className="hover:text-white transition-colors">
                  hello@treksphere.vn
                </a>
              </li>
              <li className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                  />
                </svg>
                <a href="tel:+84123456789" className="hover:text-white transition-colors">
                  +84 123 456 789
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider + bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">&copy; 2024 TrekSphere. Mọi quyền được bảo lưu.</p>
          <p className="text-xs text-white/40 flex items-center gap-1">
            Made with
            <svg
              className="w-3.5 h-3.5 text-red-400 inline-block"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53L12 21.35z" />
            </svg>
            in Vietnam
          </p>
        </div>
      </div>
    </footer>
  );
}
