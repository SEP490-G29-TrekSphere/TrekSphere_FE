import {
  FileText,
  Layers,
  MessageSquare,
  Radio,
  ShieldCheck,
  UserCheck,
  Users,
  Wallet,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { UserRoleInGroup } from '../../types';
import type { MatchingGroupDetailResponse } from '../../types/matchingGroup';
import { GroupBudgetTab } from '../detail/GroupBudgetTab';
import { GroupRulesTab } from '../detail/GroupRulesTab';
import { MemberAvatar } from '../detail/MemberAvatar';
import { MembersCard } from '../detail/MembersCard';
import { GroupFeedTab } from './feed/GroupFeedTab';
import { GroupJourneyTab } from './journey/GroupJourneyTab';

export type WorkspaceTabKey =
  | 'overview'
  | 'feed'
  | 'itinerary'
  | 'members'
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
  { id: 'members', label: 'Thành viên', icon: Users },
  { id: 'requests', label: 'Duyệt yêu cầu', icon: UserCheck, leaderOnly: true },
  { id: 'budget', label: 'Dự toán chi phí', icon: Wallet },
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

  const descriptionText =
    group.description ||
    group.tourDescription ||
    group.customJourneyDescription ||
    'Chưa có mô tả chi tiết cho chuyến đi này.';

  return (
    <div className="space-y-6">
      {/* WORKSPACE SUB-NAV TABS */}
      <div className="scrollbar-none flex overflow-x-auto rounded-2xl border border-border bg-card p-1.5 shadow-xs">
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
              {tab.id === 'requests' && pendingJoinRequestsCount > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-black text-destructive-foreground">
                  {pendingJoinRequestsCount}
                </span>
              )}
              {tab.id === 'members' && (
                <span className="rounded-full bg-muted px-1.5 py-0.2 text-[10px] font-bold text-muted-foreground">
                  {group.members.filter((m) => m.status === 'ACCEPTED').length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
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

      {/* TAB 3: JOIN REQUESTS REVIEW (LEADER ONLY) */}
      {activeTab === 'requests' && isLeader && <div className="space-y-6">{joinRequestsSlot}</div>}

      {/* TAB 4: ITINERARY */}
      {activeTab === 'itinerary' && (
        <GroupJourneyTab groupId={group.matchingGroupId} isLeader={isLeader} />
      )}

      {/* TAB 5: BUDGET */}
      {activeTab === 'budget' && <GroupBudgetTab group={group} />}

      {/* TAB 6: RULES */}
      {activeTab === 'rules' && <GroupRulesTab group={group} />}
    </div>
  );
}
