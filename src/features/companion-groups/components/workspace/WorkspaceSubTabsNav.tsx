import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BADGE_TONES } from './WorkspaceTabsNav';

export interface SubTabDef<K extends string> {
  id: K;
  label: string;
  icon: LucideIcon;
  /** Ẩn hẳn mục này khỏi sub-nav, VD: "Duyệt yêu cầu" chỉ Leader mới thấy. */
  hidden?: boolean;
}

interface WorkspaceSubTabsNavProps<K extends string> {
  tabs: SubTabDef<K>[];
  activeTab: K;
  onTabChange: (tab: K) => void;
  badges?: Partial<Record<K, { value: number; tone: 'warning' | 'danger' | 'muted' }>>;
}

/**
 * Sub-nav bên trong 1 tab cấp 1 đã gộp (VD "Thành viên", "SOS & Biểu quyết") — chỉ 2-3 mục nên
 * không cần cuộn như `WorkspaceTabsNav`, pill nhỏ hơn 1 bậc để phân biệt rõ cha/con.
 */
export function WorkspaceSubTabsNav<K extends string>({
  tabs,
  activeTab,
  onTabChange,
  badges = {},
}: WorkspaceSubTabsNavProps<K>) {
  return (
    <div className="flex flex-wrap gap-1.5 rounded-xl border border-border bg-muted/30 p-1">
      {tabs
        .filter((tab) => !tab.hidden)
        .map((tab) => {
          const Icon = tab.icon;
          const badge = badges[tab.id];

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              aria-current={activeTab === tab.id ? 'page' : undefined}
              className={cn(
                'flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 font-bold text-[11px] transition',
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
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
