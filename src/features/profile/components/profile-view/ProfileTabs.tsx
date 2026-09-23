export type ProfileTabId = 'info' | 'hiking' | 'blogs' | 'moments' | 'reviews' | 'completed';

export interface ProfileTabDef {
  id: ProfileTabId;
  label: string;
}

export const MY_PROFILE_TABS: ProfileTabDef[] = [
  { id: 'info', label: 'Thông tin' },
  { id: 'blogs', label: 'Bài viết' },
  { id: 'moments', label: 'Khoảnh khắc' },
  { id: 'reviews', label: 'Đánh giá' },
  { id: 'completed', label: 'Đã hoàn thành' },
];

export const PUBLIC_PROFILE_TABS: ProfileTabDef[] = [
  { id: 'blogs', label: 'Bài viết' },
  { id: 'moments', label: 'Khoảnh khắc' },
  { id: 'reviews', label: 'Đánh giá' },
  { id: 'completed', label: 'Đã hoàn thành' },
];

interface ProfileTabsProps {
  tabs: ProfileTabDef[];
  activeTab: ProfileTabId;
  onTabChange: (tab: ProfileTabId) => void;
}

export function ProfileTabs({ tabs, activeTab, onTabChange }: ProfileTabsProps) {
  return (
    <nav
      aria-label="Nội dung hồ sơ"
      className="hide-scrollbar flex gap-6 overflow-x-auto overflow-y-hidden border-b border-border"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            aria-current={isActive ? 'page' : undefined}
            className={`-mb-px shrink-0 cursor-pointer border-b-2 pb-3 text-sm font-semibold transition-colors ${
              isActive
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-primary'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
