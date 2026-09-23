import { Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { FEED_SORT_OPTIONS } from '../../constants';

interface FeedHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortBy: string;
  sortDir: 'asc' | 'desc';
  onSortChange: (sortBy: string, sortDir: 'asc' | 'desc') => void;
  topics?: string[];
  onTopicSelect?: (topic: string) => void;
}

export function FeedHeader({
  searchQuery,
  onSearchChange,
  sortBy,
  sortDir,
  onSortChange,
  topics = [],
  onTopicSelect,
}: FeedHeaderProps) {
  const currentSortValue = `${sortBy}-${sortDir}`;
  const currentSortLabel =
    FEED_SORT_OPTIONS.find((o) => o.value === currentSortValue)?.label ?? 'Mới nhất';

  const handleSortChange = (val: string | null) => {
    if (!val) return;
    const [newSortBy, newSortDir] = val.split('-');
    onSortChange(newSortBy, newSortDir as 'asc' | 'desc');
  };

  return (
    <header className="pt-6 sm:pt-8">
      <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-primary sm:text-5xl">
        Mới nhất
        <br />
        từ cộng đồng
      </h1>

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
            {FEED_SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {topics.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground mr-1">Chủ đề:</span>
          {topics.map((topic) => {
            const isSelected = searchQuery.toLowerCase() === topic.toLowerCase();
            return (
              <button
                key={topic}
                type="button"
                onClick={() => onTopicSelect?.(isSelected ? '' : topic)}
                className={`cursor-pointer rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-muted text-primary hover:bg-accent'
                }`}
              >
                #{topic}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
