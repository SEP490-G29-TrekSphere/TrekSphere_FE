import {
  Camera,
  FileText,
  Layers,
  type LucideIcon,
  MessageSquare,
  Radio,
  Settings,
  Star,
  UserCheck,
  Users,
  Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AppScrollableTabs } from '@/shared/ui';

export type WorkspaceTabKey =
  | 'overview'
  | 'feed'
  | 'itinerary'
  | 'moments'
  | 'members'
  | 'reviews'
  | 'requests'
  | 'budget'
  | 'rules'
  | 'management';

interface WorkspaceTabDef {
  id: WorkspaceTabKey;
  label: string;
  icon: LucideIcon;
  leaderOnly?: boolean;
}

export const WORKSPACE_TABS: WorkspaceTabDef[] = [
  { id: 'overview', label: 'Tổng quan', icon: Radio },
  { id: 'feed', label: 'Bảng tin & Thảo luận', icon: MessageSquare },
  { id: 'itinerary', label: 'Lộ trình', icon: Layers },
  { id: 'moments', label: 'Khoảnh khắc & Album', icon: Camera },
  { id: 'members', label: 'Thành viên', icon: Users },
  { id: 'reviews', label: 'Đánh giá', icon: Star },
  { id: 'requests', label: 'Duyệt yêu cầu', icon: UserCheck, leaderOnly: true },
  { id: 'budget', label: 'Dự toán & Chi phí', icon: Wallet },
  { id: 'rules', label: 'Quy định nhóm', icon: FileText },
  { id: 'management', label: 'Quản lý nhóm', icon: Settings, leaderOnly: true },
];

interface WorkspaceTabsNavProps {
  activeTab: WorkspaceTabKey;
  onTabChange: (tab: WorkspaceTabKey) => void;
  isLeader: boolean;
  /** Huy hiệu số hiển thị bên phải nhãn tab. */
  badges?: Partial<
    Record<WorkspaceTabKey, { value: number; tone: 'warning' | 'danger' | 'muted' }>
  >;
}

const BADGE_TONES = {
  warning: 'bg-amber-500 text-white',
  danger: 'bg-destructive text-destructive-foreground',
  muted: 'bg-muted text-muted-foreground',
};

/** Thanh tab của workspace nhóm ghép. */
export function WorkspaceTabsNav({
  activeTab,
  onTabChange,
  isLeader,
  badges = {},
}: WorkspaceTabsNavProps) {
  return (
    <AppScrollableTabs>
      {WORKSPACE_TABS.map((tab) => {
        if (tab.leaderOnly && !isLeader) return null;
        const Icon = tab.icon;
        const badge = badges[tab.id];

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            aria-current={activeTab === tab.id ? 'page' : undefined}
            className={cn(
              'flex shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 font-bold text-xs transition',
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
            {badge && badge.value > 0 && (
              <span
                className={cn(
                  'flex h-4 min-w-4 items-center justify-center rounded-full px-1 font-black text-[10px]',
                  BADGE_TONES[badge.tone]
                )}
              >
                {badge.value}
              </span>
            )}
          </button>
        );
      })}
    </AppScrollableTabs>
  );
}
