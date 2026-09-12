import {
  Camera,
  CheckCircle2,
  FileText,
  Layers,
  MessageSquare,
  Radio,
  ShieldCheck,
  Star,
  UserCheck,
  Users,
  Wallet,
} from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';
import { AppButton, AppScrollableTabs } from '@/shared/ui';
import { usePeerReviewCandidates, useSubmitPeerReview } from '../../hooks/useGroupPeerReviews';
import type { PeerReviewCandidate } from '../../services/peerReviewService';
import type { UserRoleInGroup } from '../../types';
import type { MatchingGroupDetailResponse } from '../../types/matchingGroup';
import { GroupBudgetTab } from '../detail/GroupBudgetTab';
import { GroupRulesTab } from '../detail/GroupRulesTab';
import { MemberAvatar } from '../detail/MemberAvatar';
import { MembersCard } from '../detail/MembersCard';
import { GroupFeedTab } from './feed/GroupFeedTab';
import { GroupJourneyTab } from './journey/GroupJourneyTab';
import { GroupMomentsTab } from './moments/GroupMomentsTab';
import { GroupPeerReviewModal } from './reviews/GroupPeerReviewModal';
import { GroupPeerReviewsTab } from './reviews/GroupPeerReviewsTab';

export type WorkspaceTabKey =
  | 'overview'
  | 'feed'
  | 'itinerary'
  | 'moments'
  | 'members'
  | 'reviews'
  | 'requests'
  | 'budget'
  | 'rules';

interface GroupWorkspaceProps {
  group: MatchingGroupDetailResponse;
  currentUserId?: string;
  isLeader: boolean;
  role: UserRoleInGroup;
  pendingJoinRequestsCount?: number;
  joinRequestsSlot?: ReactNode;
  onDirectChat: (memberId: string, memberName: string, memberAvatar?: string) => void;
  onAddMemberToChat: (memberId: string, memberName: string) => void;
}

const TABS: { id: WorkspaceTabKey; label: string; icon: typeof Layers; leaderOnly?: boolean }[] = [
  { id: 'overview', label: 'Tổng quan', icon: Radio },
  { id: 'feed', label: 'Bảng tin & Thảo luận', icon: MessageSquare },
  { id: 'itinerary', label: 'Lộ trình', icon: Layers },
  { id: 'moments', label: 'Khoảnh khắc & Album', icon: Camera },
  { id: 'members', label: 'Thành viên', icon: Users },
  { id: 'reviews', label: 'Đánh giá', icon: Star },
  { id: 'requests', label: 'Duyệt yêu cầu', icon: UserCheck, leaderOnly: true },
  { id: 'budget', label: 'Dự toán & Chi phí', icon: Wallet },
  { id: 'rules', label: 'Quy định nhóm', icon: FileText },
];

