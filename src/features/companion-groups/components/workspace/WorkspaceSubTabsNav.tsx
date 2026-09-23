import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BADGE_TONES } from './WorkspaceTabsNav';

export interface SubTabDef<K extends string> {
  id: K;
  label: string;
  icon: LucideIcon;

  hidden?: boolean;
}

interface WorkspaceSubTabsNavProps<K extends string> {
  tabs: SubTabDef<K>[];
  activeTab: K;
  onTabChange: (tab: K) => void;
  badges?: Partial<Record<K, { value: number; tone: 'warning' | 'danger' | 'muted' }>>;
}

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
