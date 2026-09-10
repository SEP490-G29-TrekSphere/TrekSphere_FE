import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  getGroupDetailPath,
  getGroupJoinPath,
  getTrekkerGroupDetailPath,
  PATHS,
} from '@/constants';
import { useTours } from '@/features/tours/hooks/useTours';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useAppStore } from '@/store/useAppStore';
import type { GroupCardData } from '../components/CompanionGroupCard';
import { MatchingGroupDiscoveryFilters } from '../components/discovery/MatchingGroupDiscoveryFilters';
import { MatchingGroupDiscoveryHero } from '../components/discovery/MatchingGroupDiscoveryHero';
import { MatchingGroupDiscoveryResults } from '../components/discovery/MatchingGroupDiscoveryResults';
import { MatchingGroupDiscoverySearchBar } from '../components/discovery/MatchingGroupDiscoverySearchBar';
import {
  MATCHING_GROUP_DEFAULT_SORT,
  MATCHING_GROUP_LOOKUP_PAGE_SIZE,
  MATCHING_GROUP_PAGE_SIZE,
  MATCHING_GROUP_SEARCH_DEBOUNCE_MS,
  MATCHING_GROUP_TOUR_FILTER_PAGE_SIZE,
  type MatchingGroupLayout,
  type MatchingGroupStatusFilter,
} from '../constants';
import { useMatchingGroups } from '../hooks/useMatchingGroups';
import { useMyJoinRequests } from '../hooks/useMyJoinRequests';
import { useMyMatchingGroups } from '../hooks/useMyMatchingGroups';
import { toMatchingGroupCardViewModel } from '../mappers';

