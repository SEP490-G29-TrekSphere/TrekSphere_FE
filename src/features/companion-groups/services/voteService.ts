import { type ApiResponse, ApiService } from '@/config/apiClient';
import type { PaginationResponse } from '../types/matchingGroup';
import type {
  CastBallotPayload,
  CreateGroupVotePayload,
  GetGroupVotesParams,
  GroupVoteResponse,
  OpenDissolutionVotePayload,
  OpenLeaderElectionPayload,
} from '../types/vote';

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

export const voteService = {

  async createGeneralPoll(
    groupId: string,
    payload: CreateGroupVotePayload
  ): Promise<GroupVoteResponse> {
    const response = await ApiService<GroupVoteResponse>(
      `/matching-groups/${groupId}/votes`,
      'POST',
      payload
    );
    return unwrapResponse(response);
  },

  async openLeaderElectionVote(
    groupId: string,
    payload: OpenLeaderElectionPayload
  ): Promise<GroupVoteResponse> {
    const response = await ApiService<GroupVoteResponse>(
      `/matching-groups/${groupId}/votes/leader-election`,
      'POST',
      payload
    );
    return unwrapResponse(response);
  },

  async openDissolutionVote(
    groupId: string,
    payload: OpenDissolutionVotePayload
  ): Promise<GroupVoteResponse> {
    const response = await ApiService<GroupVoteResponse>(
      `/matching-groups/${groupId}/votes/dissolution`,
      'POST',
      payload
    );
    return unwrapResponse(response);
  },

  async getVotes(
    groupId: string,
    params: GetGroupVotesParams = {}
  ): Promise<PaginationResponse<GroupVoteResponse>> {
    const response = await ApiService<PaginationResponse<GroupVoteResponse>>(
      `/matching-groups/${groupId}/votes`,
      'GET',
      undefined,
      toQueryParams(params)
    );
    return unwrapResponse(response);
  },

  async getVoteDetail(groupId: string, voteId: string): Promise<GroupVoteResponse> {
    const response = await ApiService<GroupVoteResponse>(
      `/matching-groups/${groupId}/votes/${voteId}`,
      'GET'
    );
    return unwrapResponse(response);
  },

  async castBallot(
    groupId: string,
    voteId: string,
    payload: CastBallotPayload
  ): Promise<GroupVoteResponse> {
    const response = await ApiService<GroupVoteResponse>(
      `/matching-groups/${groupId}/votes/${voteId}/ballots`,
      'POST',
      payload
    );
    return unwrapResponse(response);
  },

  async closeVote(groupId: string, voteId: string): Promise<GroupVoteResponse> {
    const response = await ApiService<GroupVoteResponse>(
      `/matching-groups/${groupId}/votes/${voteId}/close`,
      'POST'
    );
    return unwrapResponse(response);
  },

  async cancelVote(groupId: string, voteId: string): Promise<GroupVoteResponse> {
    const response = await ApiService<GroupVoteResponse>(
      `/matching-groups/${groupId}/votes/${voteId}/cancel`,
      'POST'
    );
    return unwrapResponse(response);
  },
};
