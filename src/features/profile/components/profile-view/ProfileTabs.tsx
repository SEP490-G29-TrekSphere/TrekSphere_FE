export type ProfileTabId =
  | 'hiking'
  | 'blogs'
  | 'photos'
  | 'reviews'
  | 'activities'
  | 'completed'
  | 'info';

export interface ProfileTabDef {
  id: ProfileTabId;
  label: string;
}

/**
 * Tab công khai theo reference AllTrails. `hiking` đứng đầu vì là phần hồ sơ
 * năng lực; `info` (thông tin cá nhân) chỉ thêm vào ở hồ sơ của chính mình.
 */
export const PROFILE_TABS: ProfileTabDef[] = [
  { id: 'hiking', label: 'Hồ sơ leo núi' },
  { id: 'blogs', label: 'Bài viết' },
  { id: 'photos', label: 'Ảnh' },
  { id: 'reviews', label: 'Đánh giá' },
  { id: 'activities', label: 'Hoạt động' },
  { id: 'completed', label: 'Đã hoàn thành' },
];

export const PROFILE_INFO_TAB: ProfileTabDef = { id: 'info', label: 'Thông tin' };

interface ProfileTabsProps {
  tabs: ProfileTabDef[];
  activeTab: ProfileTabId;
  onTabChange: (tab: ProfileTabId) => void;
}

/** Thanh tab của cột phải trang hồ sơ — cuộn ngang trên màn hình hẹp. */
export function ProfileTabs({ tabs, activeTab, onTabChange }: ProfileTabsProps) {
  return (
    // `overflow-y-hidden`: `-mb-px` của nút làm nội dung cao hơn nav đúng 1px,
    // đủ để trình duyệt vẽ một thanh cuộn dọc bên phải thanh tab.
    // `hide-scrollbar` (utility sẵn có trong global.css) giấu thanh cuộn ngang
    // trên màn hình hẹp — nó nằm đè lên đường viền dưới trông rất lộ.
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
