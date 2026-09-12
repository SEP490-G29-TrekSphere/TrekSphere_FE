import { type ApiResponse, ApiService } from '@/config/apiClient';
import type {
  GetJoinRequestsParams,
  GetMatchingGroupsParams,
  GetMyJoinRequestsParams,
  GetMyMatchingGroupsParams,
  GroupApplicationRequest,
  MatchingGroupCreateRequest,
  MatchingGroupDetailResponse,
  MatchingGroupPaginationResponse,
  MatchingGroupUpdateRequest,
  MatchingMemberItem,
  MatchingMemberPaginationResponse,
  MyMatchingJoinRequestPaginationResponse,
} from '../types/matchingGroup';

export type {
  GetJoinRequestsParams,
  GetMatchingGroupsParams,
  GetMyJoinRequestsParams,
  GetMyMatchingGroupsParams,
  GroupApplicationRequest,
  JoinApplicationStatus,
  JourneyDifficulty,
  MatchingGroupCreateRequest,
  MatchingGroupDetailResponse,
  MatchingGroupItem,
  MatchingGroupPaginationResponse,
  MatchingGroupSourceType,
  MatchingGroupStatus,
  MatchingGroupUpdateRequest,
  MatchingMemberItem,
  MatchingMemberPaginationResponse,
  MatchingMemberRole,
  MatchingMemberStatus,
  MyMatchingJoinRequestItem,
  MyMatchingJoinRequestPaginationResponse,
} from '../types/matchingGroup';

function unwrapResponse<T>(response: ApiResponse<T>): T {
  if (response.error) {
    throw new Error(response.error);
  }
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

async function mutateGroup(
  groupId: string,
  action: 'hide' | 'show' | 'close' | 'open' | 'start-trip' | 'complete-trip'
): Promise<MatchingGroupDetailResponse> {
  const response = await ApiService<MatchingGroupDetailResponse>(
    `/matching-groups/${groupId}/${action}`,
    'POST'
  );
  return unwrapResponse(response);
}

export const companionGroupService = {
  async getMatchingGroups(
    params: GetMatchingGroupsParams = {}
  ): Promise<MatchingGroupPaginationResponse> {
    const response = await ApiService<MatchingGroupPaginationResponse>(
      '/matching-groups',
      'GET',
      undefined,
      toQueryParams(params)
    );
    return unwrapResponse(response);
  },

  async getMyMatchingGroups(
    params: GetMyMatchingGroupsParams = {}
  ): Promise<MatchingGroupPaginationResponse> {
    const response = await ApiService<MatchingGroupPaginationResponse>(
      '/matching-groups/my-groups',
      'GET',
      undefined,
      toQueryParams(params)
    );
    return unwrapResponse(response);
  },

  async getMatchingGroupDetail(groupId: string): Promise<MatchingGroupDetailResponse> {
    const response = await ApiService<MatchingGroupDetailResponse>(
      `/matching-groups/${groupId}`,
      'GET'
    );
    return unwrapResponse(response);
  },

  async createMatchingGroup(
    payload: MatchingGroupCreateRequest
  ): Promise<MatchingGroupDetailResponse> {
    const response = await ApiService<MatchingGroupDetailResponse>(
      '/matching-groups',
      'POST',
      payload
    );
    return unwrapResponse(response);
  },

  async updateMatchingGroup(
    groupId: string,
    payload: MatchingGroupUpdateRequest
  ): Promise<MatchingGroupDetailResponse> {
    const response = await ApiService<MatchingGroupDetailResponse>(
      `/matching-groups/${groupId}`,
      'PATCH',
      payload
    );
    return unwrapResponse(response);
  },

  hideMatchingGroup(groupId: string): Promise<MatchingGroupDetailResponse> {
    return mutateGroup(groupId, 'hide');
  },

  showMatchingGroup(groupId: string): Promise<MatchingGroupDetailResponse> {
    return mutateGroup(groupId, 'show');
  },

  closeMatchingGroup(groupId: string): Promise<MatchingGroupDetailResponse> {
    return mutateGroup(groupId, 'close');
  },

  openMatchingGroup(groupId: string): Promise<MatchingGroupDetailResponse> {
    return mutateGroup(groupId, 'open');
  },

  startTrip(groupId: string): Promise<MatchingGroupDetailResponse> {
    return mutateGroup(groupId, 'start-trip');
  },

  completeTrip(groupId: string): Promise<MatchingGroupDetailResponse> {
    return mutateGroup(groupId, 'complete-trip');
  },

  async submitApplication(
    groupId: string,
    payload: GroupApplicationRequest = {}
  ): Promise<MatchingMemberItem> {
    const response = await ApiService<MatchingMemberItem>(
      `/matching-groups/${groupId}/applications`,
      'POST',
      payload
    );
    return unwrapResponse(response);
  },

  async withdrawApplication(groupId: string): Promise<MatchingMemberItem> {
    const response = await ApiService<MatchingMemberItem>(
      `/matching-groups/${groupId}/applications/me/withdraw`,
      'POST'
    );
    return unwrapResponse(response);
  },

  async leaveMatchingGroup(groupId: string): Promise<MatchingMemberItem> {
    const response = await ApiService<MatchingMemberItem>(
      `/matching-groups/${groupId}/members/me`,
      'DELETE'
    );
    return unwrapResponse(response);
  },

  async getJoinRequests(
    groupId: string,
    params: GetJoinRequestsParams = {}
  ): Promise<MatchingMemberPaginationResponse> {
    const response = await ApiService<MatchingMemberPaginationResponse>(
      `/matching-groups/${groupId}/applications`,
      'GET',
      undefined,
      toQueryParams(params)
    );
    return unwrapResponse(response);
  },

  async getMyJoinRequests(
    params: GetMyJoinRequestsParams = {}
  ): Promise<MyMatchingJoinRequestPaginationResponse> {
    const response = await ApiService<MyMatchingJoinRequestPaginationResponse>(
      '/matching-groups/my-applications',
      'GET',
      undefined,
      toQueryParams(params)
    );
    return unwrapResponse(response);
  },

  async approveApplication(groupId: string, applicationId: string): Promise<MatchingMemberItem> {
    const response = await ApiService<MatchingMemberItem>(
      `/matching-groups/${groupId}/applications/${applicationId}/approve`,
      'POST'
    );
    return unwrapResponse(response);
  },

  async rejectApplication(
    groupId: string,
    applicationId: string,
    payload?: { reviewNote?: string }
  ): Promise<MatchingMemberItem> {
    const response = await ApiService<MatchingMemberItem>(
      `/matching-groups/${groupId}/applications/${applicationId}/reject`,
      'POST',
      payload
    );
    return unwrapResponse(response);
  },
};
