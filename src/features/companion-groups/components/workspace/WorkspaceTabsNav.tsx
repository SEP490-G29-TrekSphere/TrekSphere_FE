import {
  Camera,
  Layers,
  type LucideIcon,
  MessageSquare,
  Package,
  Radio,
  Settings,
  Siren,
  Users,
  Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type WorkspaceTabKey =
  | 'overview'
  | 'feed'
  | 'itinerary'
  | 'checklist'
  | 'moments'
  | 'members'
  | 'budget'
  | 'sosVotes'
  | 'management';

interface WorkspaceTabDef {
  id: WorkspaceTabKey;
  label: string;
  icon: LucideIcon;
  leaderOnly?: boolean;
}

export const WORKSPACE_TABS: WorkspaceTabDef[] = [
  { id: 'overview', label: 'Tổng quan', icon: Radio },
  { id: 'feed', label: 'Bảng tin', icon: MessageSquare },
  { id: 'itinerary', label: 'Lộ trình', icon: Layers },
  { id: 'checklist', label: 'Đồ dùng', icon: Package },
  { id: 'moments', label: 'Khoảnh khắc & Album', icon: Camera },
  { id: 'members', label: 'Thành viên', icon: Users },
  { id: 'budget', label: 'Dự toán & Chi phí', icon: Wallet },
  { id: 'sosVotes', label: 'SOS & Biểu quyết', icon: Siren },
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

export const BADGE_TONES = {
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
    <div className="flex flex-wrap gap-1.5 rounded-2xl border border-border bg-card p-1.5 shadow-xs">
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
    </div>
  );
}
