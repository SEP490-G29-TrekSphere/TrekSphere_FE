import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { isVendorOrAdminRole, PATHS } from '@/constants';
import { useAppStore } from '@/store/useAppStore';
import { EditMatchingGroupModal } from '../components/create/EditMatchingGroupModal';
import { GroupActionPanel } from '../components/detail/GroupActionPanel';
import { GroupBudgetTab } from '../components/detail/GroupBudgetTab';
import { GroupDetailErrorState } from '../components/detail/GroupDetailErrorState';
import { GroupDetailHero } from '../components/detail/GroupDetailHero';
import { GroupDetailSkeleton } from '../components/detail/GroupDetailSkeleton';
import { type GroupDetailTabKey, GroupDetailTabs } from '../components/detail/GroupDetailTabs';
import { GroupItineraryTab } from '../components/detail/GroupItineraryTab';
import { GroupModals } from '../components/detail/GroupModals';
import { GroupOverviewTab } from '../components/detail/GroupOverviewTab';
import { JoinRequestsCard } from '../components/detail/JoinRequestsCard';
import { JoinGroupModal } from '../components/modals/JoinGroupModal';
import { GroupSOSModal } from '../components/workspace/GroupSOSModal';
import { GroupWorkspace } from '../components/workspace/GroupWorkspace';
import { GroupManagementPanel } from '../components/workspace/management/GroupManagementPanel';
import { OpenDissolutionVoteModal } from '../components/workspace/votes/OpenDissolutionVoteModal';
import { OpenLeaderElectionModal } from '../components/workspace/votes/OpenLeaderElectionModal';
import { MATCHING_GROUP_APPLICATION_PAGE_SIZE } from '../constants';
import { useCompanionGroupDetailActions } from '../hooks/useCompanionGroupDetailActions';
import { useJoinRequests } from '../hooks/useJoinRequests';
import { useMatchingGroupDetail } from '../hooks/useMatchingGroupDetail';
import { useRequireLogin } from '../hooks/useRequireLogin';
import { isCurrentUserGroupLeader } from '../mappers/matchingGroup';

function mapParamToDetailTab(tab: string | null): GroupDetailTabKey {
  if (!tab) return 'overview';
  const lower = tab.toLowerCase();
  if (
    lower === 'budget' ||
    lower === 'expenses' ||
    lower === 'settlement' ||
    lower === 'settlements' ||
    lower === 'cost'
  ) {
    return 'budget';
  }
  if (lower === 'itinerary' || lower === 'journey' || lower === 'checkpoints') {
    return 'itinerary';
  }
  return 'overview';
}

interface CompanionGroupDetailPageProps {
  embedded?: boolean;
  backPath?: string;
  chatPath?: string;
}

