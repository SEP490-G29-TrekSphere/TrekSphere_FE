import { type ApiResponse, ApiService } from '@/config/apiClient';
import type { PaginationResponse } from '../types/matchingGroup';
import type {
  CustomJourneyActivityCreateRequest,
  CustomJourneyActivityResponse,
  CustomJourneyActivityUpdateRequest,
  CustomJourneyCheckpointCreateRequest,
  CustomJourneyCheckpointResponse,
  CustomJourneyCheckpointUpdateRequest,
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
  GroupPostResponse,
  GroupPostUpdateRequest,
} from '../types/workspace';

export interface PeerReviewPayload {
  revieweeId?: string;
  targetMemberId?: string;
  rating?: number;
  punctualityScore?: number;
  preparednessScore?: number;
  teamworkScore?: number;
  safetyScore?: number;
  comment?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  medicalInfo?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  skills?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface DebtSettlementItem {
  id: string;
  fromMemberId: string;
  fromMemberName?: string;
  toMemberId: string;
  toMemberName?: string;
  amount: number;
  isConfirmed: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
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

  /**
   * Lấy chi tiết lộ trình Custom Journey của nhóm ghép.
   */
  async getJourney(groupId: string): Promise<CustomJourneyDetailResponse> {
    const response = await ApiService<CustomJourneyDetailResponse>(
      `/matching-groups/${groupId}/journey`,
      'GET'
    );
    return unwrapResponse(response);
  },

  /**
   * Cập nhật thông tin tổng quan Custom Journey (chỉ Leader khi chưa khóa).
   */
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

  /**
   * Lấy danh sách điểm dừng / hoạt động theo ngày.
   */
  async getCheckpoints(groupId: string): Promise<CustomJourneyCheckpointResponse[]> {
    const response = await ApiService<CustomJourneyCheckpointResponse[]>(
      `/matching-groups/${groupId}/journey/checkpoints`,
      'GET'
    );
    return unwrapResponse(response);
  },

  /**
   * Thêm điểm dừng mới vào hành trình (chỉ Leader khi chưa khóa).
   */
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

  /**
   * Cập nhật điểm dừng trong hành trình (chỉ Leader khi chưa khóa).
   */
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

  /**
   * Xóa điểm dừng khỏi hành trình (chỉ Leader khi chưa khóa).
   */
  async deleteCheckpoint(groupId: string, checkpointId: string): Promise<void> {
    const response = await ApiService<void>(
      `/matching-groups/${groupId}/journey/checkpoints/${checkpointId}`,
      'DELETE'
    );
    return unwrapResponse(response);
  },

  /**
   * Lấy danh sách các hoạt động trong thời khóa biểu lộ trình của nhóm ghép.
   */
  async getJourneyActivities(groupId: string): Promise<CustomJourneyActivityResponse[]> {
    const response = await ApiService<CustomJourneyActivityResponse[]>(
      `/matching-groups/${groupId}/journey/activities`,
      'GET'
    );
    return unwrapResponse(response);
  },

  /**
   * Thêm hoạt động mới vào thời khóa biểu (chỉ Leader khi chưa khóa).
   */
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

  /**
   * Cập nhật hoạt động trong thời khóa biểu (chỉ Leader khi chưa khóa).
   */
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

  /**
   * Xóa hoạt động khỏi thời khóa biểu (chỉ Leader khi chưa khóa).
   */
  async deleteJourneyActivity(groupId: string, activityId: string): Promise<void> {
    const response = await ApiService<void>(
      `/matching-groups/${groupId}/journey/activities/${activityId}`,
      'DELETE'
    );
    return unwrapResponse(response);
  },

  // ==================== 2. GROUP CHECKLIST ====================

  /**
   * Lấy danh sách và thống kê tiến độ checklist của nhóm ghép.
   */
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

  /**
   * Tạo mới mục checklist trong nhóm ghép.
   */
  async createChecklistItem(
    groupId: string,
    payload: GroupChecklistItemCreateRequest
  ): Promise<GroupChecklistItemResponse> {
    const response = await ApiService<GroupChecklistItemResponse>(
      `/matching-groups/${groupId}/checklist-items`,
      'POST',
      payload
    );
    return unwrapResponse(response);
  },

  /**
   * Cập nhật thông tin mục checklist.
   */
  async updateChecklistItem(
    groupId: string,
    itemId: string,
    payload: GroupChecklistItemUpdateRequest
  ): Promise<GroupChecklistItemResponse> {
    const response = await ApiService<GroupChecklistItemResponse>(
      `/matching-groups/${groupId}/checklist-items/${itemId}`,
      'PUT',
      payload
    );
    return unwrapResponse(response);
  },

  /**
   * Cập nhật trạng thái mục checklist (PENDING <-> DONE).
   */
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

  /**
   * Xóa mềm mục checklist.
   */
  async deleteChecklistItem(groupId: string, itemId: string): Promise<void> {
    const response = await ApiService<void>(
      `/matching-groups/${groupId}/checklist-items/${itemId}`,
      'DELETE'
    );
    return unwrapResponse(response);
  },

  // ==================== 3. GROUP FEED & POSTS ====================

  /**
   * Lấy danh sách bài đăng bảng tin của nhóm (phân trang).
   */
  async getGroupPosts(
    groupId: string,
    params: { page?: number; size?: number; sort?: string } = {}
  ): Promise<PaginationResponse<GroupPostResponse>> {
    const response = await ApiService<PaginationResponse<GroupPostResponse>>(
      `/matching-groups/${groupId}/posts`,
      'GET',
      undefined,
      toQueryParams(params)
    );
    return unwrapResponse(response);
  },

  /**
   * Lấy chi tiết bài đăng cùng danh sách bình luận.
   */
  async getGroupPostDetail(groupId: string, postId: string): Promise<GroupPostDetailResponse> {
    const response = await ApiService<GroupPostDetailResponse>(
      `/matching-groups/${groupId}/posts/${postId}`,
      'GET'
    );
    return unwrapResponse(response);
  },

  /**
   * Đăng bài viết mới trong nhóm ghép.
   */
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

  /**
   * Chỉnh sửa bài viết (chỉ tác giả).
   */
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

  /**
   * Xóa mềm bài viết (tác giả hoặc Leader).
   */
  async deleteGroupPost(groupId: string, postId: string): Promise<void> {
    const response = await ApiService<void>(
      `/matching-groups/${groupId}/posts/${postId}`,
      'DELETE'
    );
    return unwrapResponse(response);
  },

  /**
   * Ẩn/Hiện bài viết (kiểm duyệt - chỉ Leader).
   */
  async toggleHideGroupPost(groupId: string, postId: string): Promise<GroupPostResponse> {
    const response = await ApiService<GroupPostResponse>(
      `/matching-groups/${groupId}/posts/${postId}/toggle-hide`,
      'PATCH'
    );
    return unwrapResponse(response);
  },

  /**
   * Gửi bình luận vào bài viết.
   */
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

  /**
   * Chỉnh sửa bình luận (chỉ tác giả).
   */
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

  /**
   * Xóa mềm bình luận (tác giả hoặc Leader).
   */
  async deleteComment(groupId: string, postId: string, commentId: string): Promise<void> {
    const response = await ApiService<void>(
      `/matching-groups/${groupId}/posts/${postId}/comments/${commentId}`,
      'DELETE'
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
  async checkInCheckpoint(_groupId: string, _checkpointId: string): Promise<void> {},
  async skipCheckpoint(_groupId: string, _checkpointId: string): Promise<void> {},

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getDissolveRequest(_groupId: string): Promise<any> {
    return null;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createDissolveRequest(_groupId: string, _reason: string): Promise<any> {
    return null;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async voteDissolveRequest(_groupId: string, _requestId: string, _vote: string): Promise<any> {
    return null;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async cancelDissolveRequest(_groupId: string): Promise<any> {
    return null;
  },

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getSuccessionRequest(_groupId: string): Promise<any> {
    return null;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createSuccessionRequest(
    _groupId: string,
    _data: { reason: string; nomineeId: string }
  ): Promise<any> {
    return null;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async appointLeaderDirect(_groupId: string, _data: { nomineeId: string }): Promise<any> {
    return null;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async voteSuccessionRequest(
    _groupId: string,
    _requestId: string,
    _vote: 'YES' | 'NO'
  ): Promise<any> {
    return null;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async cancelSuccessionRequest(_groupId: string): Promise<any> {
    return null;
  },
};
