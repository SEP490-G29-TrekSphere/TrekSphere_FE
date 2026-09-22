import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  getGroupDetailPath,
  getTrekkerGroupDetailPath,
  isVendorOrAdminRole,
  PATHS,
} from '@/constants';
import { checkProfileCompleteness, ProfileCompletionModal, useProfile } from '@/features/profile';
import { useTours } from '@/features/tours/hooks/useTours';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import type { GroupCardData } from '../components/CompanionGroupCard';
import { MatchingGroupDiscoveryFilters } from '../components/discovery/MatchingGroupDiscoveryFilters';
import { MatchingGroupDiscoveryHero } from '../components/discovery/MatchingGroupDiscoveryHero';
import { MatchingGroupDiscoveryResults } from '../components/discovery/MatchingGroupDiscoveryResults';
import { MatchingGroupDiscoverySearchBar } from '../components/discovery/MatchingGroupDiscoverySearchBar';
import { ProfileIncompleteBanner } from '../components/discovery/ProfileIncompleteBanner';
import { JoinGroupModal, type JoinGroupModalData } from '../components/modals/JoinGroupModal';
import {
  MATCHING_GROUP_DEFAULT_SORT,
  MATCHING_GROUP_LOOKUP_PAGE_SIZE,
  MATCHING_GROUP_PAGE_SIZE,
  MATCHING_GROUP_PRICE_DEFAULT_MAX,
  MATCHING_GROUP_PRICE_DEFAULT_MIN,
  MATCHING_GROUP_SEARCH_DEBOUNCE_MS,
  MATCHING_GROUP_TOUR_FILTER_PAGE_SIZE,
  type MatchingGroupDifficultyFilter,
  type MatchingGroupLayout,
  type MatchingGroupStatusFilter,
} from '../constants';
import { useJoinMatchingGroup } from '../hooks/useJoinMatchingGroup';
import { useMatchingGroups } from '../hooks/useMatchingGroups';
import { useMyJoinRequests } from '../hooks/useMyJoinRequests';
import { useMyMatchingGroups } from '../hooks/useMyMatchingGroups';
import { useRequireLogin } from '../hooks/useRequireLogin';
import { toMatchingGroupCardViewModel } from '../mappers';
import { isCurrentUserGroupLeader } from '../mappers/matchingGroup';
import type { JoinApplicationStatus } from '../types/matchingGroup';