export function GroupWorkspace({
  group,
  currentUserId,
  isLeader,
  role,
  pendingJoinRequestsCount = 0,
  joinRequestsSlot,
  onDirectChat,
  onAddMemberToChat,
}: GroupWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<WorkspaceTabKey>('overview');
  const [selectedCandidate, setSelectedCandidate] = useState<PeerReviewCandidate | null>(null);

  const isTripEnded = group.status === 'COMPLETED';
  const { data: candidates = [] } = usePeerReviewCandidates(group.matchingGroupId, isTripEnded);
  const submitReviewMutation = useSubmitPeerReview(group.matchingGroupId);

  const unreviewedCount = candidates.filter((c) => !c.isReviewed).length;

  const handleOpenReviewModal = (candidate?: PeerReviewCandidate) => {
    if (candidate) {
      setSelectedCandidate(candidate);
    } else {
      const firstUnreviewed = candidates.find((c) => !c.isReviewed) || candidates[0];
      if (firstUnreviewed) {
        setSelectedCandidate(firstUnreviewed);
      }
    }
  };

  const descriptionText =
    group.description ||
    group.tourDescription ||
    group.customJourneyDescription ||
    'Chưa có mô tả chi tiết cho chuyến đi này.';

  const acceptedMembers = group.members.filter((m) => m.status === 'ACCEPTED');

  return (
    <div className="space-y-6">
      {/* POST-TRIP PEER REVIEW PROMPT BANNER */}
      {isTripEnded && candidates.length > 0 && unreviewedCount > 0 && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-500/20 p-2 text-amber-600 dark:text-amber-400">
              <Star className="h-5 w-5 fill-current" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">
                Chuyến đi đã hoàn thành! Hãy đánh giá các bạn đồng hành
              </h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">
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

      {/* WORKSPACE SUB-NAV TABS */}
      <AppScrollableTabs>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          if (tab.leaderOnly && !isLeader) return null;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition cursor-pointer',
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {tab.id === 'reviews' && isTripEnded && unreviewedCount > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-black text-white">
                  {unreviewedCount}
                </span>
              )}
              {tab.id === 'requests' && pendingJoinRequestsCount > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-black text-destructive-foreground">
                  {pendingJoinRequestsCount}
                </span>
              )}
              {tab.id === 'members' && (
                <span className="rounded-full bg-muted px-1.5 py-0.2 text-[10px] font-bold text-muted-foreground">
                  {acceptedMembers.length}
                </span>
              )}
            </button>
          );
        })}
      </AppScrollableTabs>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Completed Trip Peer Review Summary Card */}
          {isTripEnded && candidates.length > 0 && (
            <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                  <h4 className="text-sm font-bold text-foreground">
                    Đánh giá bạn đồng hành (Peer Review)
                  </h4>
                </div>
                <span className="text-xs text-muted-foreground">
                  Đã hoàn tất {candidates.length - unreviewedCount}/{candidates.length}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {candidates.map((c) => (
                  <div
                    key={c.matchingMemberId}
                    className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-border bg-muted/20"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {c.avatarUrl ? (
                        <img
                          src={c.avatarUrl}
                          alt={c.fullName}
                          className="h-8 w-8 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                          {c.fullName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">{c.fullName}</p>
                        <p className="text-[10px] text-muted-foreground">{c.roleLabel}</p>
                      </div>
                    </div>

                    {c.isReviewed ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Đã chấm
                      </span>
                    ) : (
                      <AppButton
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenReviewModal(c)}
                        className="text-[11px] h-7 px-2.5 shrink-0"
                      >
                        Đánh giá
                      </AppButton>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Leader Profile Card */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
              <div className="flex items-center gap-3.5">
                <MemberAvatar
                  fullName={group.ownerName}
                  avatarUrl={group.ownerAvatarUrl ?? undefined}
                  size="lg"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-foreground">{group.ownerName}</h3>
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary border border-primary/20">
                      <ShieldCheck className="h-3 w-3" /> Trưởng nhóm
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Trưởng nhóm khởi xướng (Group Leader)
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Mô tả chuyến đi
              </h4>
              <p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-line">
                {descriptionText}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB: FEED & DISCUSSION */}
      {activeTab === 'feed' && (
        <GroupFeedTab
          groupId={group.matchingGroupId}
          isLeader={isLeader}
          currentUserId={currentUserId}
        />
      )}

      {/* TAB: ITINERARY */}
      {activeTab === 'itinerary' && (
        <GroupJourneyTab groupId={group.matchingGroupId} isLeader={isLeader} />
      )}

      {/* TAB: MOMENTS & ALBUMS */}
      {activeTab === 'moments' && (
        <GroupMomentsTab
          groupId={group.matchingGroupId}
          isLeader={isLeader}
          currentUserId={currentUserId}
        />
      )}

      {/* TAB: MEMBERS */}
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
        />
      )}

      {/* TAB: PEER REVIEWS */}
      {activeTab === 'reviews' && (
        <GroupPeerReviewsTab groupId={group.matchingGroupId} isTripEnded={isTripEnded} />
      )}

      {/* TAB: JOIN REQUESTS REVIEW (LEADER ONLY) */}
      {activeTab === 'requests' && isLeader && <div className="space-y-6">{joinRequestsSlot}</div>}

      {/* TAB: BUDGET */}
      {activeTab === 'budget' && (
        <GroupBudgetTab group={group} isLeader={isLeader} currentUserId={currentUserId} />
      )}

      {/* TAB: RULES */}
      {activeTab === 'rules' && <GroupRulesTab group={group} />}

      {/* PEER REVIEW MODAL */}
      {selectedCandidate && (
        <GroupPeerReviewModal
          open={Boolean(selectedCandidate)}
          candidate={selectedCandidate}
          allCandidates={candidates}
          onClose={() => setSelectedCandidate(null)}
          onSelectCandidate={(c) => setSelectedCandidate(c)}
          onSubmit={(payload) => {
            submitReviewMutation.mutate(payload);
          }}
          isSubmitting={submitReviewMutation.isPending}
        />
      )}
    </div>
  );
}
