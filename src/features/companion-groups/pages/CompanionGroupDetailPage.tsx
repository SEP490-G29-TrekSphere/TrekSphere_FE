import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PATHS } from '@/constants/paths';
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
import { GroupRulesTab } from '../components/detail/GroupRulesTab';
import { JoinRequestsCard } from '../components/detail/JoinRequestsCard';
import { MATCHING_GROUP_APPLICATION_PAGE_SIZE } from '../constants';
import { useCompanionGroupDetailActions } from '../hooks/useCompanionGroupDetailActions';
import { useJoinRequests } from '../hooks/useJoinRequests';
import { useMatchingGroupDetail } from '../hooks/useMatchingGroupDetail';

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
  const { groupId } = useParams<{ groupId: string }>();
  const user = useAppStore((state) => state.user);
  const { data: group, isLoading, isError, error, refetch } = useMatchingGroupDetail(groupId);
  const isOwner = Boolean(user && group && String(group.ownerId) === String(user.id));
  const [activeTab, setActiveTab] = useState<GroupDetailTabKey>('overview');
  const [applicationPage, setApplicationPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const applications = useJoinRequests(isOwner ? groupId : undefined, {
    status: 'PENDING',
    page: applicationPage - 1,
    size: MATCHING_GROUP_APPLICATION_PAGE_SIZE,
  });

  const actions = useCompanionGroupDetailActions({
    groupId,
    group,
    currentUserId: user?.id?.toString(),
    backPath,
    chatPath,
  });

  const shellClassName = embedded
    ? 'text-foreground'
    : 'min-h-screen bg-background px-4 pt-24 pb-12 text-foreground md:px-10 lg:px-16';

  if (isLoading) {
    return (
      <div className={shellClassName}>
        <GroupDetailSkeleton embedded={embedded} />
      </div>
    );
  }

  if (isError || !group) {
    return (
      <GroupDetailErrorState
        embedded={embedded}
        message={
          error instanceof Error ? error.message : 'Nhóm ghép không tồn tại hoặc đã bị giải tán.'
        }
        onBack={() => navigate(backPath)}
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <div className={shellClassName}>
      {actions.feedback && (
        <div className="fade-in slide-in-from-top-4 fixed top-6 right-6 z-50 animate-in rounded-xl bg-primary px-6 py-3 font-semibold text-sm text-white shadow-lg">
          {actions.feedback}
        </div>
      )}

      <div className={`${embedded ? 'w-full' : 'mx-auto max-w-6xl'} space-y-7`}>
        {/* Hero Section */}
        <GroupDetailHero
          groupName={group.groupName}
          tourName={group.tourName}
          tourImageUrl={group.tourImageUrl}
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
            <GroupDetailTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              checkpointCount={group.checkpoints?.length}
              costItemCount={group.costItems?.length}
            />

            {/* Tab Panels */}
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

            {activeTab === 'budget' && <GroupBudgetTab group={group} />}

            {activeTab === 'rules' && <GroupRulesTab group={group} />}

            {/* Leader Incoming Join Requests Review Section */}
            {actions.currentUserRole === 'leader' && (
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
            )}
          </div>

          {/* Right Action Column */}
          <div className="lg:col-span-4">
            <GroupActionPanel
              role={actions.currentUserRole}
              groupStatus={group.status}
              isJoining={actions.isJoining}
              onOpenChat={actions.openGroupChat}
              onJoin={actions.joinGroup}
              onLeave={() => actions.setActiveModal('leave')}
              onCancelRequest={() => actions.setActiveModal('leave')}
              onCreateGroupChat={actions.openGroupChat}
              onEditGroup={() => setIsEditModalOpen(true)}
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
        currentUserRole={actions.currentUserRole}
        isApprovePending={actions.isApprovePending}
        isRejectPending={actions.isRejectPending}
        isLeaveModalPending={actions.isLeavePending}
        isAddBackPending={actions.isAddBackPending}
        onConfirmApprove={actions.confirmApprove}
        onConfirmReject={actions.confirmReject}
        onConfirmLeaveGroup={actions.confirmLeave}
        onConfirmCancelJoinRequest={actions.confirmWithdraw}
        onConfirmAddBackToChat={actions.confirmAddMemberToChat}
      />

      {/* Leader Edit Group Modal */}
      {actions.currentUserRole === 'leader' && (
        <EditMatchingGroupModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          group={group}
        />
      )}
    </div>
  );
}
