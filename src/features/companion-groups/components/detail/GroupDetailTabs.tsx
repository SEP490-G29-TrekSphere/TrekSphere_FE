import { Compass, Route, ShieldCheck, WalletCards } from 'lucide-react';
import { cn } from '@/lib/utils';

export type GroupDetailTabKey = 'overview' | 'itinerary' | 'budget' | 'rules';

interface GroupDetailTabsProps {
  activeTab: GroupDetailTabKey;
  onTabChange: (tab: GroupDetailTabKey) => void;
  checkpointCount?: number;
  costItemCount?: number;
}

const TABS = [
  { id: 'overview' as const, label: 'Tổng quan & Thành viên', icon: Compass },
  { id: 'itinerary' as const, label: 'Lộ trình & Điểm dừng', icon: Route },
  { id: 'budget' as const, label: 'Dự toán chi phí', icon: WalletCards },
  { id: 'rules' as const, label: 'Cam kết & An toàn', icon: ShieldCheck },
];

export function GroupDetailTabs({
  activeTab,
  onTabChange,
  checkpointCount = 0,
  costItemCount = 0,
}: GroupDetailTabsProps) {
  return (
    <div className="flex overflow-x-auto rounded-2xl border border-border bg-card p-1.5 shadow-xs scrollbar-none">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        const count =
          tab.id === 'itinerary' && checkpointCount > 0
            ? checkpointCount
            : tab.id === 'budget' && costItemCount > 0
              ? costItemCount
              : null;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition whitespace-nowrap cursor-pointer',
              isActive
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{tab.label}</span>
            {count !== null && (
              <span
                className={cn(
                  'ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-semibold',
                  isActive ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