export default function CompanionGroupsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useAppStore((state) => state.user);
  const isGuest = !user;
  const isVendorOrAdmin = isVendorOrAdminRole(user?.roles);
  const requireLogin = useRequireLogin();

  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get('q') || searchParams.get('keyword') || ''
  );
  const [selectedTourId, setSelectedTourId] = useState(() => searchParams.get('tourId') || '');
  const [selectedDate, setSelectedDate] = useState(
    () => searchParams.get('date') || searchParams.get('targetDate') || ''
  );
  const [difficulty, setDifficulty] = useState<MatchingGroupDifficultyFilter>(
    () => (searchParams.get('difficulty') as MatchingGroupDifficultyFilter) || 'ALL'
  );
  const [statusFilter, setStatusFilter] = useState<MatchingGroupStatusFilter>(
    () => (searchParams.get('status') as MatchingGroupStatusFilter) || 'ALL'
  );
  const [priceRange, setPriceRange] = useState<[number, number]>(() => {
    const minParam = searchParams.get('minCost');
    const maxParam = searchParams.get('maxCost');
    const minVal = minParam ? Number(minParam) : MATCHING_GROUP_PRICE_DEFAULT_MIN;
    const maxVal = maxParam ? Number(maxParam) : MATCHING_GROUP_PRICE_DEFAULT_MAX;
    return [minVal, maxVal];
  });
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
  const debouncedPriceRange = useDebounce(priceRange, 300);

  const minCost =
    debouncedPriceRange[0] > MATCHING_GROUP_PRICE_DEFAULT_MIN ? debouncedPriceRange[0] : undefined;
  const maxCost =
    debouncedPriceRange[1] < MATCHING_GROUP_PRICE_DEFAULT_MAX ? debouncedPriceRange[1] : undefined;

  // Sync state to URL search parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearchQuery.trim()) params.set('q', debouncedSearchQuery.trim());
    if (selectedTourId) params.set('tourId', selectedTourId);
    if (selectedDate) params.set('date', selectedDate);
    if (difficulty && difficulty !== 'ALL') params.set('difficulty', difficulty);
    if (statusFilter && statusFilter !== 'ALL') params.set('status', statusFilter);
    if (minCost !== undefined) params.set('minCost', String(minCost));
    if (maxCost !== undefined) params.set('maxCost', String(maxCost));
    if (availableSlotsOnly) params.set('slots', 'true');
    if (hideJoinedGroups) params.set('hideJoined', 'true');
    if (sortKey && sortKey !== MATCHING_GROUP_DEFAULT_SORT) params.set('sort', sortKey);
    if (page > 0) params.set('page', String(page));

    setSearchParams(params, { replace: true });
  }, [
    debouncedSearchQuery,
    selectedTourId,
    selectedDate,
    difficulty,
    statusFilter,
    minCost,
    maxCost,
    availableSlotsOnly,
    hideJoinedGroups,
    sortKey,
    page,
    setSearchParams,
  ]);

  const [selectedJoinGroup, setSelectedJoinGroup] = useState<JoinGroupModalData | null>(null);
  const [isProfileCompletionModalOpen, setIsProfileCompletionModalOpen] = useState(false);
  const hasAutoPromptedRef = useRef(false);
  const joinGroupMutation = useJoinMatchingGroup();

  const {
    data: profile,
    isLoading: isProfileLoading,
    isFetching: isProfileFetching,
  } = useProfile();
  const completeness = useMemo(() => checkProfileCompleteness(profile), [profile]);
  const canLoadData = isGuest || isVendorOrAdmin || (!isProfileLoading && completeness.isComplete);

  useEffect(() => {
    if (isGuest || isVendorOrAdmin || completeness.isComplete) {
      setIsProfileCompletionModalOpen(false);
      return;
    }
    if (
      !isProfileLoading &&
      !isProfileFetching &&
      profile &&
      !completeness.isComplete &&
      !hasAutoPromptedRef.current
    ) {
      hasAutoPromptedRef.current = true;
      setIsProfileCompletionModalOpen(true);
    }
  }, [
    isGuest,
    isVendorOrAdmin,
    isProfileLoading,
    isProfileFetching,
    profile,
    completeness.isComplete,
  ]);

  const { data: myGroupsData } = useMyMatchingGroups(
    { size: MATCHING_GROUP_LOOKUP_PAGE_SIZE },
    { enabled: !isGuest && canLoadData }
  );
  const { data: myApplicationsData } = useMyJoinRequests(
    { size: MATCHING_GROUP_LOOKUP_PAGE_SIZE },
    { enabled: !isGuest && canLoadData }
  );
  const joinedGroupIds = useMemo(() => {
    const ids = new Set<string>();
    for (const group of myGroupsData?.content ?? []) {
      if (group.matchingGroupId) {
        ids.add(String(group.matchingGroupId));
        ids.add(String(group.matchingGroupId).toLowerCase());
      }
    }
    return ids;
  }, [myGroupsData]);

  const applicationStatusMap = useMemo(() => {
    const map = new Map<string, JoinApplicationStatus>();
    for (const app of myApplicationsData?.content ?? []) {
      if (!app.matchingGroupId) continue;
      const rawId = String(app.matchingGroupId);
      const lowerId = rawId.toLowerCase();
      const existing = map.get(lowerId);

      if (!existing || app.status === 'PENDING') {
        map.set(rawId, app.status as JoinApplicationStatus);
        map.set(lowerId, app.status as JoinApplicationStatus);
      }
    }
    return map;
  }, [myApplicationsData]);

  const [sortBy, sortDir] = sortKey.split('-') as [string, string];
  const { data, isLoading, isError, refetch } = useMatchingGroups(
    {
      keyword: debouncedSearchQuery || undefined,
      tourId: selectedTourId || undefined,
      targetDate: selectedDate || undefined,
      difficulty: difficulty === 'ALL' ? undefined : difficulty,
      minCost,
      maxCost,
      availableSlotsOnly: availableSlotsOnly || undefined,
      page,
      size: MATCHING_GROUP_PAGE_SIZE,
      sortBy,
      sortDir,
    },
    { enabled: canLoadData }
  );
  const { tours } = useTours(
    { size: MATCHING_GROUP_TOUR_FILTER_PAGE_SIZE },
    { enabled: canLoadData }
  );
  const matchingGroups = data?.content ?? [];
  const filteredGroups = useMemo(() => {
    let result =
      statusFilter === 'ALL'
        ? matchingGroups
        : matchingGroups.filter((group) => group.status === statusFilter);

    if (difficulty && difficulty !== 'ALL') {
      result = result.filter((group) => group.difficulty === difficulty);
    }

    if (minCost !== undefined) {
      result = result.filter(
        (group) => group.estimatedCost != null && group.estimatedCost >= minCost
      );
    }

    if (maxCost !== undefined) {
      result = result.filter(
        (group) => group.estimatedCost != null && group.estimatedCost <= maxCost
      );
    }

    if (hideJoinedGroups && !isGuest) {
      result = result.filter((group) => {
        const isLeader = Boolean(user && isCurrentUserGroupLeader(group, user.id));
        const isMember = Boolean(
          group.myRole === 'MEMBER' || joinedGroupIds.has(group.matchingGroupId)
        );
        return !isLeader && !isMember;
      });
    }

    return result;
  }, [
    matchingGroups,
    statusFilter,
    difficulty,
    minCost,
    maxCost,
    hideJoinedGroups,
    isGuest,
    user,
    joinedGroupIds,
  ]);

  function resetFilters() {
    setSearchQuery('');
    setSelectedTourId('');
    setSelectedDate('');
    setDifficulty('ALL');
    setStatusFilter('ALL');
    setPriceRange([MATCHING_GROUP_PRICE_DEFAULT_MIN, MATCHING_GROUP_PRICE_DEFAULT_MAX]);
    setAvailableSlotsOnly(false);
    setHideJoinedGroups(false);
    setSortKey(MATCHING_GROUP_DEFAULT_SORT);
    setPage(0);
  }

  function changePage(nextPage: number) {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleOpenJoinModal(group: GroupCardData) {
    if (isVendorOrAdmin) return;
    if (!requireLogin()) return;

    if (!completeness.isComplete) {
      setIsProfileCompletionModalOpen(true);
      return;
    }

    const vm = toMatchingGroupCardViewModel(group);
    const rawId = vm.groupId;
    const lowerId = rawId.toLowerCase();
    const appStatus = applicationStatusMap.get(lowerId) ?? applicationStatusMap.get(rawId);

    if (appStatus === 'PENDING') {
      return;
    }

    setSelectedJoinGroup({
      id: vm.groupId,
      title: vm.groupName,
      leaderName: vm.ownerName,
      leaderAvatar: vm.ownerAvatarUrl,
      coverImageUrl: vm.coverImageUrl,
      departureDate: vm.targetDate,
      targetDate: vm.targetDate,
      maxMembers: vm.maxSize,
      currentMembers: vm.currentSize,
    });
  }

  async function handleConfirmJoinGroup(message?: string) {
    if (!selectedJoinGroup) return;
    try {
      await joinGroupMutation.mutateAsync({
        matchingGroupId: selectedJoinGroup.id,
        message,
      });
      toast.success(
        'Đã gửi yêu cầu tham gia thành công! Trưởng nhóm sẽ xét duyệt yêu cầu của bạn.'
      );
      setSelectedJoinGroup(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Có lỗi xảy ra khi gửi yêu cầu tham gia.'
      );
    }
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <MatchingGroupDiscoveryHero />
      <div className="relative z-20 -mt-8 sm:-mt-10">
        <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
          {!isGuest && !isVendorOrAdmin && !completeness.isComplete && (
            <ProfileIncompleteBanner
              missingCount={completeness.missingFields.length}
              returnPath={PATHS.GROUPS}
            />
          )}
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
              difficulty={difficulty}
              priceRange={priceRange}
              minPrice={MATCHING_GROUP_PRICE_DEFAULT_MIN}
              maxPrice={MATCHING_GROUP_PRICE_DEFAULT_MAX}
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
              onDifficultyChange={(value) => {
                setDifficulty(value);
                setPage(0);
              }}
              onPriceRangeChange={(range) => {
                setPriceRange(range);
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
              applicationStatusMap={applicationStatusMap}
              onLayoutChange={setLayout}
              onSortChange={(value) => {
                setSortKey(value);
                setPage(0);
              }}
              onPageChange={changePage}
              onRetry={() => void refetch()}
              onReset={resetFilters}
              onLogin={() => navigate(PATHS.LOGIN)}
              canJoin={!isVendorOrAdmin}
              onJoinGroup={isVendorOrAdmin ? undefined : handleOpenJoinModal}
              onViewDetail={(group) => {
                const vm = toMatchingGroupCardViewModel(group);
                const rawId = vm.groupId;
                const lowerId = rawId?.toLowerCase();
                const isLeader = Boolean(user && isCurrentUserGroupLeader(vm, user.id));
                const isMember = Boolean(
                  vm.myRole === 'MEMBER' ||
                    (rawId && joinedGroupIds.has(rawId)) ||
                    (lowerId && joinedGroupIds.has(lowerId))
                );
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

      {/* Unified Join Group Modal */}
      {selectedJoinGroup && (
        <JoinGroupModal
          isOpen={Boolean(selectedJoinGroup)}
          onClose={() => {
            setSelectedJoinGroup(null);
            joinGroupMutation.reset();
          }}
          group={selectedJoinGroup}
          onSubmit={handleConfirmJoinGroup}
          isPending={joinGroupMutation.isPending}
          errorMessage={
            joinGroupMutation.error instanceof Error ? joinGroupMutation.error.message : null
          }
        />
      )}

      {/* Profile Completion Required Modal */}
      <ProfileCompletionModal
        open={isProfileCompletionModalOpen}
        onClose={() => setIsProfileCompletionModalOpen(false)}
        missingFieldLabels={completeness.missingFieldLabels}
        returnPath={PATHS.GROUPS}
        title="Cần hoàn thiện hồ sơ để tham gia nhóm"
        description="Để đảm bảo an toàn chuyến đi và giúp trưởng nhóm xét duyệt nhanh chóng, bạn cần bổ sung các thông tin cá nhân và hồ sơ leo núi còn thiếu."
      />
    </div>
  );
}
