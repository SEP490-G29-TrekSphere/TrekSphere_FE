import {
  ClipboardList,
  FileText,
  Key,
  LogOut,
  MessageSquare,
  User,
  UserPlus,
  Users,
} from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { PATHS } from '@/constants';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { PortalNavItem } from '@/shared/layout/PortalNavItem';
import PortalShell from '@/shared/layout/PortalShell';
import { AppLogo } from '@/shared/ui';
import { useAppStore } from '@/store/useAppStore';

const navItems = [
  { name: 'Hồ sơ', path: PATHS.TREKKER_PROFILE, icon: User, disabled: false },
  { name: 'Quản lý nhóm của tôi', path: PATHS.TREKKER_MY_GROUPS, icon: Users, disabled: false },
  {
    name: 'Yêu cầu gia nhập nhóm',
    path: PATHS.TREKKER_MY_JOIN_REQUESTS,
    icon: UserPlus,
    disabled: false,
  },
  {
    name: 'Lịch sử đăng ký Vendor',
    path: PATHS.TREKKER_VENDOR_APPLICATIONS,
    icon: ClipboardList,
    disabled: false,
  },
  {
    name: 'Bài viết của tôi',
    path: PATHS.TREKKER_BLOG_LIST,
    icon: FileText,
    disabled: false,
  },
  {
    name: 'Trò chuyện',
    path: PATHS.TREKKER_CHAT,
    icon: MessageSquare,
    disabled: false,
  },
  {
    name: 'Đổi mật khẩu',
    path: PATHS.TREKKER_CHANGE_PASSWORD,
    icon: Key,
    disabled: false,
  },
];

export default function TrekkerLayout() {
  const location = useLocation();
  const user = useAppStore((state) => state.user);
  const { logout } = useLogout({ redirectTo: PATHS.HOME });
  const isChatPage = location.pathname === PATHS.TREKKER_CHAT;

  const userName = user?.name || 'Trekker';
  const userInitial = userName.charAt(0).toUpperCase();

  // Active item: longest matching path wins
  const activeItem = navItems
    .filter((item) => !item.disabled && location.pathname.startsWith(item.path))
    .sort((a, b) => b.path.length - a.path.length)[0];

  return (
    <PortalShell
      rootStyle={{ backgroundColor: '#FAF8F1' }}
      sidebarStyle={{ backgroundColor: '#EFECE6', borderRight: '1px solid #E0DCD1' }}
      mobileTitle="TrekSphere"
      fullBleed={isChatPage}
      brand={({ collapsed }) =>
        collapsed ? (
          <AppLogo
            variant="mark"
            tone="dark"
            height={36}
            to={PATHS.HOME}
            ariaLabel="TrekSphere - Khách Du Lịch"
            wrapperClassName="hover:opacity-85 transition-opacity flex items-center justify-center p-1"
          />
        ) : (
          <Link to={PATHS.HOME} className="hover:opacity-85 transition-opacity block">
            <h1
              className="text-3xl font-extrabold tracking-tight leading-none mb-1"
              style={{ color: '#06261D' }}
            >
              TrekSphere
            </h1>
            <span className="text-xs font-medium tracking-wide" style={{ color: '#6F7B75' }}>
              Khách Du Lịch
            </span>
          </Link>
        )
      }
      nav={({ collapsed }) => (
        <nav className={collapsed ? 'px-2 space-y-2' : 'px-4 space-y-1'}>
          {navItems.map((item) => {
            const isActive = item === activeItem;
            return (
              <PortalNavItem
                key={item.name}
                name={item.name}
                path={item.path}
                icon={item.icon}
                isActive={isActive}
                collapsed={collapsed}
                disabled={item.disabled}
                rounded="full"
                activeStyle={{ backgroundColor: 'rgba(162, 235, 210, 0.35)', color: '#06261D' }}
                inactiveStyle={{ color: '#6F7B75' }}
              />
            );
          })}
        </nav>
      )}
      userCard={({ collapsed }) =>
        collapsed ? (
          <div
            className="p-3 flex flex-col items-center gap-2"
            style={{ borderTop: '1px solid #E0DCD1' }}
          >
            <div className="relative group">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-bold shadow-sm cursor-pointer"
                style={{ backgroundColor: '#06261D', color: '#FFFFFF' }}
                title={userName}
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={userName}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span>{userInitial}</span>
                )}
              </div>
              {/* Floating Tooltip info on hover when collapsed */}
              <div className="pointer-events-none absolute left-full bottom-0 ml-3 hidden md:group-hover:flex flex-col gap-0.5 z-50 rounded-xl bg-white p-3 shadow-xl border border-[#E0DCD1] min-w-36 animate-in fade-in zoom-in-95 duration-150">
                <span
                  className="truncate text-sm font-bold leading-tight"
                  style={{ color: '#06261D' }}
                >
                  {userName}
                </span>
                <span className="text-xs text-[#6F7B75]">Khách Du Lịch</span>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="text-red-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
              title="Đăng xuất"
              aria-label="Đăng xuất"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="p-4" style={{ borderTop: '1px solid #E0DCD1' }}>
            <div className="flex items-center justify-between p-2 rounded-xl">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-bold shadow-sm"
                  style={{ backgroundColor: '#06261D', color: '#FFFFFF' }}
                >
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={userName}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <span>{userInitial}</span>
                  )}
                </div>
                <div className="flex min-w-0 flex-col">
                  <span
                    className="truncate text-sm font-bold leading-tight"
                    style={{ color: '#06261D' }}
                  >
                    {userName}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                className="text-red-500 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                title="Đăng xuất"
                aria-label="Đăng xuất"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        )
      }
    >
      <Outlet />
    </PortalShell>
  );
}
