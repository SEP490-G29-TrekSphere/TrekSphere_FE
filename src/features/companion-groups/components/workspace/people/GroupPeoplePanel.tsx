import { Star, UserCheck, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import type { MatchingGroupStatus, MatchingMemberItem } from '../../../types/matchingGroup';
import { MembersCard } from '../../detail/MembersCard';
import { GroupPeerReviewsTab } from '../reviews/GroupPeerReviewsTab';
import { WorkspaceSubTabsNav } from '../WorkspaceSubTabsNav';

export type PeopleSubTabKey = 'list' | 'requests' | 'reviews';

type Badge = { value: number; tone: 'warning' | 'danger' | 'muted' } | undefined;

interface GroupPeoplePanelProps {
  activeSubTab: PeopleSubTabKey;
  onSubTabChange: (tab: PeopleSubTabKey) => void;
  isLeader: boolean;
  members: MatchingMemberItem[];
  maxSize: number;
  ownerName: string;
  currentUserId?: string;
  role?: string;
  hasConversation?: boolean;
  onDirectChat: (memberId: string, memberName: string, memberAvatar?: string) => void;
  onAddMemberToChat: (memberId: string, memberName: string) => void;
  onRemoveMember: (memberId: string, memberName: string) => void;
  joinRequestsSlot?: ReactNode;
  groupId: string;
  isTripEnded: boolean;
  groupStatus?: MatchingGroupStatus;
  membersBadge?: Badge;
  requestsBadge?: Badge;
  reviewsBadge?: Badge;
}

/** Gộp "Thành viên" + "Duyệt yêu cầu" + "Đánh giá" thành 1 tab có sub-tab bên trong. */
export function GroupPeoplePanel({
  activeSubTab,
  onSubTabChange,
  isLeader,
  members,
  maxSize,
  ownerName,
  currentUserId,
  role,
  hasConversation,
  onDirectChat,
  onAddMemberToChat,
  onRemoveMember,
  joinRequestsSlot,
  groupId,
  isTripEnded,
  groupStatus,
  membersBadge,
  requestsBadge,
  reviewsBadge,
}: GroupPeoplePanelProps) {
  const isCancelled = groupStatus === 'CANCELLED';

  return (
    <div className="space-y-4">
      <WorkspaceSubTabsNav<PeopleSubTabKey>
        activeTab={activeSubTab}
        onTabChange={onSubTabChange}
        tabs={[
          { id: 'list', label: 'Danh sách', icon: Users },
          {
            id: 'requests',
            label: 'Duyệt yêu cầu',
            icon: UserCheck,
            hidden: !isLeader || isCancelled,
          },
          { id: 'reviews', label: 'Đánh giá', icon: Star },
        ]}
        badges={{ list: membersBadge, requests: requestsBadge, reviews: reviewsBadge }}
      />

      {activeSubTab === 'list' && (
        <MembersCard
          members={members}
          maxSize={maxSize}
          ownerName={ownerName}
          currentUserId={currentUserId}
          role={role}
          hasConversation={hasConversation}
          groupStatus={groupStatus}
          onDirectChat={onDirectChat}
          onAddMemberToChat={onAddMemberToChat}
          onRemoveMember={onRemoveMember}
        />
      )}

      {activeSubTab === 'requests' && isLeader && (
        <div className="space-y-6">{joinRequestsSlot}</div>
      )}

      {activeSubTab === 'reviews' && (
        <GroupPeerReviewsTab groupId={groupId} isTripEnded={isTripEnded} />
      )}
    </div>
  );
}
