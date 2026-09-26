import { LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PATHS } from '@/constants';
import { getRoleDashboardPath } from '@/constants/roles';
import { useLogout } from '@/features/auth/hooks/useLogout';
import NotificationBell from '@/shared/components/NotificationBell';
import { usePushToastOnMenu } from '@/shared/hooks';
import { AppLogo } from '@/shared/ui';
import { useAppStore } from '@/store/useAppStore';

const NAV_ITEMS = [
  { label: 'Trang chủ', path: PATHS.HOME },
  { label: 'Danh sách Tour', path: PATHS.TOURS },
  { label: 'Ghép nhóm', path: PATHS.GROUPS },
  { label: 'Bài viết', path: PATHS.NEWS },
];

const HERO_PAGES: string[] = [PATHS.HOME, PATHS.TOURS, PATHS.GROUPS];

function isNavItemActive(pathname: string, itemPath: string): boolean {
  if (itemPath === PATHS.HOME) {
    return pathname === PATHS.HOME;
  }
  return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
}

export default function PublicHeader() {
  const location = useLocation();
  const user = useAppStore((state) => state.user);
  const { logout } = useLogout();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  usePushToastOnMenu('public-header-avatar', dropdownOpen, 260);
  usePushToastOnMenu('public-header-mobile', mobileMenuOpen, 220);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset popups on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
    setNotificationOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    setNotificationOpen(false);
    setMobileMenuOpen(false);
    await logout();
  };

  const initial = user?.name?.charAt(0).toUpperCase() ?? 'A';
  const dashboardPath = getRoleDashboardPath(user?.roles);

  // Transparent header over cinematic hero pages (Home, Tours, Matching Discover)
  const isHero = HERO_PAGES.includes(location.pathname);
  const transparent = isHero && !scrolled;

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        transparent
          ? 'bg-transparent border-b border-transparent'
          : 'bg-background/85 backdrop-blur-[16px] border-b border-border/60 shadow-sm'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-none w-full items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen((prev) => {
                const next = !prev;
                if (next) {
                  setDropdownOpen(false);
                  setNotificationOpen(false);
                }
                return next;
              });
            }}
            className={`flex size-9 items-center justify-center rounded-lg transition-colors md:hidden cursor-pointer ${
              transparent ? 'text-white hover:bg-white/10' : 'text-foreground hover:bg-muted'
            }`}
            aria-label="Mở menu điều hướng"
            aria-expanded={mobileMenuOpen}
            aria-controls="public-mobile-nav"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>

          <AppLogo height={40} to={PATHS.HOME} tone={transparent ? 'light' : undefined} />
        </div>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => {
            const isActive = isNavItemActive(location.pathname, item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative text-sm font-medium transition-colors ${
                  transparent
                    ? isActive
                      ? 'text-white font-semibold'
                      : 'text-white/80 hover:text-white'
                    : isActive
                      ? 'text-primary font-semibold'
                      : 'text-muted-foreground hover:text-primary'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    className={`absolute -bottom-1 left-0 right-0 h-0.5 rounded-full ${
                      transparent ? 'bg-white' : 'bg-primary'
                    }`}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            /* Authenticated: bell + avatar + dropdown */
            <>
              <NotificationBell
                open={notificationOpen}
                onOpenChange={(open) => {
                  setNotificationOpen(open);
                  if (open) {
                    setDropdownOpen(false);
                    setMobileMenuOpen(false);
                  }
                }}
              />
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen((prev) => {
                      const next = !prev;
                      if (next) {
                        setNotificationOpen(false);
                        setMobileMenuOpen(false);
                      }
                      return next;
                    });
                  }}
                  className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 cursor-pointer"
                  aria-label="Mở menu cá nhân"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name ?? 'User'}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        const span = document.createElement('span');
                        span.textContent = initial;
                        span.className = 'text-sm font-bold text-primary-foreground';
                        target.parentElement?.appendChild(span);
                      }}
                    />
                  ) : (
                    <span>{initial}</span>
                  )}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border bg-popover p-1.5 shadow-lg">
                    <div className="px-3 py-2">
                      <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="my-1 h-px bg-border" />
                    {dashboardPath && (
                      <Link
                        to={dashboardPath}
                        onClick={() => setDropdownOpen(false)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Bảng điều khiển
                      </Link>
                    )}
                    <div className="my-1 h-px bg-border" />
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                to={PATHS.LOGIN}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-opacity hover:opacity-80 ${
                  transparent ? 'text-white' : 'text-primary'
                }`}
              >
                Đăng nhập
              </Link>
              <Link
                to={PATHS.REGISTER}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  transparent
                    ? 'text-primary bg-white hover:bg-white/90'
                    : 'text-white bg-primary hover:opacity-90'
                }`}
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>

      {mobileMenuOpen && (
        <nav
          id="public-mobile-nav"
          className={`md:hidden border-t px-4 py-3 space-y-1 ${
            transparent
              ? 'border-white/20 bg-black/40 backdrop-blur-[16px]'
              : 'border-border/60 bg-background/95 backdrop-blur-[16px]'
          }`}
        >
          {NAV_ITEMS.map((item) => {
            const isActive = isNavItemActive(location.pathname, item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  transparent
                    ? isActive
                      ? 'text-white bg-white/15 font-semibold'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                    : isActive
                      ? 'text-primary bg-primary/10 font-semibold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
