import { type ApiResponse, ApiService } from '@/config/apiClient';
import type {
  GroupExpenseCreateRequest,
  GroupExpenseResponse,
  GroupExpenseSummaryResponse,
  GroupExpenseUpdateRequest,
} from '../types/expense';
import type { PaginationResponse } from '../types/matchingGroup';
import type {
  GroupSettlementProofRequest,
  GroupSettlementRejectRequest,
  GroupSettlementResponse,
  GroupSettlementSummaryResponse,
} from '../types/settlement';
import type {
  CustomJourneyActivityCreateRequest,
  CustomJourneyActivityResponse,
  CustomJourneyActivityUpdateRequest,
  CustomJourneyCheckpointCreateRequest,
  CustomJourneyCheckpointResponse,
  CustomJourneyCheckpointUpdateRequest,
  CustomJourneyCostItemCreateRequest,
  CustomJourneyCostItemResponse,
  CustomJourneyCostItemUpdateRequest,
  CustomJourneyCostSummaryResponse,
  CustomJourneyDetailResponse,
  CustomJourneyUpdateRequest,
  GroupChecklistFilterRequest,
  GroupChecklistItemCreateRequest,
  GroupChecklistItemResponse,
  GroupChecklistItemStatusUpdateRequest,
  GroupChecklistItemUpdateRequest,
  GroupChecklistStatus,
  GroupChecklistSummaryResponse,
  GroupPostCommentCreateRequest,
  GroupPostCommentResponse,
  GroupPostCommentUpdateRequest,
  GroupPostCreateRequest,
  GroupPostDetailResponse,
  GroupPostFilterRequest,
  GroupPostResponse,
  GroupPostUpdateRequest,
} from '../types/workspace';

