import { Camera } from 'lucide-react';
import type { ReactNode } from 'react';
import type { MomentViewMode } from '../types';
import { MomentViewSwitcher } from './MomentViewSwitcher';

interface MomentsPanelHeaderProps {
  title: string;
  description: string;
  viewMode: MomentViewMode;
  onViewModeChange: (mode: MomentViewMode) => void;
  albumCount?: number;
  /** Nút đăng khoảnh khắc — chỉ truyền khi người dùng có quyền đăng. */
  action?: ReactNode;
}

/** Tiêu đề + bộ chuyển kiểu hiển thị dùng chung cho khoảnh khắc nhóm và hồ sơ cá nhân. */
export function MomentsPanelHeader({
  title,
  description,
  viewMode,
  onViewModeChange,
  albumCount,
  action,
}: MomentsPanelHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-border border-b pb-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <h3 className="flex items-center gap-2 font-extrabold text-base text-foreground">
          <Camera className="h-5 w-5 shrink-0 text-primary" />
          {title}
        </h3>
        <p className="mt-0.5 text-muted-foreground text-xs">{description}</p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center lg:shrink-0">
        <MomentViewSwitcher value={viewMode} onChange={onViewModeChange} albumCount={albumCount} />
        {action}
      </div>
    </div>
  );
}
