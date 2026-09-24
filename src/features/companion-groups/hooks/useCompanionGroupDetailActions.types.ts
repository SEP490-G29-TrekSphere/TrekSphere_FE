import type { JoinRequestAction } from '../components/detail/JoinRequestsCard';
import type { MatchingGroupDetailResponse } from '../types/matchingGroup';

export type ActiveGroupModal =
  | 'leave'
  | 'reject'
  | 'approve'
  | 'addBackToChat'
  | 'removeMember'
  | 'withdraw'
  | null;

export type { JoinRequestAction };

export interface UseCompanionGroupDetailActionsOptions {
  groupId?: string;
  group?: MatchingGroupDetailResponse;
  currentUserId?: string;
  chatPath: string;
  backPath: string;
}

export { resolveGroupUserRole } from '../mappers/matchingGroup';
