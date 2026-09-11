import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTrekkerGroupDetailPath, getTrekkerGroupJoinPath, PATHS } from '@/constants';
import { useTours } from '@/features/tours/hooks/useTours';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useAppStore } from '@/store/useAppStore';
import type { GroupCardData } from '../components/CompanionGroupCard';
import { CreateCompanionGroupModal } from '../components/CreateCompanionGroupModal';
import { MyMatchingGroupsFilters } from '../components/discovery/MyMatchingGroupsFilters';
import { MyMatchingGroupsHeader } from '../components/discovery/MyMatchingGroupsHeader';
import { MyMatchingGroupsResults } from '../components/discovery/MyMatchingGroupsResults';
import {
  MATCHING_GROUP_DEFAULT_SORT,
  MATCHING_GROUP_PAGE_SIZE,
  MATCHING_GROUP_SEARCH_DEBOUNCE_MS,
  MATCHING_GROUP_TOUR_FILTER_PAGE_SIZE,
  type MatchingGroupLayout,
  type MatchingGroupRoleFilter,
  type MatchingGroupStatusFilter,
} from '../constants';
import { useMyMatchingGroups } from '../hooks/useMyMatchingGroups';
import { toMatchingGroupCardViewModel } from '../mappers';

export default function MyCompanionGroupsPage() {
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);
  const isGuest = !user;
  const [activeRole, setActiveRole] = useState<MatchingGroupRoleFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTourId, setSelectedTourId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [statusFilter, setStatusFilter] = useState<MatchingGroupStatusFilter>('ALL');
  const [sortKey, setSortKey] = useState(MATCHING_GROUP_DEFAULT_SORT);
  const [page, setPage] = useState(0);
  const [layout, setLayout] = useState<MatchingGroupLayout>('grid');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, MATCHING_GROUP_SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    if (isGuest) navigate(PATHS.LOGIN);
  }, [isGuest, navigate]);

  const [sortBy, sortDir] = sortKey.split('-') as [string, string];
  const { data, isLoading, isError } = useMyMatchingGroups({
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    role: activeRole === 'ALL' ? undefined : activeRole,
    keyword: debouncedSearchQuery || undefined,
    page,
    size: MATCHING_GROUP_PAGE_SIZE,
    sortBy,
    sortDir,
  });
  const { tours } = useTours({ size: MATCHING_GROUP_TOUR_FILTER_PAGE_SIZE });
  const groups = useMemo(
    () =>
      (data?.content ?? []).filter((group) => {
        const vm = toMatchingGroupCardViewModel(group);
        if (selectedTourId && vm.journeyId !== selectedTourId) return false;
        if (selectedDate && vm.targetDate !== selectedDate) return false;
        return true;
      }),
    [data, selectedTourId, selectedDate]
  );

  function resetFilters() {
    setSearchQuery('');
    setSelectedTourId('');
    setSelectedDate('');
    setStatusFilter('ALL');
    setSortKey(MATCHING_GROUP_DEFAULT_SORT);
    setActiveRole('ALL');
    setPage(0);
  }

  function groupId(group: GroupCardData) {
    return toMatchingGroupCardViewModel(group).groupId;
  }

  if (isGuest) return null;

  return (
    <div className="flex w-full max-w-7xl flex-col space-y-6 pb-12">
      <MyMatchingGroupsHeader
        searchQuery={searchQuery}
        onSearchChange={(value) => {
          setSearchQuery(value);
          setPage(0);
        }}
        activeRole={activeRole}
        onRoleChange={(value) => {
          setActiveRole(value);
          setPage(0);
        }}
        onCreateClick={() => setIsCreateModalOpen(true)}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <MyMatchingGroupsFilters
          tours={tours}
          selectedTourId={selectedTourId}
          selectedDate={selectedDate}
          statusFilter={statusFilter}
          onTourChange={(value) => {
            setSelectedTourId(value);
            setPage(0);
          }}
          onDateChange={(value) => {
            setSelectedDate(value);
            setPage(0);
          }}
          onStatusChange={(value) => {
            setStatusFilter(value);
            setPage(0);
          }}
          onReset={resetFilters}
        />
        <MyMatchingGroupsResults
          groups={groups}
          activeRole={activeRole}
          layout={layout}
          isLoading={isLoading}
          isError={isError}
          pageNumber={data?.pageNumber ?? 0}
          totalPages={data?.totalPages ?? 0}
          onLayoutChange={setLayout}
          onReset={resetFilters}
          onPageChange={setPage}
          onJoinGroup={(group) => navigate(getTrekkerGroupJoinPath(groupId(group)))}
          onViewDetail={(group) => navigate(getTrekkerGroupDetailPath(groupId(group)))}
          getDetailPath={getTrekkerGroupDetailPath}
        />
      </div>

      <CreateCompanionGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
