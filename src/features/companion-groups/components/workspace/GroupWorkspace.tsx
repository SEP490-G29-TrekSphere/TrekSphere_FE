import { Siren, Star, Vote } from 'lucide-react';
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
import { GroupRulesTab } from '../detail/GroupRulesTab';
import { MemberAvatar } from '../detail/MemberAvatar';
import { MembersCard } from '../detail/MembersCard';
import { GroupFeedTab } from './feed/GroupFeedTab';
import { GroupJourneyTab } from './journey/GroupJourneyTab';
import { GroupMomentsTab } from './moments/GroupMomentsTab';
import { GroupPeerReviewsTab } from './reviews/GroupPeerReviewsTab';
import { GroupSosTab } from './sos/GroupSosTab';
import { SosLocationMap } from './sos/SosLocationMap';
import { GroupVotesTab } from './votes/GroupVotesTab';
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

  const descriptionText =
    group.description ||
    group.tourDescription ||
    group.customJourneyDescription ||
    'Chưa có mô tả chi tiết cho chuyến đi này.';

  const acceptedMembers = group.members.filter((member) => member.status === 'ACCEPTED');

  return (
    <div className="space-y-6">
      {/* STICKY BANNER: TÍN HIỆU SOS ĐANG MỞ (hiển thị ở mọi tab, ưu tiên trên cùng) */}
      {activeSosAlerts.length > 0 && (
        <div className="rounded-2xl border-2 border-destructive/60 bg-destructive/5 p-4 space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-destructive font-extrabold text-xs uppercase">
            <Siren className="h-4 w-4 animate-pulse" />
            <span>
              {activeSosAlerts.length} tín hiệu SOS đang mở trong nhóm — cần hỗ trợ khẩn cấp!
            </span>
          </div>
          <div className="space-y-1.5">
            {activeSosAlerts.map((alert) => (
              <div
                key={alert.sosAlertId}
                className="flex items-center justify-between gap-2 rounded-xl bg-background/80 px-3 py-2 text-xs"
              >
                <span className="font-bold text-foreground">
                  {alert.senderName} • {new Date(alert.createdAt).toLocaleTimeString('vi-VN')}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('sos')}
                  className="shrink-0 rounded-full border border-destructive/40 px-2.5 py-1 text-[11px] font-bold text-destructive hover:bg-destructive/10 transition cursor-pointer"
                >
                  Xem chi tiết
                </button>
              </div>
            ))}
          </div>
          <SosLocationMap alerts={activeSosAlerts} heightClassName="h-[200px]" />
        </div>
      )}

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
                  onClick={() => setActiveTab('votes')}
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
          <AppButton size="sm" onClick={() => setActiveTab('reviews')} className="shrink-0">
            Bắt đầu đánh giá
          </AppButton>
        </div>
      )}

      <WorkspaceTabsNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isLeader={isLeader}
        badges={{
          reviews:
            isTripEnded && unreviewedCount > 0
              ? { value: unreviewedCount, tone: 'warning' }
              : undefined,
          requests: { value: pendingJoinRequestsCount, tone: 'danger' },
          members: { value: acceptedMembers.length, tone: 'muted' },
          sos:
            activeSosAlerts.length > 0
              ? { value: activeSosAlerts.length, tone: 'danger' }
              : undefined,
          votes:
            openGovernanceVotes.length > 0
              ? { value: openGovernanceVotes.length, tone: 'warning' }
              : undefined,
        }}
      />

      {activeTab === 'overview' && (
        <div className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-xs">
          <div className="flex flex-col justify-between gap-4 border-border border-b pb-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3.5">
              <MemberAvatar
                fullName={group.ownerName}
                avatarUrl={group.ownerAvatarUrl ?? undefined}
                size="lg"
                isLeader
              />
              <div>
                <h3 className="font-extrabold text-base text-foreground">{group.ownerName}</h3>
                <p className="text-muted-foreground text-xs">Trưởng nhóm khởi xướng chuyến đi</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-1.5 font-bold text-muted-foreground text-xs uppercase tracking-wider">
              Mô tả chuyến đi
            </h4>
            <p className="whitespace-pre-line text-muted-foreground text-xs leading-relaxed">
              {descriptionText}
            </p>
          </div>
        </div>
      )}

      {activeTab === 'feed' && (
        <GroupFeedTab
          groupId={group.matchingGroupId}
          isLeader={isLeader}
          currentUserId={currentUserId}
        />
      )}

      {activeTab === 'itinerary' && (
        <GroupJourneyTab groupId={group.matchingGroupId} isLeader={isLeader} />
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
        <MembersCard
          members={group.members}
          maxSize={group.maxSize}
          ownerName={group.ownerName}
          currentUserId={currentUserId}
          role={role}
          hasConversation={group.hasConversation}
          onDirectChat={onDirectChat}
          onAddMemberToChat={onAddMemberToChat}
          onRemoveMember={onRemoveMember}
        />
      )}

      {activeTab === 'reviews' && (
        <GroupPeerReviewsTab groupId={group.matchingGroupId} isTripEnded={isTripEnded} />
      )}

      {activeTab === 'requests' && isLeader && <div className="space-y-6">{joinRequestsSlot}</div>}

      {activeTab === 'budget' && (
        <GroupBudgetTab group={group} isLeader={isLeader} currentUserId={currentUserId} />
      )}

      {activeTab === 'rules' && <GroupRulesTab group={group} />}

      {activeTab === 'sos' && (
        <GroupSosTab
          groupId={group.matchingGroupId}
          currentUserId={currentUserId}
          isLeader={isLeader}
        />
      )}

      {activeTab === 'votes' && (
        <GroupVotesTab
          groupId={group.matchingGroupId}
          currentUserId={currentUserId}
          isLeader={isLeader}
          members={group.members}
        />
      )}

      {activeTab === 'management' && isLeader && managementSlot}
    </div>
  );
}
