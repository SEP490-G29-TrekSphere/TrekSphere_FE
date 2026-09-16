import { Star, Vote } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { AppButton } from '@/shared/ui';
import { useActiveSosAlerts } from '../../hooks/sos/useActiveSosAlerts';
import { useSosSocket } from '../../hooks/sos/useSosSocket';
import { usePeerReviewCandidates } from '../../hooks/useGroupPeerReviews';
import { useGroupVotes } from '../../hooks/vote/useGroupVotes';
import { useVoteSocket } from '../../hooks/vote/useVoteSocket';
import type { UserRoleInGroup } from '../../types';
import type { MatchingGroupDetailResponse } from '../../types/matchingGroup';
import { GroupBudgetTab } from '../detail/GroupBudgetTab';
import { GroupChecklistTab } from './checklist/GroupChecklistTab';
import { GroupFeedTab } from './feed/GroupFeedTab';
import { GroupJourneyTab } from './journey/GroupJourneyTab';
import { GroupMomentsTab } from './moments/GroupMomentsTab';
import { GroupOverviewTab } from './overview/GroupOverviewTab';
import { GroupPeoplePanel, type PeopleSubTabKey } from './people/GroupPeoplePanel';
import { GroupSosVotesPanel, type SosVotesSubTabKey } from './sosVotes/GroupSosVotesPanel';
import { type WorkspaceTabKey, WorkspaceTabsNav } from './WorkspaceTabsNav';

export type { WorkspaceTabKey };

interface GroupWorkspaceProps {
  group: MatchingGroupDetailResponse;
  currentUserId?: string;
  isLeader: boolean;
  role: UserRoleInGroup;
  pendingJoinRequestsCount?: number;
  joinRequestsSlot?: ReactNode;
  /** Bảng quản lý vòng đời nhóm — chỉ Trưởng nhóm mới thấy tab này. */
  managementSlot?: ReactNode;
  onDirectChat: (memberId: string, memberName: string, memberAvatar?: string) => void;
  onAddMemberToChat: (memberId: string, memberName: string) => void;
  onRemoveMember: (memberId: string, memberName: string) => void;
}

