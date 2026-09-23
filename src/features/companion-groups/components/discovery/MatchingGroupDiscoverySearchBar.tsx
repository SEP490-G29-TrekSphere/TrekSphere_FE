import { Search } from 'lucide-react';

interface MatchingGroupDiscoverySearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function MatchingGroupDiscoverySearchBar({
  searchQuery,
  onSearchChange,
}: MatchingGroupDiscoverySearchBarProps) {
  return (
    <div className="pb-8 text-center">
      <div className="mx-auto flex max-w-[800px] items-center gap-3 rounded-full border border-border/60 bg-card p-2 shadow-xl">
        <label className="flex flex-1 items-center gap-3 rounded-full bg-muted/50 px-4 py-2.5 transition-colors hover:bg-muted">
          <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
          <span className="sr-only">Tìm nhóm đồng hành</span>
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Tìm theo tên nhóm, tour..."
            className="w-full bg-transparent text-foreground text-sm outline-none placeholder:text-muted-foreground sm:text-base"
          />
        </label>
      </div>
    </div>
  );
}