export default function CompanionGroupsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useAppStore((state) => state.user);
  const isGuest = !user;

  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get('q') || searchParams.get('keyword') || ''
  );
  const [selectedTourId, setSelectedTourId] = useState(() => searchParams.get('tourId') || '');
  const [selectedDate, setSelectedDate] = useState(
    () => searchParams.get('date') || searchParams.get('targetDate') || ''
  );
  const [statusFilter, setStatusFilter] = useState<MatchingGroupStatusFilter>(
    () => (searchParams.get('status') as MatchingGroupStatusFilter) || 'ALL'
  );
  const [availableSlotsOnly, setAvailableSlotsOnly] = useState(
    () => searchParams.get('slots') === 'true'
  );
  const [hideJoinedGroups, setHideJoinedGroups] = useState(
    () => searchParams.get('hideJoined') === 'true'
  );
  const [sortKey, setSortKey] = useState(
    () => searchParams.get('sort') || MATCHING_GROUP_DEFAULT_SORT
  );
  const [page, setPage] = useState(() => Math.max(0, Number(searchParams.get('page')) || 0));
  const [layout, setLayout] = useState<MatchingGroupLayout>('grid');
  const debouncedSearchQuery = useDebounce(searchQuery, MATCHING_GROUP_SEARCH_DEBOUNCE_MS);

  // Sync state to URL search parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearchQuery.trim()) params.set('q', debouncedSearchQuery.trim());
    if (selectedTourId) params.set('tourId', selectedTourId);
    if (selectedDate) params.set('date', selectedDate);
    if (statusFilter && statusFilter !== 'ALL') params.set('status', statusFilter);
    if (availableSlotsOnly) params.set('slots', 'true');
    if (hideJoinedGroups) params.set('hideJoined', 'true');
    if (sortKey && sortKey !== MATCHING_GROUP_DEFAULT_SORT) params.set('sort', sortKey);
    if (page > 0) params.set('page', String(page));

    setSearchParams(params, { replace: true });
  }, [
    debouncedSearchQuery,
    selectedTourId,
    selectedDate,
    statusFilter,
    availableSlotsOnly,
    hideJoinedGroups,
    sortKey,
    page,
    setSearchParams,
  ]);

  const { data: myGroupsData } = useMyMatchingGroups(
    { size: MATCHING_GROUP_LOOKUP_PAGE_SIZE },
    { enabled: !isGuest }
  );
  const { data: myApplicationsData } = useMyJoinRequests(
    { size: MATCHING_GROUP_LOOKUP_PAGE_SIZE },
    { enabled: !isGuest }
  );
  const joinedGroupIds = useMemo(() => {
    const ids = new Set(myGroupsData?.content.map((group) => group.matchingGroupId) ?? []);
    for (const application of myApplicationsData?.content ?? []) {
      if (application.status === 'PENDING' || application.status === 'ACCEPTED') {
        ids.add(application.matchingGroupId);
      }
    }
    return ids;
  }, [myApplicationsData, myGroupsData]);

  const [sortBy, sortDir] = sortKey.split('-') as [string, string];
  const { data, isLoading, isError, refetch } = useMatchingGroups({
    keyword: debouncedSearchQuery || undefined,
    tourId: selectedTourId || undefined,
    targetDate: selectedDate || undefined,
    availableSlotsOnly: availableSlotsOnly || undefined,
    page,
    size: MATCHING_GROUP_PAGE_SIZE,
    sortBy,
    sortDir,
  });
  const { tours } = useTours({ size: MATCHING_GROUP_TOUR_FILTER_PAGE_SIZE });
  const matchingGroups = data?.content ?? [];
  const filteredGroups = useMemo(() => {
    let result =
      statusFilter === 'ALL'
        ? matchingGroups
        : matchingGroups.filter((group) => group.status === statusFilter);

    if (hideJoinedGroups && !isGuest) {
      result = result.filter((group) => {
        const isLeader = Boolean(
          user && (group.ownerId === user.id || group.isOwner || group.myRole === 'LEADER')
        );
        const isMember = Boolean(
          group.myRole === 'MEMBER' || joinedGroupIds.has(group.matchingGroupId)
        );
        return !isLeader && !isMember;
      });
    }

    return result;
  }, [matchingGroups, statusFilter, hideJoinedGroups, isGuest, user, joinedGroupIds]);

  function resetFilters() {
    setSearchQuery('');
    setSelectedTourId('');
    setSelectedDate('');
    setStatusFilter('ALL');
    setAvailableSlotsOnly(false);
    setHideJoinedGroups(false);
    setSortKey(MATCHING_GROUP_DEFAULT_SORT);
    setPage(0);
  }

  function getGroupId(group: GroupCardData) {
    return toMatchingGroupCardViewModel(group).groupId;
  }

  function changePage(nextPage: number) {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <MatchingGroupDiscoveryHero />
      <div className="relative z-20 -mt-8 sm:-mt-10">
        <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <MatchingGroupDiscoverySearchBar
            searchQuery={searchQuery}
            onSearchChange={(value) => {
              setSearchQuery(value);
              setPage(0);
            }}
          />
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <MatchingGroupDiscoveryFilters
              tours={tours}
              selectedTourId={selectedTourId}
              selectedDate={selectedDate}
              statusFilter={statusFilter}
              availableSlotsOnly={availableSlotsOnly}
              hideJoinedGroups={hideJoinedGroups}
              isGuest={isGuest}
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
              onAvailableSlotsChange={(value) => {
                setAvailableSlotsOnly(value);
                setPage(0);
              }}
              onHideJoinedGroupsChange={(value) => {
                setHideJoinedGroups(value);
                setPage(0);
              }}
              onReset={resetFilters}
            />
            <MatchingGroupDiscoveryResults
              groups={filteredGroups}
              matchingGroupCount={matchingGroups.length}
              totalElements={data?.totalElements ?? 0}
              pageNumber={data?.pageNumber ?? 0}
              totalPages={data?.totalPages ?? 0}
              layout={layout}
              sortKey={sortKey}
              statusFilter={statusFilter}
              isLoading={isLoading}
              isError={isError}
              isGuest={isGuest}
              joinedGroupIds={joinedGroupIds}
              onLayoutChange={setLayout}
              onSortChange={(value) => {
                setSortKey(value);
                setPage(0);
              }}
              onPageChange={changePage}
              onRetry={() => void refetch()}
              onReset={resetFilters}
              onLogin={() => navigate(PATHS.LOGIN)}
              onJoinGroup={(group) => navigate(getGroupJoinPath(getGroupId(group)))}
              onViewDetail={(group) => {
                const vm = toMatchingGroupCardViewModel(group);
                const isLeader = Boolean(
                  user && (vm.ownerId === user.id || vm.isOwner || vm.myRole === 'LEADER')
                );
                const isMember = Boolean(vm.myRole === 'MEMBER' || joinedGroupIds.has(vm.groupId));
                if (isLeader || isMember) {
                  navigate(getTrekkerGroupDetailPath(vm.groupId));
                } else {
                  navigate(getGroupDetailPath(vm.groupId));
                }
              }}
            />
          </div>
        </div>
        <div className="h-16 sm:h-24" />
      </div>
    </div>
  );
}
