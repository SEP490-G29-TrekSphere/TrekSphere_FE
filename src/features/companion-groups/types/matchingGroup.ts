export type MatchingGroupSourceType = 'TOUR' | 'CUSTOM_JOURNEY';

export type JourneyDifficulty = 'EASY' | 'MODERATE' | 'HARD' | 'EXTREME';

export type MatchingGroupStatus =
  | 'OPEN'
  | 'FULL'
  | 'CLOSED'
  | 'HIDDEN'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export type MatchingMemberRole = 'LEADER' | 'MEMBER';

export type MatchingMemberStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'WITHDRAWN'
  | 'LEFT'
  | 'REMOVED';

export type JoinApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';

export interface CustomJourneyInput {
  title: string;
  description?: string;
  difficulty: JourneyDifficulty;
  startDate: string;
  endDate: string;
}

interface MatchingGroupCreateBase {
  groupName: string;
  description?: string;
  maxSize: number;
  targetDate: string;
  matchingDeadline: string;
  scheduledStartAt: string;
}

export type MatchingGroupCreateRequest = MatchingGroupCreateBase &
  (
    | {
        sourceType: 'TOUR';
        tourId: string;
        customJourney?: never;
      }
    | {
        sourceType: 'CUSTOM_JOURNEY';
        tourId?: never;
        customJourney: CustomJourneyInput;
      }
  );

export interface MatchingGroupUpdateRequest {
  groupName?: string;
  description?: string;
  maxSize?: number;
  targetDate?: string;
  matchingDeadline?: string;
  customJourney?: Partial<CustomJourneyInput>;
}

export interface MatchingGroupItem {
  matchingGroupId: string;
  sourceType: MatchingGroupSourceType;
  tourId: string | null;
  tourName: string | null;
  customJourneyId: string | null;
  customJourneyTitle: string | null;
  difficulty: JourneyDifficulty | null;
  location: string | null;
  estimatedCost: number | null;
  isOwner?: boolean | null;
  myRole?: MatchingMemberRole | null;
  ownerId: string;
  ownerName: string;
  ownerAvatarUrl: string | null;
  tourImageUrl?: string | null;
  groupName: string;
  description: string | null;
  maxSize: number;
  currentSize: number;
  targetDate: string;
  matchingDeadline: string;
  status: MatchingGroupStatus;
  createdAt: string;
}

export interface CustomJourneyCheckpoint {
  customJourneyCheckpointId: string;
  dayNo: number | null;
  checkpointOrder: number;
  title: string;
  description: string | null;
  locationName: string | null;
  latitude: number | null;
  longitude: number | null;
  plannedStartAt: string | null;
  plannedEndAt: string | null;
  imageUrl: string | null;
}

export type CostItemCategory = 'PERMIT' | 'GUIDE' | 'FOOD' | 'TRANSPORT' | 'GEAR' | 'OTHER';

export interface CustomJourneyCostItem {
  customJourneyCostItemId: string;
  itemName: string;
  category: CostItemCategory;
  estimatedAmount: number;
  note: string | null;
}

export interface MatchingMemberItem {
  matchingMemberId: string | null;
  applicationId: string | null;
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  role: MatchingMemberRole;
  status: MatchingMemberStatus;
  message: string | null;
  rejectReason: string | null;
  createdAt: string;
  reviewedAt: string | null;
  withdrawnAt: string | null;
  joinedAt: string | null;
  leftAt: string | null;
  isInConversation: boolean | null;
}

export interface MatchingGroupDetailResponse extends MatchingGroupItem {
  tourDescription: string | null;
  tourLocation: string | null;
  customJourneyDescription: string | null;
  customJourneyStartDate: string | null;
  customJourneyEndDate: string | null;
  isLocked: boolean | null;
  checkpoints: CustomJourneyCheckpoint[];
  costItems: CustomJourneyCostItem[];
  members: MatchingMemberItem[];
  isOwner: boolean;
  myMembershipStatus: MatchingMemberStatus | null;
  canJoin: boolean;
  canLeave: boolean;
  hasConversation: boolean;
  isInConversation: boolean;
}

export interface MyMatchingJoinRequestItem {
  applicationId: string;
  matchingMemberId: string | null;
  matchingGroupId: string;
  groupName: string;
  groupStatus: MatchingGroupStatus;
  sourceType: MatchingGroupSourceType;
  tourId: string | null;
  tourName: string | null;
  customJourneyId: string | null;
  customJourneyTitle: string | null;
  difficulty: JourneyDifficulty | null;
  location: string | null;
  ownerId: string;
  ownerName: string;
  ownerAvatarUrl: string | null;
  currentSize: number;
  maxSize: number;
  targetDate: string;
  matchingDeadline: string;
  message: string | null;
  rejectReason: string | null;
  status: JoinApplicationStatus;
  createdAt: string;
  reviewedAt: string | null;
  updatedAt: string;
  withdrawnAt: string | null;
  canCancel: boolean;
  canWithdraw: boolean;
}

/** Nguồn gốc của một lịch đã chiếm chỗ của người dùng. */
export type ScheduleConflictKind = 'LEADER' | 'MEMBER' | 'PENDING_APPLICATION';

/** Một nhóm đang chiếm ngày đi mà người dùng định đăng ký trùng vào. */
export interface ScheduleConflict {
  matchingGroupId: string;
  groupName: string;
  targetDate: string;
  kind: ScheduleConflictKind;
}

export interface PaginationResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export type MatchingGroupPaginationResponse = PaginationResponse<MatchingGroupItem>;
export type MatchingMemberPaginationResponse = PaginationResponse<MatchingMemberItem>;
export type MyMatchingJoinRequestPaginationResponse = PaginationResponse<MyMatchingJoinRequestItem>;

export interface GetMatchingGroupsParams {
  sourceType?: MatchingGroupSourceType;
  tourId?: string;
  targetDate?: string;
  targetDateFrom?: string;
  targetDateTo?: string;
  difficulty?: JourneyDifficulty;
  location?: string;
  minCost?: number;
  maxCost?: number;
  availableSlotsOnly?: boolean;
  keyword?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
}

export interface GetMyMatchingGroupsParams {
  status?: MatchingGroupStatus;
  role?: MatchingMemberRole;
  keyword?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
}

export interface GetJoinRequestsParams {
  status?: JoinApplicationStatus;
  page?: number;
  size?: number;
}

export interface GetMyJoinRequestsParams {
  status?: JoinApplicationStatus;
  page?: number;
  size?: number;
}

export interface GroupApplicationRequest {
  message?: string;
}
