import { Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';

export type FeedTab = 'discover' | 'following';

interface FeedHeaderProps {
  activeTab: FeedTab;
  onTabChange: (tab: FeedTab) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortBy: string;
  sortDir: 'asc' | 'desc';
  onSortChange: (sortBy: string, sortDir: 'asc' | 'desc') => void;
}

const tabs: { id: FeedTab; label: string }[] = [
  { id: 'discover', label: 'Khám phá' },
  { id: 'following', label: 'Đang theo dõi' },
];

const sortOptions = [
  { value: 'createdAt-desc', label: 'Mới nhất' },
  { value: 'createdAt-asc', label: 'Cũ nhất' },
  { value: 'viewCount-desc', label: 'Xem nhiều nhất' },
];

/**
 * Phần đầu cột feed: tabs (Khám phá / Đang theo dõi), tiêu đề lớn,
 * ô tìm kiếm dạng pill và dropdown sắp xếp.
 */
export function FeedHeader({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  sortBy,
  sortDir,
  onSortChange,
}: FeedHeaderProps) {
  const currentSortValue = `${sortBy}-${sortDir}`;
  const currentSortLabel =
    sortOptions.find((o) => o.value === currentSortValue)?.label ?? 'Mới nhất';

  const handleSortChange = (val: string | null) => {
    if (!val) return;
    const [newSortBy, newSortDir] = val.split('-');
    onSortChange(newSortBy, newSortDir as 'asc' | 'desc');
  };

  return (
    <header className="pt-6 sm:pt-8">
      {/* Tabs */}
      <nav className="flex items-center gap-6 border-b border-border" aria-label="Bộ lọc bảng tin">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`-mb-px cursor-pointer border-b-2 pb-3 text-sm font-semibold transition-colors ${
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

      {/* Tiêu đề lớn — 2 dòng như reference */}
      <h1 className="mt-8 text-4xl font-bold leading-[1.1] tracking-tight text-primary sm:text-5xl">
        Mới nhất
        <br />
        từ cộng đồng
      </h1>

      {/* Tìm kiếm + sắp xếp */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex flex-1 items-center gap-2 rounded-full bg-muted px-4 py-2.5">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm bài viết, điểm đến..."
            aria-label="Tìm kiếm bài viết"
            className="w-full bg-transparent text-sm text-primary outline-none placeholder:text-muted-foreground"
          />
        </label>

        <Select value={currentSortValue} onValueChange={handleSortChange}>
          <SelectTrigger className="h-11 w-full rounded-full bg-card px-4 text-sm font-semibold text-primary hover:border-primary/50 sm:w-[170px]">
            <span>{currentSortLabel}</span>
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </header>
  );
}
