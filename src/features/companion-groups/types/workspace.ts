import type { JourneyDifficulty } from './matchingGroup';

// ==================== CUSTOM JOURNEY & CHECKPOINTS ====================
export interface CustomJourneyCheckpointResponse {
  customJourneyCheckpointId: string;
  id?: string;
  dayNo: number | null;
  checkpointOrder: number;
  order?: number;
  title: string;
  name?: string;
  description: string | null;
  locationName: string | null;
  latitude: number | null;
  longitude: number | null;
  plannedStartAt: string | null;
  plannedEndAt: string | null;
  imageUrl: string | null;
  status?: string;
  category?: string;
  distanceAltitude?: string;
  gps?: string;
  checkedInByName?: string;
  checkedInAt?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface CustomJourneyDetailResponse {
  customJourneyId: string;
  title: string;
  description: string | null;
  difficulty: JourneyDifficulty;
  startDate: string;
  endDate: string;
  isLocked: boolean | null;
  lockedAt: string | null;
  checkpoints: CustomJourneyCheckpointResponse[];
}

export interface CustomJourneyUpdateRequest {
  title?: string;
  description?: string;
  difficulty?: JourneyDifficulty;
  startDate?: string;
  endDate?: string;
}

export interface CustomJourneyCheckpointCreateRequest {
  dayNo?: number | null;
  checkpointOrder: number;
  title: string;
  description?: string | null;
  locationName?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  plannedStartAt?: string | null;
  plannedEndAt?: string | null;
  imageUrl?: string | null;
}

export interface CustomJourneyCheckpointUpdateRequest {
  dayNo?: number | null;
  checkpointOrder?: number;
  title?: string;
  description?: string | null;
  locationName?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  plannedStartAt?: string | null;
  plannedEndAt?: string | null;
  imageUrl?: string | null;
}

export type TimeSlot = 'MORNING' | 'NOON' | 'AFTERNOON' | 'EVENING';

export interface CustomJourneyActivityResponse {
  customJourneyActivityId: string;
  id?: string;
  dayNo: number;
  timeSlot: TimeSlot;
  activityOrder: number;
  title: string;
  description: string | null;
  plannedStartAt: string | null;
  plannedEndAt: string | null;
  checkpointId: string | null;
  checkpointTitle: string | null;
  checkpointLocationName: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface CustomJourneyActivityCreateRequest {
  dayNo: number;
  timeSlot: TimeSlot;
  activityOrder?: number;
  title: string;
  description?: string | null;
  plannedStartAt?: string | null;
  plannedEndAt?: string | null;
  checkpointId?: string | null;
}

export interface CustomJourneyActivityUpdateRequest {
  dayNo?: number;
  timeSlot?: TimeSlot;
  activityOrder?: number;
  title?: string;
  description?: string | null;
  plannedStartAt?: string | null;
  plannedEndAt?: string | null;
  checkpointId?: string | null;
}

// Aliases for Journey
export type UpdateCustomJourneyPayload = CustomJourneyUpdateRequest;
export type CreateCheckpointPayload = CustomJourneyCheckpointCreateRequest;
export type UpdateCheckpointPayload = CustomJourneyCheckpointUpdateRequest;
export type CreateActivityPayload = CustomJourneyActivityCreateRequest;
export type UpdateActivityPayload = CustomJourneyActivityUpdateRequest;

// ==================== GROUP CHECKLIST ====================
export type GroupChecklistCategory = 'SHARED' | 'PERSONAL';
export type GroupChecklistItemType = 'GEAR' | 'MEDICINE' | 'FOOD' | 'DOCUMENT' | 'OTHER';
export type GroupChecklistStatus = 'PENDING' | 'DONE';

export interface GroupChecklistItemResponse {
  itemId: string;
  matchingGroupId: string;
  category: GroupChecklistCategory;
  itemType: GroupChecklistItemType;
  itemName: string;
  isRequired: boolean;
  status: GroupChecklistStatus;
  note: string | null;
  assigneeMemberId: string | null;
  assigneeUserId: string | null;
  assigneeName: string | null;
  assigneeAvatarUrl: string | null;
  completedAt: string | null;
  completedByMemberId: string | null;
  completedByName: string | null;
  createdAt: string;
  updatedAt: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface GroupChecklistSummaryResponse {
  totalItems: number;
  doneItems: number;
  pendingItems: number;
  completionRate: number;
  items: GroupChecklistItemResponse[];
}

export interface GroupChecklistFilterRequest {
  category?: GroupChecklistCategory;
  itemType?: GroupChecklistItemType;
  status?: GroupChecklistStatus;
  assigneeMemberId?: string;
  isRequired?: boolean;
}

export interface GroupChecklistItemCreateRequest {
  category: GroupChecklistCategory;
  itemType: GroupChecklistItemType;
  itemName: string;
  isRequired?: boolean;
  note?: string | null;
  assigneeMemberId?: string | null;
}

export interface GroupChecklistItemUpdateRequest {
  category?: GroupChecklistCategory;
  itemType?: GroupChecklistItemType;
  itemName?: string;
  isRequired?: boolean;
  note?: string | null;
  assigneeMemberId?: string | null;
}

export interface GroupChecklistItemStatusUpdateRequest {
  status: GroupChecklistStatus;
}

// Aliases for Checklist
export type ChecklistFilterParams = GroupChecklistFilterRequest;
export type CreateChecklistItemPayload = GroupChecklistItemCreateRequest;
export type UpdateChecklistItemPayload = GroupChecklistItemUpdateRequest;
export type UpdateItemStatusPayload = GroupChecklistStatus;

// ==================== GROUP FEED & POSTS ====================
export type GroupPostType = 'ANNOUNCEMENT' | 'DISCUSSION' | 'QUESTION' | 'GENERAL';

export interface GroupPostResponse {
  postId: string;
  matchingGroupId: string;
  authorMemberId: string;
  authorUserId: string;
  authorName: string;
  authorAvatarUrl: string | null;
  authorRole: 'LEADER' | 'MEMBER';
  postType: GroupPostType;
  title: string;
  content: string;
  isPinned: boolean;
  isHidden: boolean;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface GroupPostCommentResponse {
  commentId: string;
  postId: string;
  authorMemberId: string;
  authorUserId: string;
  authorName: string;
  authorAvatarUrl: string | null;
  authorRole: 'LEADER' | 'MEMBER';
  content: string;
  createdAt: string;
  updatedAt: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface GroupPostDetailResponse extends GroupPostResponse {
  comments: GroupPostCommentResponse[];
}

export interface GroupPostFilterRequest {
  page?: number;
  size?: number;
  sort?: string;
}

export interface GroupPostCreateRequest {
  postType: GroupPostType;
  title: string;
  content: string;
  isPinned?: boolean;
}

export interface GroupPostUpdateRequest {
  postType?: GroupPostType;
  title?: string;
  content?: string;
}

export interface GroupPostCommentCreateRequest {
  content: string;
}

export interface GroupPostCommentUpdateRequest {
  content: string;
}

// Aliases for Posts & Comments
export type GroupPostFilterParams = GroupPostFilterRequest;
export type CreateGroupPostPayload = GroupPostCreateRequest;
export type UpdateGroupPostPayload = GroupPostUpdateRequest;
export type CreateGroupPostCommentPayload = GroupPostCommentCreateRequest;
export type UpdateGroupPostCommentPayload = GroupPostCommentUpdateRequest;
