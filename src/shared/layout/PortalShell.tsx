import { Menu, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import {
  type CSSProperties,
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useLocation } from 'react-router-dom';

export interface PortalSidebarContextValue {
  collapsed: boolean;
  toggleCollapsed: () => void;
  setCollapsed: (val: boolean) => void;
}

export const PortalSidebarContext = createContext<PortalSidebarContextValue>({
  collapsed: false,
  toggleCollapsed: () => {},
  setCollapsed: () => {},
});

export function usePortalSidebar() {
  return useContext(PortalSidebarContext);
}

export type PortalShellRenderProp<T = void> = ReactNode | ((props: T) => ReactNode);

interface PortalShellProps {
  /** Khối logo + phụ đề ở đầu sidebar — dùng chung cho desktop và drawer mobile. */
  brand: PortalShellRenderProp<{ collapsed: boolean; toggleCollapsed: () => void }>;
  /** Danh sách điều hướng. */
  nav: PortalShellRenderProp<{ collapsed: boolean }>;
  /** Thẻ người dùng ở đáy sidebar. */
  userCard: PortalShellRenderProp<{ collapsed: boolean }>;
  /** Nhãn ngắn hiển thị trên topbar mobile (thường là tên portal). */
  mobileTitle: ReactNode;
  children: ReactNode;
  rootClassName?: string;
  rootStyle?: CSSProperties;
  sidebarClassName?: string;
  sidebarStyle?: CSSProperties;
  /** Trang tự quản lý scroll/padding riêng (vd trang chat) — bỏ padding mặc định. */
  fullBleed?: boolean;
  /** Nội dung hiển thị bên phải thanh topbar desktop (vd NotificationBell). Không có thì không render thanh này — topbar mobile (md:hidden ở trên) không bị ảnh hưởng. */
  headerRight?: ReactNode;
}

/**
 * Khung dùng chung cho mọi portal có sidebar (Admin, Trekker, Vendor*, Coordinator).
 *
 * Trên `md` trở lên sidebar hỗ trợ 2 chế độ: mở rộng (w-72) và thu gọn (w-20),
 * có nút toggle lưu trạng thái vào localStorage. Dưới `md` nó trở thành drawer
 * trượt từ trái, mở bằng nút trên topbar mobile.
 */
export default function PortalShell({
  brand,
  nav,
  userCard,
  mobileTitle,
  children,
  rootClassName = '',
  rootStyle,
  sidebarClassName = '',
  sidebarStyle,
  fullBleed = false,
  headerRight,
}: PortalShellProps) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsedState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('portal_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const setCollapsed = (val: boolean) => {
    setCollapsedState(val);
    try {
      localStorage.setItem('portal_sidebar_collapsed', String(val));
    } catch {
      // ignore
    }
  };

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const location = useLocation();

  // Điều hướng xong thì đóng drawer, nếu không nó che mất trang vừa mở.
  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname chỉ dùng để trigger effect, không đọc giá trị trong body
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    // Khoá scroll nền khi drawer mở để tránh cuộn xuyên qua lớp phủ.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const renderBrand = () => {
    if (typeof brand === 'function') {
      return brand({ collapsed, toggleCollapsed });
    }
    return brand;
  };

  const renderNav = () => {
    if (typeof nav === 'function') {
      return nav({ collapsed });
    }
    return nav;
  };

  const renderUserCard = () => {
    if (typeof userCard === 'function') {
      return userCard({ collapsed });
    }
    return userCard;
  };

  return (
    <PortalSidebarContext.Provider value={{ collapsed, toggleCollapsed, setCollapsed }}>
      <div className={`flex h-dvh w-full overflow-hidden ${rootClassName}`} style={rootStyle}>
        {/* Lớp phủ chỉ tồn tại ở mobile khi drawer mở */}
        {open && (
          <button
            type="button"
            aria-label="Đóng menu điều hướng"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-50 flex max-w-[85vw] flex-col justify-between transition-[width,transform] duration-300 ease-in-out md:relative md:z-30 md:max-w-none md:translate-x-0 ${
            open ? 'translate-x-0' : '-translate-x-full'
          } ${
            collapsed
              ? 'w-72 md:w-20 overflow-y-auto md:overflow-visible'
              : 'w-72 md:w-72 overflow-y-auto'
          } ${sidebarClassName}`}
          style={sidebarStyle}
        >
          <div className="flex flex-col py-6">
            <div
              className={`mb-8 flex items-start justify-between gap-2 transition-all ${
                collapsed ? 'px-6 md:px-3 md:flex-col md:items-center' : 'px-6'
              }`}
            >
              <div className={collapsed ? 'w-full md:flex md:justify-center' : 'min-w-0 flex-1'}>
                {renderBrand()}
              </div>

              <div className="flex items-center gap-1">
                {/* Desktop toggle button */}
                <button
                  type="button"
                  onClick={toggleCollapsed}
                  className="hidden rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-black/5 hover:text-zinc-800 md:flex cursor-pointer"
                  aria-label={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
                  title={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
                >
                  {collapsed ? (
                    <PanelLeftOpen className="h-5 w-5" />
                  ) : (
                    <PanelLeftClose className="h-5 w-5" />
                  )}
                </button>

                {/* Mobile close button */}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="-mr-2 rounded-lg p-2 text-zinc-500 transition-colors hover:bg-black/5 hover:text-zinc-800 md:hidden"
                  aria-label="Đóng menu điều hướng"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            {renderNav()}
          </div>
          {renderUserCard()}
        </aside>

        {/* `min-w-0` chặn nội dung rộng (bảng, ảnh) kéo giãn cột flex vượt màn hình */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <header
            className="flex h-14 shrink-0 items-center gap-3 border-b border-black/10 bg-white/80 px-4 backdrop-blur md:hidden"
            style={sidebarStyle}
          >
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="-ml-2 rounded-lg p-2 text-zinc-600 transition-colors hover:bg-black/5 hover:text-zinc-900"
              aria-label="Mở menu điều hướng"
              aria-expanded={open}
            >
              <Menu className="h-6 w-6" />
            </button>
            <span className="truncate text-base font-bold text-[#06261D]">{mobileTitle}</span>
          </header>

          {headerRight && (
            <header className="hidden h-14 shrink-0 items-center justify-end gap-3 border-b border-black/10 bg-white/80 px-6 backdrop-blur md:flex">
              {headerRight}
            </header>
          )}

          <main
            className={`flex-1 ${fullBleed ? 'overflow-hidden p-0' : 'overflow-y-auto p-4 sm:p-6 md:p-8'}`}
          >
            {children}
          </main>
        </div>
      </div>
    </PortalSidebarContext.Provider>
  );
}
