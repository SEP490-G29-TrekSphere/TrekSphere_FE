import { LayoutGrid, List, RotateCcw, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTrekkerGroupDetailPath, getTrekkerGroupJoinPath, PATHS } from '@/constants';
import { TourPagination } from '@/features/tours';
import { useTours } from '@/features/tours/hooks/useTours';
import { cn } from '@/lib/utils';
import { AppButton, PortalFilterBar, PortalFilterSelect, PortalPageHeader } from '@/shared/ui';
import { useAppStore } from '@/store/useAppStore';
import { CompanionGroupCard, type GroupCardData } from '../components/CompanionGroupCard';
import { CreateCompanionGroupModal } from '../components/CreateCompanionGroupModal';
import { useMyMatchingGroups } from '../hooks/useMyMatchingGroups';

const PAGE_SIZE = 9;

const sortOptions = [
  { value: 'createdAt-desc', label: 'Mới nhất' },
  { value: 'targetDate-asc', label: 'Ngày đi: Sớm nhất' },
  { value: 'targetDate-desc', label: 'Ngày đi: Muộn nhất' },
  { value: 'currentSize-desc', label: 'Nhiều thành viên nhất' },
];

const statusFilterOptions = [
  { value: 'ALL', label: 'Tất cả trạng thái' },
  { value: 'OPEN', label: 'Đang mở' },
  { value: 'FULL', label: 'Đã đủ' },
  { value: 'CLOSED', label: 'Đã đóng' },
];

const roleTabs = [
  { key: 'ALL', label: 'Tất cả nhóm' },
  { key: 'OWNER', label: 'Nhóm tôi làm trưởng' },
  { key: 'MEMBER', label: 'Nhóm tôi tham gia' },
];

function getGroupProperties(group: GroupCardData) {
  const isApi = 'matchingGroupId' in group;
  return {
    ownerId: isApi ? group.ownerId : group.leader.id,
    groupName: isApi ? group.groupName : group.title,
    tourName: isApi ? group.tourName : group.location,
    status: isApi ? group.status : 'OPEN',
    tourId: isApi ? group.tourId : group.id,
    targetDate: isApi ? group.targetDate : group.departureDate,
  };
}

