import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTrekkerGroupDetailPath, PATHS } from '@/constants';
import { PortalFilterBar, PortalPageHeader } from '@/shared/ui';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import { MyApplicationList } from '../components/applications/MyApplicationList';
import { ReapplyModal, WithdrawRequestConfirmModal } from '../components/modals';
import {
  MATCHING_GROUP_APPLICATION_PAGE_SIZE,
  MATCHING_GROUP_APPLICATION_STATUS_TABS,
  type MatchingGroupApplicationStatusFilter,
} from '../constants';
import { useCancelJoinRequest } from '../hooks/useCancelJoinRequest';
import { useJoinMatchingGroup } from '../hooks/useJoinMatchingGroup';
import { useMyJoinRequests } from '../hooks/useMyJoinRequests';
import { useMyMatchingGroups } from '../hooks/useMyMatchingGroups';
import type { MyMatchingJoinRequestItem } from '../types/matchingGroup';

export default function MyJoinRequestsPage() {
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);
  const isGuest = !user;
  const [statusFilter, setStatusFilter] = useState<MatchingGroupApplicationStatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);

  const [selectedWithdrawApp, setSelectedWithdrawApp] = useState<MyMatchingJoinRequestItem | null>(
    null
  );
  const [selectedReapplyApp, setSelectedReapplyApp] = useState<MyMatchingJoinRequestItem | null>(
    null
  );

  const { data, isLoading, isError, refetch } = useMyJoinRequests({
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    page,
    size: MATCHING_GROUP_APPLICATION_PAGE_SIZE,
  });

  const { data: myGroupsData } = useMyMatchingGroups();
  const joinedGroupIds = useMemo(() => {
    return new Set((myGroupsData?.content ?? []).map((group) => group.matchingGroupId));
  }, [myGroupsData]);

  const withdrawMutation = useCancelJoinRequest();
  const joinMutation = useJoinMatchingGroup();

  useEffect(() => {
    if (isGuest) navigate(PATHS.LOGIN);
  }, [isGuest, navigate]);

  const applications = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return data?.content ?? [];
    return (data?.content ?? []).filter((application) =>
      [
        application.groupName,
        application.tourName,
        application.customJourneyTitle,
        application.ownerName,
      ]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(query))
    );
  }, [data, searchQuery]);

  function handleConfirmWithdraw() {
    if (!selectedWithdrawApp) return;
    withdrawMutation.mutate(selectedWithdrawApp.matchingGroupId, {
      onSuccess: () => {
        toast.success('Rút yêu cầu tham gia thành công.');
        setSelectedWithdrawApp(null);
        void refetch();
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra khi rút yêu cầu.');
      },
    });
  }

  function handleConfirmReapply(message?: string) {
    if (!selectedReapplyApp) return;
    joinMutation.mutate(
      { matchingGroupId: selectedReapplyApp.matchingGroupId, message },
      {
        onSuccess: () => {
          toast.success('Nộp lại đơn tham gia thành công!');
          setSelectedReapplyApp(null);
          void refetch();
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra khi nộp lại đơn.');
        },
      }
    );
  }

  if (isGuest) return null;

  return (
    <div className="space-y-6 pb-12">
      <PortalPageHeader
        title="Yêu Cầu Của Tôi"
        description="Xem và quản lý các yêu cầu gia nhập nhóm ghép của bạn"
      />
      <PortalFilterBar
        tabs={[...MATCHING_GROUP_APPLICATION_STATUS_TABS]}
        activeTab={statusFilter}
        onTabChange={(value) => {
          setStatusFilter(value as MatchingGroupApplicationStatusFilter);
          setPage(0);
        }}
        searchPlaceholder="Tìm theo tên nhóm, hành trình, trưởng nhóm..."
        searchValue={searchQuery}
        onSearchChange={(value) => {
          setSearchQuery(value);
          setPage(0);
        }}
        onSearchClear={() => {
          setSearchQuery('');
          setPage(0);
        }}
      />
      <section className="space-y-4">
        <h2 className="font-bold text-base text-primary">
          Danh sách yêu cầu ({applications.length})
        </h2>
        <MyApplicationList
          applications={applications}
          joinedGroupIds={joinedGroupIds}
          isLoading={isLoading}
          isError={isError}
          isWithdrawing={withdrawMutation.isPending}
          page={page}
          totalPages={data?.totalPages ?? 0}
          isFiltered={statusFilter !== 'ALL'}
          onRetry={() => void refetch()}
          onWithdraw={(app) => setSelectedWithdrawApp(app)}
          onReapply={(app) => setSelectedReapplyApp(app)}
          onViewDetail={(groupId) => navigate(getTrekkerGroupDetailPath(groupId))}
          onViewWorkspace={(groupId) => navigate(getTrekkerGroupDetailPath(groupId))}
          onPageChange={setPage}
        />
      </section>

      {/* Withdraw Modal */}
      <WithdrawRequestConfirmModal
        isOpen={Boolean(selectedWithdrawApp)}
        onClose={() => setSelectedWithdrawApp(null)}
        groupName={selectedWithdrawApp?.groupName ?? ''}
        isPending={withdrawMutation.isPending}
        onConfirm={handleConfirmWithdraw}
      />

      {/* Reapply Modal */}
      <ReapplyModal
        isOpen={Boolean(selectedReapplyApp)}
        onClose={() => setSelectedReapplyApp(null)}
        groupName={selectedReapplyApp?.groupName ?? ''}
        isPending={joinMutation.isPending}
        onConfirm={handleConfirmReapply}
      />
    </div>
  );
}
