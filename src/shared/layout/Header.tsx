import { Bell, Key, LogOut, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { queryClient } from '@/config/queryClient';
import { PATHS } from '@/constants';
import { authService } from '@/features/auth';
import { profileKeys } from '@/features/profile/hooks/useProfile';
import { AppLogo } from '@/shared/ui';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import { storage } from '@/utils/storage';

const NAV_ITEMS = [
  { label: 'Khám phá', path: PATHS.HOME },
  { label: 'Tour của tôi', path: PATHS.MY_TOURS },
  { label: 'Bài viết', path: PATHS.COMMUNITY },
  { label: 'Tin tức', path: PATHS.NEWS },
];

export default function Header() {
  const location = useLocation();
  const user = useAppStore((state) => state.user);
  const setUser = useAppStore((state) => state.setUser);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    storage.remove('accessToken');
    storage.remove('refreshToken');
    setUser(null);
    queryClient.removeQueries({ queryKey: profileKeys.all });
    toast.success('Đã đăng xuất.');
    navigate(PATHS.HOME);
  };

  const avatarUrl = user?.avatarUrl;
  const initial = user?.name?.charAt(0).toUpperCase() ?? 'A';
  const showAvatar = Boolean(avatarUrl);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background border-border px-4 shadow-sm md:px-6">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between">
        <AppLogo height={40} to={PATHS.HOME} />

        <nav className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.path === PATHS.HOME
                ? location.pathname === PATHS.HOME
                : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative text-sm font-medium transition-colors hover:text-primary ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            to={PATHS.NOTIFICATIONS}
            className="relative flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Bell className="size-5" />
            <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-primary ring-2 ring-background">
              4
            </span>
          </Link>

          {/* User avatar + dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
              aria-label="Mở menu cá nhân"
            >
              {showAvatar ? (
                <img
                  src={avatarUrl}
                  alt={user?.name ?? 'User'}
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
              <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border bg-popover p-1 shadow-lg">
                <div className="px-3 py-2">
                  <p className="truncate text-sm font-semibold">{user?.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <div className="my-1 h-px bg-border" />
                <Link
                  to={PATHS.PROFILE}
                  onClick={() => setDropdownOpen(false)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <User className="h-4 w-4" />
                  Hồ sơ
                </Link>
                <Link
                  to={PATHS.CHANGE_PASSWORD}
                  onClick={() => setDropdownOpen(false)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Key className="h-4 w-4" />
                  Đổi mật khẩu
                </Link>
                <div className="my-1 h-px bg-border" />
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
