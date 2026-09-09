import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTrekkerGroupDetailPath, PATHS } from '@/constants';
import { PortalFilterBar, PortalPageHeader } from '@/shared/ui';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import { MyApplicationList } from '../components/applications/MyApplicationList';
import {
  MATCHING_GROUP_APPLICATION_PAGE_SIZE,
  MATCHING_GROUP_APPLICATION_STATUS_TABS,
  type MatchingGroupApplicationStatusFilter,
} from '../constants';
import { useCancelJoinRequest } from '../hooks/useCancelJoinRequest';
import { useMyJoinRequests } from '../hooks/useMyJoinRequests';

export default function MyJoinRequestsPage() {
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);
  const isGuest = !user;
  const [statusFilter, setStatusFilter] = useState<MatchingGroupApplicationStatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const { data, isLoading, isError, refetch } = useMyJoinRequests({
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    page,
    size: MATCHING_GROUP_APPLICATION_PAGE_SIZE,
  });
  const withdrawMutation = useCancelJoinRequest();

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

  function withdrawApplication(groupId: string) {
    if (!window.confirm('Bạn có chắc chắn muốn rút yêu cầu tham gia nhóm ghép này?')) return;
    withdrawMutation.mutate(groupId, {
      onSuccess: () => {
        toast.success('Rút yêu cầu tham gia thành công.');
        void refetch();
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra khi rút yêu cầu.');
      },
    });
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
          isLoading={isLoading}
          isError={isError}
          isWithdrawing={withdrawMutation.isPending}
          page={page}
          totalPages={data?.totalPages ?? 0}
          isFiltered={statusFilter !== 'ALL'}
          onRetry={() => void refetch()}
          onWithdraw={withdrawApplication}
          onViewDetail={(groupId) => navigate(getTrekkerGroupDetailPath(groupId))}
          onPageChange={setPage}
        />
      </section>
    </div>
  );
}