/** Khu làm việc của nhóm ghép dành cho thành viên & trưởng nhóm. */
export function GroupWorkspace({
  group,
  currentUserId,
  isLeader,
  role,
  pendingJoinRequestsCount = 0,
  joinRequestsSlot,
  managementSlot,
  onDirectChat,
  onAddMemberToChat,
  onRemoveMember,
}: GroupWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<WorkspaceTabKey>('overview');
  const [activePeopleSubTab, setActivePeopleSubTab] = useState<PeopleSubTabKey>('list');
  const [activeSosVotesSubTab, setActiveSosVotesSubTab] = useState<SosVotesSubTabKey>('sos');

  useSosSocket(group.matchingGroupId);
  const { data: activeSosAlerts = [] } = useActiveSosAlerts(group.matchingGroupId);

  useVoteSocket(group.matchingGroupId);
  const { data: openVotesPage } = useGroupVotes(group.matchingGroupId, {
    status: 'OPEN',
    size: 50,
  });
  const openGovernanceVotes = (openVotesPage?.content ?? []).filter(
    (vote) => vote.voteType !== 'OTHER'
  );

  const isTripEnded = group.status === 'COMPLETED';
  const { data: candidates = [] } = usePeerReviewCandidates(group.matchingGroupId, isTripEnded);
  const unreviewedCount = candidates.filter((candidate) => !candidate.isReviewed).length;

  const acceptedMembers = group.members.filter((member) => member.status === 'ACCEPTED');

  type Badge = { value: number; tone: 'warning' | 'danger' | 'muted' } | undefined;
  function pickBadge(...badges: Badge[]): Badge {
    return badges.find((b) => b && b.value > 0);
  }

  const requestsBadge: Badge = { value: pendingJoinRequestsCount, tone: 'danger' };
  const reviewsBadge: Badge =
    isTripEnded && unreviewedCount > 0 ? { value: unreviewedCount, tone: 'warning' } : undefined;
  const membersBadge: Badge = { value: acceptedMembers.length, tone: 'muted' };
  const sosBadge: Badge =
    activeSosAlerts.length > 0 ? { value: activeSosAlerts.length, tone: 'danger' } : undefined;
  const votesBadge: Badge =
    openGovernanceVotes.length > 0
      ? { value: openGovernanceVotes.length, tone: 'warning' }
      : undefined;

  const peopleBadge = pickBadge(requestsBadge, reviewsBadge, membersBadge);
  const sosVotesBadge = pickBadge(sosBadge, votesBadge);

  return (
    <div className="space-y-6">
      {/* STICKY BANNER: BIỂU QUYẾT QUAN TRỌNG ĐANG MỞ (bầu Trưởng nhóm / giải tán nhóm) */}
      {openGovernanceVotes.length > 0 && (
        <div className="rounded-2xl border-2 border-amber-500/60 bg-amber-500/5 p-4 space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-extrabold text-xs uppercase">
            <Vote className="h-4 w-4" />
            <span>
              {openGovernanceVotes.length} biểu quyết quan trọng đang mở — cần bạn bỏ phiếu
            </span>
          </div>
          <div className="space-y-1.5">
            {openGovernanceVotes.map((vote) => (
              <div
                key={vote.groupVoteId}
                className="flex items-center justify-between gap-2 rounded-xl bg-background/80 px-3 py-2 text-xs"
              >
                <span className="font-bold text-foreground">{vote.title}</span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('sosVotes');
                    setActiveSosVotesSubTab('votes');
                  }}
                  className="shrink-0 rounded-full border border-amber-500/40 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 transition cursor-pointer"
                >
                  Xem & bỏ phiếu
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {isTripEnded && unreviewedCount > 0 && (
        <div className="flex flex-col justify-between gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-500/20 p-2 text-amber-600 dark:text-amber-400">
              <Star className="h-5 w-5 fill-current" />
            </div>
            <div>
              <h4 className="font-bold text-foreground text-xs">
                Chuyến đi đã hoàn thành! Hãy đánh giá các bạn đồng hành
              </h4>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Bạn còn {unreviewedCount} thành viên chưa đánh giá. Đánh giá khách quan giúp xây
                dựng điểm uy tín (Trust Score) cộng đồng.
              </p>
            </div>
          </div>
          <AppButton
            size="sm"
            onClick={() => {
              setActiveTab('members');
              setActivePeopleSubTab('reviews');
            }}
            className="shrink-0"
          >
            Bắt đầu đánh giá
          </AppButton>
        </div>
      )}

      <WorkspaceTabsNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isLeader={isLeader}
        badges={{
          members: peopleBadge,
          sosVotes: sosVotesBadge,
        }}
      />

      {activeTab === 'overview' && (
        <GroupOverviewTab
          group={group}
          isLeader={isLeader}
          currentUserId={currentUserId}
          activeSosAlerts={activeSosAlerts}
          onViewFullFeed={() => setActiveTab('feed')}
          onViewSosDetail={() => {
            setActiveTab('sosVotes');
            setActiveSosVotesSubTab('sos');
          }}
        />
      )}

      {activeTab === 'feed' && (
        <GroupFeedTab
          groupId={group.matchingGroupId}
          isLeader={isLeader}
          currentUserId={currentUserId}
        />
      )}

      {activeTab === 'itinerary' && (
        <GroupJourneyTab
          groupId={group.matchingGroupId}
          isLeader={isLeader}
          groupStatus={group.status}
        />
      )}

      {activeTab === 'checklist' && (
        <GroupChecklistTab
          groupId={group.matchingGroupId}
          isLeader={isLeader}
          currentUserId={currentUserId}
          members={group.members}
        />
      )}

      {activeTab === 'moments' && (
        <GroupMomentsTab
          groupId={group.matchingGroupId}
          isLeader={isLeader}
          currentUserId={currentUserId}
          groupStatus={group.status}
        />
      )}

      {activeTab === 'members' && (
        <GroupPeoplePanel
          activeSubTab={activePeopleSubTab}
          onSubTabChange={setActivePeopleSubTab}
          isLeader={isLeader}
          members={group.members}
          maxSize={group.maxSize}
          ownerName={group.ownerName}
          currentUserId={currentUserId}
          role={role}
          hasConversation={group.hasConversation}
          onDirectChat={onDirectChat}
          onAddMemberToChat={onAddMemberToChat}
          onRemoveMember={onRemoveMember}
          joinRequestsSlot={joinRequestsSlot}
          groupId={group.matchingGroupId}
          isTripEnded={isTripEnded}
          membersBadge={membersBadge}
          requestsBadge={requestsBadge}
          reviewsBadge={reviewsBadge}
        />
      )}

      {activeTab === 'budget' && (
        <GroupBudgetTab group={group} isLeader={isLeader} currentUserId={currentUserId} />
      )}

      {activeTab === 'sosVotes' && (
        <GroupSosVotesPanel
          activeSubTab={activeSosVotesSubTab}
          onSubTabChange={setActiveSosVotesSubTab}
          groupId={group.matchingGroupId}
          currentUserId={currentUserId}
          isLeader={isLeader}
          members={group.members}
          sosBadge={sosBadge}
          votesBadge={votesBadge}
        />
      )}

      {activeTab === 'management' && isLeader && managementSlot}
    </div>
  );
}
