import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MATCHING_GROUP_ROLE_TABS, type MatchingGroupRoleFilter } from '../../constants';

interface MyMatchingGroupsHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeRole: MatchingGroupRoleFilter;
  onRoleChange: (role: MatchingGroupRoleFilter) => void;
  onCreateClick: () => void;
}

export function MyMatchingGroupsHeader({
  searchQuery,
  onSearchChange,
  activeRole,
  onRoleChange,
  onCreateClick,
}: MyMatchingGroupsHeaderProps) {
  return (
    <div className="pb-4">
      <h1 className="font-black text-3xl text-foreground tracking-tight">Nhóm Của Tôi</h1>
      <p className="mt-2 text-muted-foreground text-sm">
        Quản lý các nhóm ghép bạn đã tạo hoặc đã tham gia để cùng đồng hành.
      </p>

      {/* Search bar & Create group button */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex w-full sm:max-w-md items-center gap-2 rounded-full border border-border bg-card p-2 shadow-xs">
          <div className="flex flex-1 items-center gap-2 px-3">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm theo tên nhóm, tour..."
              className="w-full bg-transparent text-foreground text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={onCreateClick}
          className="flex cursor-pointer shrink-0 items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 font-bold text-white text-xs shadow-sm transition-all hover:bg-primary/90"
        >
          + Tạo nhóm mới
        </button>
      </div>

      {/* Role Tabs */}
      <div className="mt-6 flex gap-6 border-border border-b">
        {MATCHING_GROUP_ROLE_TABS.map((tab) => {
          const isActive = activeRole === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onRoleChange(tab.key)}
              className={cn(
                'relative border-b-2 px-1 pb-3 font-semibold text-sm transition-all',
                isActive
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