export interface GroupMedicalInfo {
  bloodType?: string;
  allergies?: string[];
  medicalConditions?: string[];
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface PeerReviewPayload {
  revieweeId?: string;
  targetMemberId?: string;
  rating?: number;
  punctualityScore?: number;
  preparednessScore?: number;
  teamworkScore?: number;
  safetyScore?: number;
  comment?: string;
}

export interface WorkspaceMemberItem {
  id: string;
  userId: string;
  name: string;
  fullName: string;
  avatarUrl?: string;
  role?: string;
  roleLabel?: string;
  status?: string;
  isLeader?: boolean;
  trustScore?: number;
  completedTrips?: number;
  medicalInfo?: GroupMedicalInfo | null;
  skills?: string[];
}

export type GroupLifecyclePhase = 1 | 2 | 3 | 4 | 5;

export type BudgetCategory = 'trans' | 'food' | 'stay' | 'gear' | 'service' | 'other' | string;

export interface ActualExpenseItem {
  id: string;
  title: string;
  amount: number;
  payerId: string;
  payerName?: string;
  category?: BudgetCategory;
  beneficiaryIds: string[];
  receiptImageUrl?: string;
  createdAt?: string;
}

export interface DebtSettlementItem {
  id: string;
  fromMemberId: string;
  fromMemberName?: string;
  toMemberId: string;
  toMemberName?: string;
  amount: number;
  isConfirmed: boolean;
}

export type CheckpointStatus = 'COMPLETED' | 'IN_PROGRESS' | 'UPCOMING' | 'SKIPPED' | string;

export type TimeSlot = 'morning' | 'noon' | 'afternoon' | 'evening' | string;

export interface ItineraryDayColumn {
  dayNo: number;
  date?: string;
  title?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  slots?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  activities?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface TrailCheckpointItem {
  id?: string;
  customJourneyCheckpointId?: string;
  order?: number;
  checkpointOrder?: number;
  name?: string;
  title?: string;
  latitude?: number | null;
  longitude?: number | null;
  status?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface BudgetPlanItem {
  id: string;
  title: string;
  amount: number;
  payerId: string;
  category: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface EquipmentItemDto {
  id: string;
  name: string;
  quantity: number;
  assignedMemberId?: string;
  isPrepared: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface ItineraryActivityItem {
  id: string;
  dayNo: number;
  time: string;
  activity: string;
  location?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

function unwrapResponse<T>(response: ApiResponse<T>): T {
  if (response.error) throw new Error(response.error);
  if (response.data === undefined || response.data === null) {
    throw new Error(response.message ?? 'Phản hồi từ máy chủ không có dữ liệu.');
  }
  return response.data;
}

function toQueryParams(params: object): Record<string, string> {
  return Object.fromEntries(
    Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => [key, typeof value === 'string' ? value.trim() : String(value)])
  );
}

export const groupWorkspaceService = {
  // ==================== 1. CUSTOM JOURNEY & CHECKPOINTS ====================

  async getJourney(groupId: string): Promise<CustomJourneyDetailResponse> {
    const response = await ApiService<CustomJourneyDetailResponse>(
      `/matching-groups/${groupId}/journey`,
      'GET'
    );
    return unwrapResponse(response);
  },

  async updateJourney(
    groupId: string,
    payload: CustomJourneyUpdateRequest
  ): Promise<CustomJourneyDetailResponse> {
    const response = await ApiService<CustomJourneyDetailResponse>(
      `/matching-groups/${groupId}/journey`,
      'PUT',
      payload
    );
    return unwrapResponse(response);
  },

  async getCheckpoints(groupId: string): Promise<CustomJourneyCheckpointResponse[]> {
    const response = await ApiService<CustomJourneyCheckpointResponse[]>(
      `/matching-groups/${groupId}/journey/checkpoints`,
      'GET'
    );
    return unwrapResponse(response);
  },

  async createCheckpoint(
    groupId: string,
    payload: CustomJourneyCheckpointCreateRequest
  ): Promise<CustomJourneyCheckpointResponse> {
    const response = await ApiService<CustomJourneyCheckpointResponse>(
      `/matching-groups/${groupId}/journey/checkpoints`,
      'POST',
      payload
    );
    return unwrapResponse(response);
  },

  async updateCheckpoint(
    groupId: string,
    checkpointId: string,
    payload: CustomJourneyCheckpointUpdateRequest
  ): Promise<CustomJourneyCheckpointResponse> {
    const response = await ApiService<CustomJourneyCheckpointResponse>(
      `/matching-groups/${groupId}/journey/checkpoints/${checkpointId}`,
      'PUT',
      payload
    );
    return unwrapResponse(response);
  },

  async deleteCheckpoint(groupId: string, checkpointId: string): Promise<void> {
    const response = await ApiService<void>(
      `/matching-groups/${groupId}/journey/checkpoints/${checkpointId}`,
      'DELETE'
    );
    return unwrapResponse(response);
  },

  async swapCheckpoints(
    groupId: string,
    checkpointId: string,
    targetCheckpointId: string
  ): Promise<CustomJourneyCheckpointResponse[]> {
    const response = await ApiService<CustomJourneyCheckpointResponse[]>(
      `/matching-groups/${groupId}/journey/checkpoints/${checkpointId}/swap/${targetCheckpointId}`,
      'PUT'
    );
    return unwrapResponse(response);
  },

  async updateCheckpointProgress(
    groupId: string,
    checkpointId: string,
    status: 'CHECKED_IN' | 'SKIPPED'
  ): Promise<CustomJourneyCheckpointResponse> {
    const response = await ApiService<CustomJourneyCheckpointResponse>(
      `/matching-groups/${groupId}/journey/checkpoints/${checkpointId}/progress`,
      'PATCH',
      { status }
    );
    return unwrapResponse(response);
  },

  async resetCheckpointProgress(
    groupId: string,
    checkpointId: string
  ): Promise<CustomJourneyCheckpointResponse> {
    const response = await ApiService<CustomJourneyCheckpointResponse>(
      `/matching-groups/${groupId}/journey/checkpoints/${checkpointId}/progress`,
      'DELETE'
    );
    return unwrapResponse(response);
  },

  async getJourneyActivities(groupId: string): Promise<CustomJourneyActivityResponse[]> {
    const response = await ApiService<CustomJourneyActivityResponse[]>(
      `/matching-groups/${groupId}/journey/activities`,
      'GET'
    );
    return unwrapResponse(response);
  },

  async createJourneyActivity(
    groupId: string,
    payload: CustomJourneyActivityCreateRequest
  ): Promise<CustomJourneyActivityResponse> {
    const response = await ApiService<CustomJourneyActivityResponse>(
      `/matching-groups/${groupId}/journey/activities`,
      'POST',
      payload
    );
    return unwrapResponse(response);
  },

  async updateJourneyActivity(
    groupId: string,
    activityId: string,
    payload: CustomJourneyActivityUpdateRequest
  ): Promise<CustomJourneyActivityResponse> {
    const response = await ApiService<CustomJourneyActivityResponse>(
      `/matching-groups/${groupId}/journey/activities/${activityId}`,
      'PUT',
      payload
    );
    return unwrapResponse(response);
  },

  async deleteJourneyActivity(groupId: string, activityId: string): Promise<void> {
    const response = await ApiService<void>(
      `/matching-groups/${groupId}/journey/activities/${activityId}`,
      'DELETE'
    );
    return unwrapResponse(response);
  },

  // ==================== CUSTOM JOURNEY COST ITEMS (BUDGET) ====================

  async getCostSummary(groupId: string): Promise<CustomJourneyCostSummaryResponse> {
    const response = await ApiService<CustomJourneyCostSummaryResponse>(
      `/matching-groups/${groupId}/journey/cost-items/summary`,
      'GET'
    );
    return unwrapResponse(response);
  },

  async getCostItems(groupId: string): Promise<CustomJourneyCostItemResponse[]> {
    const response = await ApiService<CustomJourneyCostItemResponse[]>(
      `/matching-groups/${groupId}/journey/cost-items`,
      'GET'
    );
    return unwrapResponse(response);
  },

  async createCostItem(
    groupId: string,
    payload: CustomJourneyCostItemCreateRequest
  ): Promise<CustomJourneyCostItemResponse> {
    const response = await ApiService<CustomJourneyCostItemResponse>(
      `/matching-groups/${groupId}/journey/cost-items`,
      'POST',
      payload
    );
    return unwrapResponse(response);
  },

  async updateCostItem(
    groupId: string,
    costItemId: string,
    payload: CustomJourneyCostItemUpdateRequest
  ): Promise<CustomJourneyCostItemResponse> {
    const response = await ApiService<CustomJourneyCostItemResponse>(
      `/matching-groups/${groupId}/journey/cost-items/${costItemId}`,
      'PUT',
      payload
    );
    return unwrapResponse(response);
  },

  async deleteCostItem(groupId: string, costItemId: string): Promise<void> {
    const response = await ApiService<void>(
      `/matching-groups/${groupId}/journey/cost-items/${costItemId}`,
      'DELETE'
    );
    return unwrapResponse(response);
  },

  // ==================== 2. GROUP CHECKLIST ====================

  async getChecklistSummary(
    groupId: string,
    filter: GroupChecklistFilterRequest = {}
  ): Promise<GroupChecklistSummaryResponse> {
    const response = await ApiService<GroupChecklistSummaryResponse>(
      `/matching-groups/${groupId}/checklist-items`,
      'GET',
      undefined,
      toQueryParams(filter)
    );
    return unwrapResponse(response);
  },

  async createChecklistItem(
    groupId: string,
    payload: GroupChecklistItemCreateRequest
  ): Promise<GroupChecklistItemResponse> {
    const validTypes = ['CLOTHING', 'TENT', 'MEDICAL', 'ELECTRONICS', 'OTHER'];
    let itemTypeCode = payload.itemTypeCode || payload.itemType || 'OTHER';
    if (!validTypes.includes(itemTypeCode)) {
      itemTypeCode = 'OTHER';
    }

    const bePayload = {
      title: payload.title || payload.itemName || '',
      itemScope: payload.itemScope || payload.category || 'SHARED',
      itemTypeCode,
      isRequired: payload.isRequired ?? false,
      note: payload.note || null,
      assigneeMatchingMemberId:
        payload.assigneeMatchingMemberId || payload.assigneeMemberId || null,
    };
    const response = await ApiService<GroupChecklistItemResponse>(
      `/matching-groups/${groupId}/checklist-items`,
      'POST',
      bePayload
    );
    return unwrapResponse(response);
  },

  async updateChecklistItem(
    groupId: string,
    itemId: string,
    payload: GroupChecklistItemUpdateRequest
  ): Promise<GroupChecklistItemResponse> {
    const validTypes = ['CLOTHING', 'TENT', 'MEDICAL', 'ELECTRONICS', 'OTHER'];
    let itemTypeCode = payload.itemTypeCode || payload.itemType || 'OTHER';
    if (!validTypes.includes(itemTypeCode)) {
      itemTypeCode = 'OTHER';
    }

    const bePayload = {
      title: payload.title || payload.itemName || '',
      itemScope: payload.itemScope || payload.category || 'SHARED',
      itemTypeCode,
      isRequired: payload.isRequired ?? false,
      note: payload.note || null,
      assigneeMatchingMemberId:
        payload.assigneeMatchingMemberId || payload.assigneeMemberId || null,
    };
    const response = await ApiService<GroupChecklistItemResponse>(
      `/matching-groups/${groupId}/checklist-items/${itemId}`,
      'PUT',
      bePayload
    );
    return unwrapResponse(response);
  },

  async updateItemStatus(
    groupId: string,
    itemId: string,
    status: GroupChecklistStatus
  ): Promise<GroupChecklistItemResponse> {
    const payload: GroupChecklistItemStatusUpdateRequest = { status };
    const response = await ApiService<GroupChecklistItemResponse>(
      `/matching-groups/${groupId}/checklist-items/${itemId}/status`,
      'PATCH',
      payload
    );
    return unwrapResponse(response);
  },

  async deleteChecklistItem(groupId: string, itemId: string): Promise<void> {
    const response = await ApiService<void>(
      `/matching-groups/${groupId}/checklist-items/${itemId}`,
      'DELETE'
    );
    return unwrapResponse(response);
  },

  // ==================== 3. GROUP FEED & POSTS ====================

  async getGroupPosts(
    groupId: string,
    params: GroupPostFilterRequest = {}
  ): Promise<PaginationResponse<GroupPostResponse>> {
    const response = await ApiService<PaginationResponse<GroupPostResponse>>(
      `/matching-groups/${groupId}/posts`,
      'GET',
      undefined,
      toQueryParams(params)
    );
    return unwrapResponse(response);
  },

  async getGroupPostDetail(groupId: string, postId: string): Promise<GroupPostDetailResponse> {
    const response = await ApiService<GroupPostDetailResponse>(
      `/matching-groups/${groupId}/posts/${postId}`,
      'GET'
    );
    return unwrapResponse(response);
  },

  async createGroupPost(
    groupId: string,
    payload: GroupPostCreateRequest
  ): Promise<GroupPostResponse> {
    const response = await ApiService<GroupPostResponse>(
      `/matching-groups/${groupId}/posts`,
      'POST',
      payload
    );
    return unwrapResponse(response);
  },

  async updateGroupPost(
    groupId: string,
    postId: string,
    payload: GroupPostUpdateRequest
  ): Promise<GroupPostResponse> {
    const response = await ApiService<GroupPostResponse>(
      `/matching-groups/${groupId}/posts/${postId}`,
      'PUT',
      payload
    );
    return unwrapResponse(response);
  },

  async togglePinGroupPost(groupId: string, postId: string): Promise<GroupPostResponse> {
    const response = await ApiService<GroupPostResponse>(
      `/matching-groups/${groupId}/posts/${postId}/toggle-pin`,
      'PATCH'
    );
    return unwrapResponse(response);
  },

  async deleteGroupPost(groupId: string, postId: string): Promise<void> {
    const response = await ApiService<void>(
      `/matching-groups/${groupId}/posts/${postId}`,
      'DELETE'
    );
    return unwrapResponse(response);
  },

  async toggleHideGroupPost(groupId: string, postId: string): Promise<GroupPostResponse> {
    const response = await ApiService<GroupPostResponse>(
      `/matching-groups/${groupId}/posts/${postId}/toggle-hide`,
      'PATCH'
    );
    return unwrapResponse(response);
  },

  async createComment(
    groupId: string,
    postId: string,
    payload: GroupPostCommentCreateRequest
  ): Promise<GroupPostCommentResponse> {
    const response = await ApiService<GroupPostCommentResponse>(
      `/matching-groups/${groupId}/posts/${postId}/comments`,
      'POST',
      payload
    );
    return unwrapResponse(response);
  },

  async updateComment(
    groupId: string,
    postId: string,
    commentId: string,
    payload: GroupPostCommentUpdateRequest
  ): Promise<GroupPostCommentResponse> {
    const response = await ApiService<GroupPostCommentResponse>(
      `/matching-groups/${groupId}/posts/${postId}/comments/${commentId}`,
      'PUT',
      payload
    );
    return unwrapResponse(response);
  },

  async deleteComment(groupId: string, postId: string, commentId: string): Promise<void> {
    const response = await ApiService<void>(
      `/matching-groups/${groupId}/posts/${postId}/comments/${commentId}`,
      'DELETE'
    );
    return unwrapResponse(response);
  },

  async toggleHideComment(
    groupId: string,
    postId: string,
    commentId: string
  ): Promise<GroupPostCommentResponse> {
    const response = await ApiService<GroupPostCommentResponse>(
      `/matching-groups/${groupId}/posts/${postId}/comments/${commentId}/toggle-hide`,
      'PATCH'
    );
    return unwrapResponse(response);
  },

  // ==================== FUTURE EXTENSIONS (Phase 4 / 6 / 7 / 8) STUBS ====================
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getBudget(_groupId: string): Promise<any> {
    return {
      plannedItems: [],
      actualExpenses: [],
      totalPlanned: 0,
      totalActual: 0,
      settlements: [],
    };
  },
  async savePlanItem(_groupId: string, _data: unknown): Promise<void> {},
  async deletePlanItem(_groupId: string, _itemId: string): Promise<void> {},
  async saveExpense(_groupId: string, _data: unknown): Promise<void> {},
  async deleteExpense(_groupId: string, _expenseId: string): Promise<void> {},
  async confirmSettlement(_groupId: string, _settlementId: string): Promise<void> {},

  async addCheckpoint(_groupId: string, _data: unknown): Promise<void> {},
  async skipCheckpoint(_groupId: string, _checkpointId: string): Promise<void> {},

  async getEquipment(_groupId: string): Promise<EquipmentItemDto[]> {
    return [];
  },
  async addEquipmentItem(_groupId: string, _data: unknown): Promise<void> {},
  async toggleEquipmentPrepared(_groupId: string, _itemId: string): Promise<void> {},

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getFeed(_groupId: string): Promise<any[]> {
    return [];
  },
  async createFeedPost(_groupId: string, _data: unknown): Promise<void> {},
  async toggleFeedPostLike(_groupId: string, _postId: string): Promise<void> {},

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getItinerary(_groupId: string): Promise<any> {
    return { days: [] };
  },
  async addItineraryDay(_groupId: string): Promise<void> {},
  async addItineraryActivity(_groupId: string, _data: unknown): Promise<void> {},
  async deleteItineraryActivity(_groupId: string, _activityId: string): Promise<void> {},

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getLifecycle(_groupId: string): Promise<any> {
    return { currentPhase: 1, tripStatus: 'UPCOMING' };
  },
  async advanceLifecyclePhase(_groupId: string, _phase: number): Promise<void> {},
  async setTripStatus(_groupId: string, _status: string): Promise<void> {},

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getWorkspaceMembers(_groupId: string): Promise<any[]> {
    return [];
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getPeerReviews(_groupId: string): Promise<any[]> {
    return [];
  },
  async submitPeerReview(_groupId: string, _payload: PeerReviewPayload): Promise<void> {},

  // ==========================================
  // STAGE P6-S2: GROUP EXPENSE & SHARES
  // ==========================================

  async getGroupExpenses(
    groupId: string,
    page = 0,
    size = 20
  ): Promise<PaginationResponse<GroupExpenseResponse>> {
    const response = await ApiService<PaginationResponse<GroupExpenseResponse>>(
      `/matching-groups/${groupId}/expenses`,
      'GET',
      undefined,
      { page: String(page), size: String(size) }
    );
    return unwrapResponse(response);
  },

  async getExpenseSummary(groupId: string): Promise<GroupExpenseSummaryResponse> {
    const response = await ApiService<GroupExpenseSummaryResponse>(
      `/matching-groups/${groupId}/expenses/summary`,
      'GET'
    );
    return unwrapResponse(response);
  },

  async getExpenseDetail(groupId: string, expenseId: string): Promise<GroupExpenseResponse> {
    const response = await ApiService<GroupExpenseResponse>(
      `/matching-groups/${groupId}/expenses/${expenseId}`,
      'GET'
    );
    return unwrapResponse(response);
  },

  async createExpense(
    groupId: string,
    payload: GroupExpenseCreateRequest
  ): Promise<GroupExpenseResponse> {
    const response = await ApiService<GroupExpenseResponse>(
      `/matching-groups/${groupId}/expenses`,
      'POST',
      payload
    );
    return unwrapResponse(response);
  },

  async updateExpense(
    groupId: string,
    expenseId: string,
    payload: GroupExpenseUpdateRequest
  ): Promise<GroupExpenseResponse> {
    const response = await ApiService<GroupExpenseResponse>(
      `/matching-groups/${groupId}/expenses/${expenseId}`,
      'PUT',
      payload
    );
    return unwrapResponse(response);
  },

  async voidExpense(groupId: string, expenseId: string): Promise<void> {
    const response = await ApiService<void>(
      `/matching-groups/${groupId}/expenses/${expenseId}`,
      'DELETE'
    );
    return unwrapResponse(response);
  },

  // ==========================================
  // STAGE P6-S4: GROUP SETTLEMENT & WORKFLOW
  // ==========================================

  async getSettlementSummary(groupId: string): Promise<GroupSettlementSummaryResponse> {
    const response = await ApiService<GroupSettlementSummaryResponse>(
      `/matching-groups/${groupId}/settlements/summary`,
      'GET'
    );
    return unwrapResponse(response);
  },

  async getSettlements(groupId: string): Promise<GroupSettlementResponse[]> {
    const response = await ApiService<GroupSettlementResponse[]>(
      `/matching-groups/${groupId}/settlements`,
      'GET'
    );
    return unwrapResponse(response);
  },

  async generateSettlements(groupId: string): Promise<GroupSettlementResponse[]> {
    const response = await ApiService<GroupSettlementResponse[]>(
      `/matching-groups/${groupId}/settlements/generate`,
      'POST'
    );
    return unwrapResponse(response);
  },

  async submitSettlementProof(
    groupId: string,
    settlementId: string,
    payload: GroupSettlementProofRequest
  ): Promise<GroupSettlementResponse> {
    const response = await ApiService<GroupSettlementResponse>(
      `/matching-groups/${groupId}/settlements/${settlementId}/submit-proof`,
      'POST',
      payload
    );
    return unwrapResponse(response);
  },

  async confirmSettlementPayment(
    groupId: string,
    settlementId: string
  ): Promise<GroupSettlementResponse> {
    const response = await ApiService<GroupSettlementResponse>(
      `/matching-groups/${groupId}/settlements/${settlementId}/confirm`,
      'POST'
    );
    return unwrapResponse(response);
  },

  async rejectSettlementPayment(
    groupId: string,
    settlementId: string,
    payload: GroupSettlementRejectRequest
  ): Promise<GroupSettlementResponse> {
    const response = await ApiService<GroupSettlementResponse>(
      `/matching-groups/${groupId}/settlements/${settlementId}/reject`,
      'POST',
      payload
    );
    return unwrapResponse(response);
  },
};
