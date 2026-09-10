import { LayoutGrid, List, RotateCcw, Users } from 'lucide-react';
import { TourPagination } from '@/features/tours';
import { cn } from '@/lib/utils';
import { AppButton } from '@/shared/ui';
import type { MatchingGroupLayout, MatchingGroupRoleFilter } from '../../constants';
import type { MatchingGroupItem } from '../../types/matchingGroup';
import { CompanionGroupCard, type GroupCardData } from '../CompanionGroupCard';

interface MyMatchingGroupsResultsProps {
  groups: MatchingGroupItem[];
  activeRole: MatchingGroupRoleFilter;
  layout: MatchingGroupLayout;
  isLoading: boolean;
  isError: boolean;
  pageNumber: number;
  totalPages: number;
  onLayoutChange: (layout: MatchingGroupLayout) => void;
  onReset: () => void;
  onPageChange: (page: number) => void;
  onJoinGroup: (group: GroupCardData) => void;
  onViewDetail: (group: GroupCardData) => void;
  getDetailPath: (groupId: string) => string;
}

export function MyMatchingGroupsResults({
  groups,
  activeRole,
  layout,
  isLoading,
  isError,
  pageNumber,
  totalPages,
  onLayoutChange,
  onReset,
  onPageChange,
  onJoinGroup,
  onViewDetail,
  getDetailPath,
}: MyMatchingGroupsResultsProps) {
  return (
    <main className="lg:col-span-9">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-border border-b pb-4">
        <h2 className="font-bold text-2xl text-primary">Danh sách nhóm ({groups.length})</h2>
        <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1">
          {(['list', 'grid'] as const).map((option) => {
            const Icon = option === 'list' ? List : LayoutGrid;
            return (
              <button
                key={option}
                type="button"
                onClick={() => onLayoutChange(option)}
                className={cn(
                  'cursor-pointer rounded-full p-1.5 transition-colors',
                  layout === option
                    ? 'bg-primary font-semibold text-white'
                    : 'text-muted-foreground hover:bg-muted'
                )}
                aria-label={option === 'list' ? 'Hiển thị danh sách' : 'Hiển thị lưới'}
                aria-pressed={layout === option}
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <MyMatchingGroupsSkeleton layout={layout} />
      ) : isError ? (
        <MyMatchingGroupsError onRetry={onReset} />
      ) : groups.length === 0 ? (
        <MyMatchingGroupsEmpty onReset={onReset} activeRole={activeRole} />
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
              getDetailPath={getDetailPath}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8">
          <TourPagination
            pageNumber={pageNumber}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </main>
  );
}

function MyMatchingGroupsSkeleton({ layout }: { layout: MatchingGroupLayout }) {
  return (
    <div className={layout === 'grid' ? 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-5'}>
      {['first', 'second', 'third'].map((id) => (
        <div key={id} className="rounded-2xl bg-white p-4 shadow-xs ring-1 ring-border">
          <div className="mb-3 h-20 animate-pulse rounded-xl bg-muted" />
          <div className="mb-2 h-5 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

function MyMatchingGroupsError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <RotateCcw className="mb-4 h-8 w-8 text-destructive" />
      <h3 className="mb-2 font-bold text-base text-primary">Không thể tải danh sách nhóm</h3>
      <p className="mb-6 max-w-sm text-muted-foreground text-xs">
        Đã xảy ra lỗi kết nối với máy chủ. Vui lòng kiểm tra lại.
      </p>
      <AppButton onClick={onRetry}>Thử lại</AppButton>
    </div>
  );
}

interface MyMatchingGroupsEmptyProps {
  onReset: () => void;
  activeRole: MatchingGroupRoleFilter;
}

function MyMatchingGroupsEmpty({ onReset, activeRole }: MyMatchingGroupsEmptyProps) {
  const message =
    activeRole === 'LEADER'
      ? 'Bạn chưa tạo nhóm ghép nào.'
      : activeRole === 'MEMBER'
        ? 'Bạn chưa tham gia nhóm ghép nào.'
        : 'Bạn chưa có nhóm ghép nào.';
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-white py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-primary">
        <Users className="h-8 w-8" />
      </div>
      <h3 className="mb-2 font-bold text-base text-primary">{message}</h3>
      <p className="mb-6 max-w-sm text-muted-foreground text-xs">
        Hãy tạo nhóm mới hoặc tìm kiếm những người bạn đồng hành cho chuyến đi sắp tới của bạn.
      </p>
      <AppButton onClick={onReset}>Xem tất cả nhóm</AppButton>
    </div>
  );
}
