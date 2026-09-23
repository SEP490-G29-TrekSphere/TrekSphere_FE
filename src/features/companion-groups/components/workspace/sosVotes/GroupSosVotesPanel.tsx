import { Siren, Vote } from 'lucide-react';
import type { MatchingMemberItem } from '../../../types/matchingGroup';
import { GroupSosTab } from '../sos/GroupSosTab';
import { GroupVotesTab } from '../votes/GroupVotesTab';
import { WorkspaceSubTabsNav } from '../WorkspaceSubTabsNav';

export type SosVotesSubTabKey = 'sos' | 'votes';

type Badge = { value: number; tone: 'warning' | 'danger' | 'muted' } | undefined;

interface GroupSosVotesPanelProps {
  activeSubTab: SosVotesSubTabKey;
  onSubTabChange: (tab: SosVotesSubTabKey) => void;
  groupId: string;
  currentUserId?: string;
  isLeader: boolean;
  members: MatchingMemberItem[];
  sosBadge?: Badge;
  votesBadge?: Badge;
}

export function GroupSosVotesPanel({
  activeSubTab,
  onSubTabChange,
  groupId,
  currentUserId,
  isLeader,
  members,
  sosBadge,
  votesBadge,
}: GroupSosVotesPanelProps) {
  return (
    <div className="space-y-4">
      <WorkspaceSubTabsNav<SosVotesSubTabKey>
        activeTab={activeSubTab}
        onTabChange={onSubTabChange}
        tabs={[
          { id: 'sos', label: 'SOS', icon: Siren },
          { id: 'votes', label: 'Bình chọn', icon: Vote },
        ]}
        badges={{ sos: sosBadge, votes: votesBadge }}
      />

      {activeSubTab === 'sos' && (
        <GroupSosTab groupId={groupId} currentUserId={currentUserId} isLeader={isLeader} />
      )}

      {activeSubTab === 'votes' && (
        <GroupVotesTab
          groupId={groupId}
          currentUserId={currentUserId}
          isLeader={isLeader}
          members={members}
        />
      )}
    </div>
  );
}
