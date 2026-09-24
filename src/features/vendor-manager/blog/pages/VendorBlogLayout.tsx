import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { PATHS } from '@/constants';
import { cn } from '@/lib/utils';

const tabs = [
  { label: 'Danh sách bài viết', path: PATHS.VENDOR_BLOG_LIST },
  { label: 'Tạo blog mới', path: PATHS.VENDOR_BLOG_CREATE },
];

export default function VendorBlogLayout() {
  const location = useLocation();
  // The create page renders its own sticky top toolbar (back/preview/save) — stacking
  // this tab bar on top of it at the same `top-0` would make both collide, so only
  // the list page (which has no competing sticky bar) keeps this one pinned.
  const isCreateRoute = location.pathname === PATHS.VENDOR_BLOG_CREATE;

  return (
    <div className="flex flex-col gap-6">
      <div
        className={cn(
          'flex gap-2 border-b border-border bg-background pt-1',
          !isCreateRoute && 'sticky top-0 z-20'
        )}
      >
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            end
            className={({ isActive }) =>
              cn(
                '-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>
      <Outlet />
    </div>
  );
}