export default function MyCompanionGroupsPage() {
  const navigate = useNavigate();
  const user = useAppStore((s) => s.user);
  const isGuest = !user;

  // Protect route
  useEffect(() => {
    if (isGuest) {
      navigate(PATHS.LOGIN);
    }
  }, [isGuest, navigate]);

  // --- Filter & UI state ---
  const [activeTab, setActiveTab] = useState<'ALL' | 'OWNER' | 'MEMBER'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTourId, setSelectedTourId] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortKey, setSortKey] = useState('createdAt-desc');
  const [page, setPage] = useState(0);
  const [layout, setLayout] = useState<'list' | 'grid'>('grid');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Reset page on filter change
  // biome-ignore lint/correctness/useExhaustiveDependencies: setPage is stable
  useEffect(() => {
    setPage(0);
  }, [searchQuery, selectedTourId, statusFilter, sortKey, activeTab]);

  const [sortBy, sortDir] = sortKey.split('-') as [string, string];

  // --- Data Loading ---
  const {
    data: myGroupsData,
    isLoading,
    isError,
  } = useMyMatchingGroups({
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    keyword: searchQuery.trim() || undefined,
    page,
    size: PAGE_SIZE,
    sortBy,
    sortDir,
  });

  // All tours for select dropdown
  const { tours: allTours } = useTours({ size: 50 });

  const tourSelectOptions = useMemo(() => {
    return [
      { value: '', label: 'Tất cả các tour' },
      ...allTours.map((t) => ({ value: t.id, label: t.name })),
    ];
  }, [allTours]);

  // Compute final groups list
  const finalGroups = useMemo(() => {
    if (isGuest || !user) return [];

    let list: GroupCardData[] = [];

    if (myGroupsData?.content) {
      list = myGroupsData.content;
    }

    // Apply Client-Side Tab Filter
    if (activeTab === 'OWNER') {
      list = list.filter((g) => getGroupProperties(g).ownerId === user.id);
    } else if (activeTab === 'MEMBER') {
      list = list.filter((g) => getGroupProperties(g).ownerId !== user.id);
    }

    // Apply client-side tour filter
    if (selectedTourId) {
      list = list.filter((g) => getGroupProperties(g).tourId === selectedTourId);
    }

    return list;
  }, [isGuest, user, myGroupsData, activeTab, selectedTourId]);

  // Paginated client-side or server-side numbers
  const totalPages = myGroupsData?.totalPages ?? 0;
  const pageNumber = myGroupsData?.pageNumber ?? 0;

  const displayedGroups = finalGroups;

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedTourId('');
    setStatusFilter('ALL');
    setSortKey('createdAt-desc');
    setPage(0);
    setActiveTab('ALL');
  };

  const handleCreateClick = () => {
    setIsCreateModalOpen(true);
  };

  const handleJoinGroup = (group: GroupCardData) => {
    const groupId = 'matchingGroupId' in group ? group.matchingGroupId : group.id;
    navigate(getTrekkerGroupJoinPath(groupId));
  };

  const handleViewDetail = (group: GroupCardData) => {
    const groupId = 'matchingGroupId' in group ? group.matchingGroupId : group.id;
    navigate(getTrekkerGroupDetailPath(groupId));
  };

  const handlePageChange = (next: number) => {
    setPage(next);
  };

  if (isGuest) {
    return null;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* ── Page Header ── */}
      <PortalPageHeader
        title="Nhóm Của Tôi"
        description="Quản lý các nhóm ghép bạn đã tạo hoặc đã tham gia để cùng đồng hành"
        actions={
          <AppButton
            onClick={handleCreateClick}
            className="rounded-full px-5 py-2.5 text-xs font-bold text-white bg-[#06261D] hover:bg-[#0B3025] shadow-sm"
          >
            + Tạo nhóm mới
          </AppButton>
        }
      />

      {/* ── Standardized Filter Bar ── */}
      <PortalFilterBar
        tabs={roleTabs}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab as 'ALL' | 'OWNER' | 'MEMBER');
          setPage(0);
        }}
        searchPlaceholder="Tìm theo tên nhóm, tour..."
        searchValue={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setPage(0);
        }}
        onSearchClear={() => {
          setSearchQuery('');
          setPage(0);
        }}
        sort={{
          value: sortKey,
          onChange: setSortKey,
          options: sortOptions,
          label: 'Sắp xếp',
        }}
        filters={
          <>
            <PortalFilterSelect
              label="Trạng thái"
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setPage(0);
              }}
              options={statusFilterOptions}
            />
            <PortalFilterSelect
              label="Tour"
              value={selectedTourId}
              onChange={(val) => {
                setSelectedTourId(val);
                setPage(0);
              }}
              options={tourSelectOptions}
              placeholder="Chọn tour"
            />
          </>
        }
      />

      {/* ── Main Content ── */}
      <div className="space-y-4">
        {/* Results header row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
          <h2 className="text-base font-bold text-[#06261D]">
            Danh sách nhóm ({displayedGroups.length})
          </h2>

          {/* Layout toggle */}
          <div className="flex items-center gap-1 rounded-full border border-[#E0DCD1] bg-white p-1">
            <button
              type="button"
              onClick={() => setLayout('list')}
              className={cn(
                'rounded-full p-1.5 transition-colors cursor-pointer',
                layout === 'list'
                  ? 'bg-[#06261D] text-white font-semibold'
                  : 'text-[#6F7B75] hover:bg-neutral-50'
              )}
              aria-label="Hiển thị danh sách"
            >
              <List className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setLayout('grid')}
              className={cn(
                'rounded-full p-1.5 transition-colors cursor-pointer',
                layout === 'grid'
                  ? 'bg-[#06261D] text-white font-semibold'
                  : 'text-[#6F7B75] hover:bg-neutral-50'
              )}
              aria-label="Hiển thị lưới"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Content area */}
        {isLoading ? (
          <GroupsSkeleton layout={layout} />
        ) : isError ? (
          <GroupsError onRetry={handleResetFilters} />
        ) : displayedGroups.length === 0 ? (
          <GroupsEmpty onReset={handleResetFilters} activeTab={activeTab} />
        ) : (
          <div
            className={
              layout === 'grid' ? 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3' : 'flex flex-col gap-5'
            }
          >
            {displayedGroups.map((group) => (
              <CompanionGroupCard
                key={'matchingGroupId' in group ? group.matchingGroupId : group.id}
                group={group}
                layout={layout}
                onJoinGroup={handleJoinGroup}
                onViewDetail={handleViewDetail}
                getDetailPath={getTrekkerGroupDetailPath}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8">
            <TourPagination
              pageNumber={pageNumber}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* Create modal */}
      <CreateCompanionGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}

// ── Skeletons and Empty States ──

function GroupsSkeleton({ layout }: { layout: 'list' | 'grid' }) {
  const skeletonIds = ['sk-1', 'sk-2', 'sk-3'];
  if (layout === 'grid') {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {skeletonIds.map((id) => (
          <div
            key={`skeleton-grid-${id}`}
            className="flex flex-col rounded-2xl bg-white shadow-xs ring-1 ring-[#E0DCD1] p-4 gap-3"
          >
            <div className="h-28 w-full animate-pulse rounded-xl bg-neutral-100" />
            <div className="h-5 w-3/4 animate-pulse rounded bg-neutral-100" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-neutral-100" />
            <div className="h-7 w-20 animate-pulse rounded-full bg-neutral-100 mt-2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {skeletonIds.map((id) => (
        <div
          key={`skeleton-list-${id}`}
          className="flex gap-4 rounded-2xl bg-white p-4 shadow-xs ring-1 ring-[#E0DCD1]"
        >
          <div className="flex flex-1 flex-col gap-2 py-1">
            <div className="h-5 w-2/3 animate-pulse rounded bg-neutral-100" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-neutral-100" />
            <div className="h-7 w-20 animate-pulse rounded-full bg-neutral-100 mt-1" />
          </div>
        </div>
      ))}
    </div>
  );
}

function GroupsError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
        <RotateCcw className="h-8 w-8" />
      </div>
      <h3 className="mb-2 text-base font-bold text-[#06261D]">Không thể tải danh sách nhóm</h3>
      <p className="mb-6 max-w-sm text-xs text-[#6F7B75]">
        Đã xảy ra lỗi kết nối với máy chủ. Vui lòng kiểm tra lại.
      </p>
      <AppButton onClick={onRetry}>Thử lại</AppButton>
    </div>
  );
}

function GroupsEmpty({ onReset, activeTab }: { onReset: () => void; activeTab: string }) {
  const message = useMemo(() => {
    if (activeTab === 'OWNER') return 'Bạn chưa tạo nhóm ghép nào.';
    if (activeTab === 'MEMBER') return 'Bạn chưa tham gia nhóm ghép nào.';
    return 'Bạn chưa có nhóm ghép nào.';
  }, [activeTab]);

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center bg-white border border-[#E0DCD1] rounded-2xl">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-[#06261D]">
        <Users className="h-8 w-8" />
      </div>
      <h3 className="mb-2 text-base font-bold text-[#06261D]">{message}</h3>
      <p className="mb-6 max-w-sm text-xs text-[#6F7B75]">
        Hãy tạo nhóm mới hoặc tìm kiếm những người bạn đồng hành cho chuyến đi sắp tới của bạn.
      </p>
      <AppButton onClick={onReset} className="bg-[#06261D] hover:bg-[#0B3025] text-white">
        Xem tất cả nhóm
      </AppButton>
    </div>
  );
}
