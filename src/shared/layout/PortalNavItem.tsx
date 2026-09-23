import type { LucideIcon } from 'lucide-react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export interface PortalNavItemProps {
  name: string;
  path: string;
  icon: LucideIcon;
  isActive: boolean;
  collapsed?: boolean;
  disabled?: boolean;
  activeClassName?: string;
  activeStyle?: CSSProperties;
  inactiveClassName?: string;
  inactiveStyle?: CSSProperties;
  rounded?: 'full' | 'lg';
}

export function PortalNavItem({
  name,
  path,
  icon: Icon,
  isActive,
  collapsed = false,
  disabled = false,
  activeClassName = '',
  activeStyle,
  inactiveClassName = '',
  inactiveStyle,
  rounded = 'full',
}: PortalNavItemProps) {
  const roundedClass = rounded === 'full' ? 'rounded-full' : 'rounded-xl';

  if (disabled) {
    return (
      <div className="relative group flex items-center justify-center">
        <span
          className={cn(
            'flex items-center text-sm font-semibold opacity-40 cursor-not-allowed select-none transition-all',
            collapsed
              ? 'h-11 w-11 justify-center rounded-full'
              : `gap-3 px-4 py-3 ${roundedClass} w-full`
          )}
          style={{ color: '#6F7B75' }}
        >
          <Icon className="h-5 w-5 shrink-0" />
          {!collapsed && <span className="truncate">{name}</span>}
          {collapsed && <span className="md:hidden truncate">{name}</span>}
        </span>

        {/* Floating Tooltip - chỉ hiển thị trên Desktop khi sidebar ở dạng thu gọn */}
        {collapsed && (
          <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 hidden md:group-hover:flex items-center z-50">
            <div className="relative rounded-lg bg-[#06261D] px-3 py-1.5 text-xs font-semibold text-white shadow-xl whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
              {name} (chưa thực hiện)
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#06261D]" />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative group flex items-center justify-center">
      <Link
        to={path}
        className={cn(
          'flex items-center text-sm font-semibold transition-all',
          collapsed
            ? 'h-11 w-11 justify-center rounded-full'
            : `gap-3 px-4 py-3 ${roundedClass} w-full`,
          isActive ? activeClassName : inactiveClassName
        )}
        style={isActive ? activeStyle : inactiveStyle}
      >
        <Icon className="h-5 w-5 shrink-0" />
        {!collapsed && <span className="truncate">{name}</span>}
        {collapsed && <span className="md:hidden truncate">{name}</span>}
      </Link>

      {/* Floating Tooltip - chỉ hiển thị trên Desktop khi sidebar ở dạng thu gọn */}
      {collapsed && (
        <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 hidden md:group-hover:flex items-center z-50">
          <div className="relative rounded-lg bg-[#06261D] px-3 py-1.5 text-xs font-semibold text-white shadow-xl whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
            {name}
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#06261D]" />
          </div>
        </div>
      )}
    </div>
  );
}
