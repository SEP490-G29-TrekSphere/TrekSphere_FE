import { Menu, X } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface RoleDashboardShellProps {
  /**
   * Nội dung sidebar (logo + nav + thẻ user). Được render 2 lần: cột trái cố
   * định từ `md` trở lên, và trong drawer trượt ra ở mobile — nên phải là JSX
   * "thuần" không giữ state cục bộ.
   */
  sidebar: ReactNode;
  /** Tên hiển thị trên thanh top bar mobile (chỗ desktop dùng logo sidebar). */
  mobileTitle: ReactNode;
  /** Khung ngoài — mỗi role một tông nền riêng. */
  className?: string;
  style?: CSSProperties;
  /** Áp cho cả `<aside>` desktop lẫn panel drawer để 2 bên đồng bộ màu. */
  sidebarClassName?: string;
  sidebarStyle?: CSSProperties;
  /** Trang tự quản lý scroll (vd Chat) → bỏ padding + scroll của `<main>`. */
  contentBleed?: boolean;
  children: ReactNode;
}

/**
 * Khung layout dùng chung cho 3 dashboard theo role (Admin, Vendor Manager,
 * Vendor Staff).
 *
 * Trước đây cả 3 layout chỉ có `<aside className="hidden md:flex">` mà không có
 * phương án thay thế, nên dưới 768px người dùng mất sạch điều hướng — không có
 * cách nào chuyển trang ngoài việc gõ URL. Shell này bổ sung top bar + drawer
 * cho mobile, dùng lại đúng JSX sidebar sẵn có nên không phải viết nav 2 lần.
 */
export default function RoleDashboardShell({
  sidebar,
  mobileTitle,
  className = '',
  style,
  sidebarClassName = '',
  sidebarStyle,
  contentBleed = false,
  children,
}: RoleDashboardShellProps) {
  const { pathname } = useLocation();

  // Thay vì `useEffect` đồng bộ lại state mỗi lần đổi route, lưu luôn pathname
  // tại thời điểm mở drawer: user bấm 1 mục nav → pathname đổi → biểu thức dưới
  // thành false → drawer tự đóng, không cần thêm một lượt render phụ.
  const [openedAtPathname, setOpenedAtPathname] = useState<string | null>(null);
  const isNavOpen = openedAtPathname === pathname;
  const closeNav = () => setOpenedAtPathname(null);

  useEffect(() => {
    if (!isNavOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenedAtPathname(null);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isNavOpen]);

  return (
    <div className={cn('flex h-screen w-full overflow-hidden', className)} style={style}>
      {/* Sidebar cố định — từ md trở lên */}
      <aside
        className={cn('hidden w-72 shrink-0 flex-col justify-between md:flex', sidebarClassName)}
        style={sidebarStyle}
      >
        {sidebar}
      </aside>

      {/* Drawer mobile */}
      {isNavOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <button
            type="button"
            aria-label="Đóng menu"
            onClick={closeNav}
            className="absolute inset-0 h-full w-full bg-black/40"
          />
          <div
            id="role-dashboard-nav"
            role="dialog"
            aria-modal="true"
            aria-label="Menu điều hướng"
            className={cn(
              'relative flex h-full w-72 max-w-[85vw] flex-col justify-between overflow-y-auto shadow-xl',
              sidebarClassName
            )}
            style={sidebarStyle}
          >
            <button
              type="button"
              onClick={closeNav}
              aria-label="Đóng menu"
              className="absolute right-3 top-3 z-10 rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-black/5"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebar}
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top bar mobile — thay cho sidebar bị ẩn dưới md */}
        <header
          className={cn(
            'flex shrink-0 items-center gap-3 border-b border-black/5 px-4 py-3 md:hidden',
            sidebarClassName
          )}
          style={sidebarStyle}
        >
          <button
            type="button"
            onClick={() => setOpenedAtPathname(pathname)}
            aria-label="Mở menu điều hướng"
            aria-controls="role-dashboard-nav"
            aria-expanded={isNavOpen}
            className="rounded-lg p-1.5 transition-colors hover:bg-black/5"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="min-w-0 flex-1 truncate font-extrabold tracking-tight">{mobileTitle}</div>
        </header>

        <main
          className={cn(
            'min-w-0 flex-1',
            contentBleed ? 'overflow-hidden p-0' : 'overflow-y-auto p-4 sm:p-6 md:p-8'
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
