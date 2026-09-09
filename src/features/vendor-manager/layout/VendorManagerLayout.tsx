import {
  ClipboardCheck,
  LayoutGrid,
  LogOut,
  Map as MapIcon,
  MessageSquare,
  PenSquare,
} from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { PATHS } from '@/constants';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { PortalNavItem } from '@/shared/layout/PortalNavItem';
import PortalShell from '@/shared/layout/PortalShell';
import { AppLogo } from '@/shared/ui';
import { useAppStore } from '@/store/useAppStore';

const navItems = [
  { name: 'Tổng quan', path: PATHS.VENDOR_PROFILE, icon: LayoutGrid, disabled: false },
  { name: 'Tour', path: PATHS.VENDOR_TOURS, icon: MapIcon, disabled: false },
  {
    name: 'Duyệt tour',
    path: PATHS.VENDOR_TOUR_APPROVALS,
    icon: ClipboardCheck,
    disabled: false,
  },
  { name: 'Viết Blog', path: PATHS.VENDOR_BLOG_CREATE, icon: PenSquare, disabled: false },
  { name: 'Trò chuyện', path: PATHS.VENDOR_CHAT, icon: MessageSquare, disabled: false },
];

export default function VendorManagerLayout() {
  const location = useLocation();
  const user = useAppStore((state) => state.user);
  const { logout } = useLogout({ redirectTo: PATHS.HOME });
  const isChatPage = location.pathname === PATHS.VENDOR_CHAT;

  const vendorName = user?.name || 'Nhà Cung Cấp';
  const vendorInitial = vendorName.charAt(0).toUpperCase();

  // Nhiều mục có thể cùng khớp prefix (vd "Tour" và "Duyệt tour" đều bắt đầu bằng
  // "/vendor/tours") — chỉ mục có path khớp DÀI NHẤT được coi là active.
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
            ariaLabel="TrekSphere - Nhà Cung Cấp"
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
              NHÀ CUNG CẤP
            </span>
          </Link>
        )
      }
      nav={({ collapsed }) => (
        <nav className={collapsed ? 'px-2 space-y-2' : 'px-4 space-y-1'}>
          {navItems.map((item) => {
            if (item.disabled) {
              return null;
            }

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
                title={vendorName}
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={vendorName}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span>{vendorInitial}</span>
                )}
              </div>
              <div className="pointer-events-none absolute left-full bottom-0 ml-3 hidden md:group-hover:flex flex-col gap-0.5 z-50 rounded-xl bg-white p-3 shadow-xl border border-[#E0DCD1] min-w-40 animate-in fade-in zoom-in-95 duration-150">
                <span
                  className="truncate text-sm font-bold leading-tight"
                  style={{ color: '#06261D' }}
                >
                  {vendorName}
                </span>
                <span className="text-xs text-[#6F7B75]">Nhà Cung Cấp</span>
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
                      alt={vendorName}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <span>{vendorInitial}</span>
                  )}
                </div>
                <div className="flex min-w-0 flex-col">
                  <span
                    className="truncate text-sm font-bold leading-tight"
                    style={{ color: '#06261D' }}
                  >
                    {vendorName}
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
