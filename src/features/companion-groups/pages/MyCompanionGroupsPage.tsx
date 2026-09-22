import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getTrekkerGroupDetailPath,
  getTrekkerGroupJoinPath,
  isVendorOrAdminRole,
  PATHS,
} from '@/constants';
import { checkProfileCompleteness, ProfileCompletionModal, useProfile } from '@/features/profile';
import { useTours } from '@/features/tours/hooks/useTours';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useAppStore } from '@/store/useAppStore';
import type { GroupCardData } from '../components/CompanionGroupCard';
import { CreateCompanionGroupModal } from '../components/CreateCompanionGroupModal';
import { MyMatchingGroupsFilters } from '../components/discovery/MyMatchingGroupsFilters';
import { MyMatchingGroupsHeader } from '../components/discovery/MyMatchingGroupsHeader';
import { MyMatchingGroupsResults } from '../components/discovery/MyMatchingGroupsResults';
import { ProfileIncompleteBanner } from '../components/discovery/ProfileIncompleteBanner';
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
  const isVendorOrAdmin = isVendorOrAdminRole(user?.roles);
  const [activeRole, setActiveRole] = useState<MatchingGroupRoleFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTourId, setSelectedTourId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [statusFilter, setStatusFilter] = useState<MatchingGroupStatusFilter>('ALL');
  const [sortKey, setSortKey] = useState(MATCHING_GROUP_DEFAULT_SORT);
  const [page, setPage] = useState(0);
  const [layout, setLayout] = useState<MatchingGroupLayout>('grid');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isProfileCompletionModalOpen, setIsProfileCompletionModalOpen] = useState(false);
  const hasAutoPromptedRef = useRef(false);
  const debouncedSearchQuery = useDebounce(searchQuery, MATCHING_GROUP_SEARCH_DEBOUNCE_MS);

  const {
    data: profile,
    isLoading: isProfileLoading,
    isFetching: isProfileFetching,
  } = useProfile();
  const completeness = useMemo(() => checkProfileCompleteness(profile), [profile]);
  const canLoadData =
    !isGuest && (isVendorOrAdmin || (!isProfileLoading && completeness.isComplete));

  useEffect(() => {
    if (isGuest) navigate(PATHS.LOGIN);
  }, [isGuest, navigate]);

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

  const [sortBy, sortDir] = sortKey.split('-') as [string, string];
  const { data, isLoading, isError } = useMyMatchingGroups(
    {
      role: activeRole === 'ALL' ? undefined : activeRole,
      status: statusFilter === 'ALL' ? undefined : statusFilter,
      tourId: selectedTourId || undefined,
      targetDate: selectedDate || undefined,
      keyword: debouncedSearchQuery || undefined,
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
  const groups = data?.content ?? [];

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

  function handleCreateClick() {
    if (!isVendorOrAdmin && !completeness.isComplete) {
      setIsProfileCompletionModalOpen(true);
      return;
    }
    setIsCreateModalOpen(true);
  }

  if (isGuest) return null;

  return (
    <div className="flex w-full max-w-7xl flex-col space-y-6 pb-12">
      {!isVendorOrAdmin && !completeness.isComplete && (
        <ProfileIncompleteBanner
          missingCount={completeness.missingFields.length}
          returnPath={PATHS.TREKKER_MY_GROUPS}
        />
      )}

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
        onCreateClick={handleCreateClick}
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
          canJoin={!isVendorOrAdmin}
          onJoinGroup={
            isVendorOrAdmin
              ? undefined
              : (group) => navigate(getTrekkerGroupJoinPath(groupId(group)))
          }
          onViewDetail={(group) => navigate(getTrekkerGroupDetailPath(groupId(group)))}
          getDetailPath={getTrekkerGroupDetailPath}
        />
      </div>

      <CreateCompanionGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Profile Completion Required Modal */}
      <ProfileCompletionModal
        open={isProfileCompletionModalOpen}
        onClose={() => setIsProfileCompletionModalOpen(false)}
        missingFieldLabels={completeness.missingFieldLabels}
        returnPath={PATHS.TREKKER_MY_GROUPS}
        title="Cần hoàn thiện hồ sơ để tạo và quản lý nhóm"
        description="Để đảm bảo uy tín và an toàn cho các thành viên đồng hành, bạn cần hoàn tất các thông tin bắt buộc trước khi tạo hoặc quản lý nhóm."
      />
    </div>
  );
}