export default function CompanionGroupDetailPage({
  embedded = false,
  backPath = PATHS.GROUPS,
  chatPath = PATHS.CHAT,
}: CompanionGroupDetailPageProps = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { groupId } = useParams<{ groupId: string }>();
  const user = useAppStore((state) => state.user);
  const requireLogin = useRequireLogin();
  const locationState = location.state as { backPath?: string } | null;
  const effectiveBackPath = locationState?.backPath ?? backPath;
  const { data: group, isLoading, isError, error, refetch } = useMatchingGroupDetail(groupId);
  const isOwner = Boolean(group && isCurrentUserGroupLeader(group, user?.id));

  const paramTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<GroupDetailTabKey>(() =>
    mapParamToDetailTab(paramTab)
  );

  useEffect(() => {
    setActiveTab(mapParamToDetailTab(paramTab));
  }, [paramTab]);

  const handleDetailTabChange = (newTab: GroupDetailTabKey) => {
    setActiveTab(newTab);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('tab', newTab);
        return next;
      },
      { replace: true }
    );
  };
  const [applicationPage, setApplicationPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [isElectionModalOpen, setIsElectionModalOpen] = useState(false);
  const [isDissolutionModalOpen, setIsDissolutionModalOpen] = useState(false);

  const applications = useJoinRequests(isOwner ? groupId : undefined, {
    status: 'PENDING',
    page: applicationPage - 1,
    size: MATCHING_GROUP_APPLICATION_PAGE_SIZE,
  });

  const actions = useCompanionGroupDetailActions({
    groupId,
    group,
    currentUserId: user?.id?.toString(),
    backPath: effectiveBackPath,
    chatPath,
  });

  const isMemberOrLeader =
    actions.currentUserRole === 'leader' || actions.currentUserRole === 'member';
  const isVendorOrAdmin = isVendorOrAdminRole(user?.roles);

  const shellClassName = embedded
    ? 'text-foreground'
    : 'min-h-screen bg-background px-4 pt-24 pb-12 text-foreground md:px-10 lg:px-16';

  function handleBack() {
    if (locationState?.backPath) {
      navigate(locationState.backPath);
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(effectiveBackPath);
    }
  }

  if (isLoading) {
    return (
      <div className={shellClassName}>
        <GroupDetailSkeleton embedded={embedded} />
      </div>
    );
  }

  if (isError || !group) {
    const rawMessage = error instanceof Error ? error.message : '';
    const isNotFoundError =
      rawMessage.includes('không tồn tại') ||
      rawMessage.includes('8101') ||
      rawMessage.toLowerCase().includes('not found');

    const errorMessage = isNotFoundError
      ? 'Nhóm ghép không tồn tại, đã bị đóng tuyển hoặc tạm ẩn bởi trưởng nhóm.'
      : rawMessage || 'Nhóm ghép không tồn tại hoặc đã bị giải tán.';

    return (
      <GroupDetailErrorState
        embedded={embedded}
        message={errorMessage}
        onBack={handleBack}
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <div className={shellClassName}>
      {actions.feedback && (
        <div className="fade-in slide-in-from-top-4 fixed top-6 right-6 z-[100] animate-in rounded-xl bg-primary px-6 py-3 font-semibold text-sm text-white shadow-lg">
          {actions.feedback}
        </div>
      )}

      <div className={`${embedded ? 'w-full' : 'mx-auto max-w-6xl'} space-y-7`}>
        {/* Hero Section */}
        <GroupDetailHero
          groupName={group.groupName}
          tourName={group.tourName}
          tourImageUrl={group.tourImageUrl}
          coverImageUrl={group.coverImageUrl}
          location={group.location}
          description={group.description}
          status={group.status}
          targetDate={group.targetDate}
          matchingDeadline={group.matchingDeadline}
          difficulty={group.difficulty}
          estimatedCost={group.estimatedCost}
          currentMembers={group.currentSize}
          maxMembers={group.maxSize}
        />

        {/* 12-Column Responsive Layout */}
        <div className="grid grid-cols-1 gap-7 lg:grid-cols-12">
          {/* Main Left Column */}
          <div className="space-y-6 lg:col-span-8">
            {isMemberOrLeader ? (
              <GroupWorkspace
                group={group}
                currentUserId={user?.id?.toString()}
                isLeader={actions.currentUserRole === 'leader'}
                role={actions.currentUserRole}
                pendingJoinRequestsCount={
                  actions.currentUserRole === 'leader' ? (applications.data?.totalElements ?? 0) : 0
                }
                joinRequestsSlot={
                  actions.currentUserRole === 'leader' ? (
                    <JoinRequestsCard
                      requests={applications.data?.content ?? []}
                      isLoading={applications.isLoading}
                      isError={applications.isError}
                      onRetry={() => void applications.refetch()}
                      onApprove={(request) => actions.openRequestModal('approve', request)}
                      onReject={(request) => actions.openRequestModal('reject', request)}
                      page={applicationPage}
                      totalPages={applications.data?.totalPages ?? 0}
                      totalElements={applications.data?.totalElements ?? 0}
                      isLast={applications.data?.last ?? true}
                      onPrevPage={() => setApplicationPage((page) => page - 1)}
                      onNextPage={() => setApplicationPage((page) => page + 1)}
                    />
                  ) : undefined
                }
                managementSlot={
                  actions.currentUserRole === 'leader' ? (
                    <GroupManagementPanel
                      groupStatus={group.status}
                      matchingDeadline={group.matchingDeadline}
                      targetDate={group.targetDate}
                      endDate={group.customJourneyEndDate}
                      isLifecyclePending={actions.isLifecyclePending}
                      onEditGroup={() => setIsEditModalOpen(true)}
                      onHideGroup={actions.hideGroup}
                      onShowGroup={actions.showGroup}
                      onCloseGroup={actions.closeGroup}
                      onOpenGroup={actions.openGroup}
                      onStartTrip={actions.startTrip}
                      onCompleteTrip={actions.completeTrip}
                      onOpenLeaderElection={() => setIsElectionModalOpen(true)}
                      onOpenDissolutionVote={() => setIsDissolutionModalOpen(true)}
                    />
                  ) : undefined
                }
                onDirectChat={actions.openDirectChat}
                onAddMemberToChat={actions.openAddMemberModal}
                onRemoveMember={actions.openRemoveMemberModal}
              />
            ) : (
              <>
                <GroupDetailTabs
                  activeTab={activeTab}
                  onTabChange={handleDetailTabChange}
                  checkpointCount={group.checkpoints?.length}
                  costItemCount={group.costItems?.length}
                />

                {/* Public Tab Panels */}
                {activeTab === 'overview' && (
                  <GroupOverviewTab
                    group={group}
                    currentUserId={user?.id?.toString()}
                    role={actions.currentUserRole}
                    onDirectChat={actions.openDirectChat}
                    onAddMemberToChat={actions.openAddMemberModal}
                  />
                )}

                {activeTab === 'itinerary' && <GroupItineraryTab group={group} />}

                {activeTab === 'budget' && (
                  <GroupBudgetTab
                    group={group}
                    isOutsider={!isMemberOrLeader}
                    currentUserId={user?.id?.toString()}
                  />
                )}
              </>
            )}
          </div>

          {/* Right Action Column */}
          <div className="lg:col-span-4">
            <GroupActionPanel
              role={actions.currentUserRole}
              groupStatus={group.status}
              isJoining={actions.isJoining}
              canJoin={!isVendorOrAdmin}
              myMembershipStatus={group.myMembershipStatus}
              rejectReason={group.myRejectReason}
              onOpenChat={actions.openGroupChat}
              onJoin={() => {
                if (isVendorOrAdmin) return;
                if (!requireLogin()) return;
                setIsJoinModalOpen(true);
              }}
              onLeave={() => actions.setActiveModal('leave')}
              onCancelRequest={() => actions.setActiveModal('leave')}
              onCreateGroupChat={actions.openGroupChat}
              onOpenSos={() => setIsSosModalOpen(true)}
              acceptedMembersCount={
                group.members.filter((member) => member.status === 'ACCEPTED').length
              }
              hasConversation={group.hasConversation}
              isInConversation={group.isInConversation}
            />
          </div>
        </div>
      </div>

      {/* Confirmation & Action Modals */}
      <GroupModals
        activeModal={actions.activeModal}
        setActiveModal={actions.setActiveModal}
        selectedRequest={actions.selectedRequest}
        selectedAddBackMember={actions.selectedAddBackMember}
        selectedRemoveMember={actions.selectedRemoveMember}
        currentUserRole={actions.currentUserRole}
        isApprovePending={actions.isApprovePending}
        isRejectPending={actions.isRejectPending}
        isLeaveModalPending={actions.isLeavePending}
        isAddBackPending={actions.isAddBackPending}
        isRemoveMemberPending={actions.isRemoveMemberPending}
        onConfirmApprove={actions.confirmApprove}
        onConfirmReject={actions.confirmReject}
        onConfirmLeaveGroup={actions.confirmLeave}
        onConfirmCancelJoinRequest={actions.confirmWithdraw}
        onConfirmAddBackToChat={actions.confirmAddMemberToChat}
        onConfirmRemoveMember={actions.confirmRemoveMember}
      />

      {/* Join Group Modal */}
      <JoinGroupModal
        isOpen={isJoinModalOpen}
        onClose={() => {
          setIsJoinModalOpen(false);
          actions.resetJoinError?.();
        }}
        group={{
          id: group.matchingGroupId,
          title: group.groupName,
          leaderName: group.leaderName ?? group.ownerName,
          leaderAvatar: group.leaderAvatarUrl ?? group.ownerAvatarUrl ?? undefined,
          coverImageUrl: group.coverImageUrl ?? group.tourImageUrl ?? undefined,
          departureDate: group.targetDate,
          targetDate: group.targetDate,
          endDate: group.customJourneyEndDate,
          maxMembers: group.maxSize,
          currentMembers: group.currentSize,
        }}
        onSubmit={async (message) => {
          await actions.joinGroup(message, () => setIsJoinModalOpen(false));
        }}
        isPending={actions.isJoining}
        errorMessage={actions.joinError}
      />

      {/* Leader Edit Group Modal */}
      {actions.currentUserRole === 'leader' && (
        <EditMatchingGroupModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          group={group}
        />
      )}

      {/* SOS Alert Modal */}
      <GroupSOSModal
        groupId={group.matchingGroupId}
        isOpen={isSosModalOpen}
        onClose={() => setIsSosModalOpen(false)}
        leaderName={group.leaderName ?? group.ownerName}
      />

      {/* Leader Election Modal */}
      {actions.currentUserRole === 'leader' && (
        <OpenLeaderElectionModal
          groupId={group.matchingGroupId}
          isOpen={isElectionModalOpen}
          onClose={() => setIsElectionModalOpen(false)}
          members={group.members}
          onSuccess={() => setIsElectionModalOpen(false)}
        />
      )}

      {/* Dissolution Vote Modal */}
      {actions.currentUserRole === 'leader' && (
        <OpenDissolutionVoteModal
          groupId={group.matchingGroupId}
          isOpen={isDissolutionModalOpen}
          onClose={() => setIsDissolutionModalOpen(false)}
          onSuccess={() => setIsDissolutionModalOpen(false)}
        />
      )}
    </div>
  );
}
