import { resolveCurrentLeaderMember } from '../../../mappers/matchingGroup';
import type { MatchingGroupDetailResponse } from '../../../types/matchingGroup';
import type { SosAlertResponse } from '../../../types/sos';
import { CheckpointProgressWidget } from './CheckpointProgressWidget';
import { LeaderCard } from './LeaderCard';
import { LeaderPostsWidget } from './LeaderPostsWidget';
import { SosStatusWidget } from './SosStatusWidget';

interface GroupOverviewTabProps {
  group: MatchingGroupDetailResponse;
  isLeader: boolean;
  currentUserId?: string;
  activeSosAlerts: SosAlertResponse[];
  onViewFullFeed: () => void;
  onViewSosDetail: () => void;
}

/** Tab "Tổng quan" — thông tin chủ nhóm, tiến độ hành trình, bài đăng của leader, trạng thái SOS. */
export function GroupOverviewTab({
  group,
  isLeader,
  currentUserId,
  activeSosAlerts,
  onViewFullFeed,
  onViewSosDetail,
}: GroupOverviewTabProps) {
  const isTripInProgress = group.status === 'IN_PROGRESS';
  const currentLeader = resolveCurrentLeaderMember(group);

  return (
    <div className="space-y-4">
      <LeaderCard
        ownerName={currentLeader?.fullName ?? group.leaderName ?? group.ownerName}
        ownerAvatarUrl={currentLeader?.avatarUrl ?? group.leaderAvatarUrl ?? group.ownerAvatarUrl}
        groupDescription={group.description}
        journeyDescription={group.tourDescription || group.customJourneyDescription}
      />

      <SosStatusWidget activeSosAlerts={activeSosAlerts} onViewSosDetail={onViewSosDetail} />

      <CheckpointProgressWidget
        groupId={group.matchingGroupId}
        isLeader={isLeader}
        isTripInProgress={isTripInProgress}
      />

      <LeaderPostsWidget
        groupId={group.matchingGroupId}
        isLeader={isLeader}
        currentUserId={currentUserId}
        onViewFullFeed={onViewFullFeed}
      />
    </div>
  );
}
