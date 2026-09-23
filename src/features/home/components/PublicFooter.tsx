import { Link } from 'react-router-dom';
import { PATHS } from '@/constants';
import { AppLogo } from '@/shared/ui';

const footerLinks = [
  { to: PATHS.ABOUT, label: 'Về chúng tôi' },
  { to: PATHS.TERMS, label: 'Điều khoản' },
  { to: PATHS.PRIVACY, label: 'Bảo mật' },
  { to: PATHS.CONTACT, label: 'Liên hệ' },
];

export default function PublicFooter() {
  return (
    <footer className="border-t border-border/60 bg-background/80">
      <div className="mx-auto flex flex-col sm:flex-row min-h-16 max-w-7xl w-full items-center justify-between gap-4 px-4 sm:px-6 py-4">
        <div className="flex items-center gap-3">
          <AppLogo height={32} to={PATHS.HOME} />
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} TrekSphere.
          </p>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
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
      </div>
    </footer>
  );
}
