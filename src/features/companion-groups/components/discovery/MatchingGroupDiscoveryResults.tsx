import { LayoutGrid, List, RotateCcw, SearchX } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { TourPagination } from '@/features/tours';
import { cn } from '@/lib/utils';
import { AppButton } from '@/shared/ui';
import {
  MATCHING_GROUP_SORT_OPTIONS,
  type MatchingGroupLayout,
  type MatchingGroupStatusFilter,
} from '../../constants';
import type { MatchingGroupItem } from '../../types/matchingGroup';
import { CompanionGroupCard, type GroupCardData } from '../CompanionGroupCard';

const MATCHING_GROUP_SKELETON_IDS = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth'];

interface MatchingGroupDiscoveryResultsProps {
  groups: MatchingGroupItem[];
  matchingGroupCount: number;
  totalElements: number;
  pageNumber: number;
  totalPages: number;
  layout: MatchingGroupLayout;
  sortKey: string;
  statusFilter: MatchingGroupStatusFilter;
  isLoading: boolean;
  isError: boolean;
  isGuest: boolean;
  joinedGroupIds: Set<string>;
  onLayoutChange: (layout: MatchingGroupLayout) => void;
  onSortChange: (sort: string) => void;
  onPageChange: (page: number) => void;
  onRetry: () => void;
  onReset: () => void;
  onLogin: () => void;
  onJoinGroup: (group: GroupCardData) => void;
  onViewDetail: (group: GroupCardData) => void;
}

export function MatchingGroupDiscoveryResults({
  groups,
  matchingGroupCount,
  totalElements,
  pageNumber,
  totalPages,
  layout,
  sortKey,
  statusFilter,
  isLoading,
  isError,
  isGuest,
  joinedGroupIds,
  onLayoutChange,
  onSortChange,
  onPageChange,
  onRetry,
  onReset,
  onLogin,
  onJoinGroup,
  onViewDetail,
}: MatchingGroupDiscoveryResultsProps) {
  const currentSortLabel =
    MATCHING_GROUP_SORT_OPTIONS.find((option) => option.value === sortKey)?.label ??
    MATCHING_GROUP_SORT_OPTIONS[0].label;
  const isStatusFiltered = statusFilter !== 'ALL';

  return (
    <main className="lg:col-span-9">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-border border-b pb-4">
        <div>
          <h2 className="font-bold text-2xl text-primary">Nhóm ghép</h2>
          <span className="text-muted-foreground text-xs">
            {isStatusFiltered
              ? `Hiển thị ${groups.length}/${matchingGroupCount} nhóm ở trang này`
              : `Hiển thị ${totalElements} nhóm`}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="hidden text-muted-foreground text-xs sm:inline">Sắp xếp:</span>
            <Select value={sortKey} onValueChange={(value) => value && onSortChange(value)}>
              <SelectTrigger className="h-10 rounded-full bg-white px-4 font-semibold text-primary text-sm hover:border-primary/50">
                <span>{currentSortLabel}</span>
              </SelectTrigger>
              <SelectContent>
                {MATCHING_GROUP_SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1 rounded-full border border-input bg-white p-1">
            {(['list', 'grid'] as const).map((option) => {
              const Icon = option === 'list' ? List : LayoutGrid;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => onLayoutChange(option)}
                  aria-pressed={layout === option}
                  aria-label={option === 'list' ? 'Hiển thị danh sách' : 'Hiển thị lưới'}
                  className={cn(
                    'rounded-full p-1.5 transition-colors',
                    layout === option
                      ? 'bg-primary font-semibold text-white'
                      : 'text-muted-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="h-4 w-4" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {isLoading ? (
        <MatchingGroupResultsSkeleton layout={layout} />
      ) : isError ? (
        <MatchingGroupResultsError onRetry={onRetry} />
      ) : groups.length === 0 ? (
        <MatchingGroupResultsEmpty isGuest={isGuest} onLogin={onLogin} onReset={onReset} />
      ) : (
        <div
          className={
            layout === 'grid' ? 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3' : 'flex flex-col gap-5'
          }
        >
          {groups.map((group) => (
            <CompanionGroupCard
              key={group.matchingGroupId}
              group={group}
              layout={layout}
              onJoinGroup={onJoinGroup}
              onViewDetail={onViewDetail}
              hasJoined={joinedGroupIds.has(group.matchingGroupId)}
            />
          ))}
        </div>
      )}

      <div className="mt-8">
        <TourPagination
          pageNumber={pageNumber}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </main>
  );
}

function MatchingGroupResultsSkeleton({ layout }: { layout: MatchingGroupLayout }) {
  const skeletonIds = MATCHING_GROUP_SKELETON_IDS.slice(0, layout === 'grid' ? 6 : 4);
  return (
    <div className={layout === 'grid' ? 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-5'}>
      {skeletonIds.map((id) => (
        <div
          key={`matching-group-skeleton-${id}`}
          className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-border"
        >
          <div className="mb-3 h-5 w-3/4 animate-pulse rounded bg-muted" />
          <div className="mb-2 h-3 w-1/2 animate-pulse rounded bg-muted" />
          <div className="h-8 w-28 animate-pulse rounded-full bg-muted" />
        </div>
      ))}
    </div>
  );
}

function MatchingGroupResultsError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <RotateCcw className="mb-4 h-9 w-9 text-destructive" />
      <h3 className="mb-2 font-semibold text-lg text-primary">Không thể tải danh sách nhóm</h3>
      <p className="mb-6 max-w-sm text-muted-foreground text-sm">
        Đã xảy ra lỗi kết nối. Vui lòng thử lại.
      </p>
      <AppButton onClick={onRetry}>Thử lại</AppButton>
    </div>
  );
}

interface MatchingGroupResultsEmptyProps {
  isGuest: boolean;
  onLogin: () => void;
  onReset: () => void;
}

function MatchingGroupResultsEmpty({ isGuest, onLogin, onReset }: MatchingGroupResultsEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <SearchX className="mb-4 h-10 w-10 text-muted-foreground" />
      <h3 className="mb-2 font-semibold text-lg text-primary">Không tìm thấy nhóm phù hợp</h3>
      <p className="mb-6 max-w-sm text-muted-foreground text-sm">
        Thử thay đổi bộ lọc để xem thêm nhóm đồng hành.
      </p>
      <div className="flex gap-3">
        <AppButton variant="outline" onClick={onReset}>
          Làm mới bộ lọc
        </AppButton>
        {isGuest && <AppButton onClick={onLogin}>Đăng nhập</AppButton>}
      </div>
    </div>
  );
}
