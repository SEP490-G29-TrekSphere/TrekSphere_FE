import { type ApiResponse, ApiService } from '@/config/apiClient';

export interface PeerReviewPayload {
  revieweeMemberId?: string;
  revieweeUserId?: string;
  actualEnduranceRating: number;
  punctualityResponsibilityRating: number;
  financialFairnessRating: number;
  comment?: string;
}

export interface PeerReviewCandidate {
  matchingMemberId: string;
  userId: string;
  fullName: string;
  avatarUrl?: string;
  role: 'LEADER' | 'MEMBER';
  roleLabel: string;
  isReviewed: boolean;
  existingReviewId?: string;
}

export interface PeerReviewItem {
  groupPeerReviewId: string;
  groupTripId: string;
  revieweeMatchingMemberId: string;
  revieweeUserId: string;
  revieweeFullName: string;
  revieweeAvatarUrl?: string;
  actualEnduranceRating: number;
  punctualityResponsibilityRating: number;
  financialFairnessRating: number;
  averageRating: number;
  comment?: string;
  moderationStatus: 'VISIBLE' | 'HIDDEN' | 'FLAGGED';
  createdAt: string;
}

function unwrapResponse<T>(response: ApiResponse<T>): T {
  if (response.error) {
    throw new Error(response.error);
  }
  if (response.data === undefined || response.data === null) {
    throw new Error(response.message ?? 'Máy chủ không phản hồi dữ liệu.');
  }
  return response.data;
}

export const peerReviewService = {
  async submitPeerReview(groupId: string, payload: PeerReviewPayload): Promise<PeerReviewItem> {
    const res = await ApiService<PeerReviewItem>(
      `/matching-groups/${groupId}/peer-reviews`,
      'POST',
      payload
    );
    return unwrapResponse(res);
  },

  async getPeerReviewCandidates(groupId: string): Promise<PeerReviewCandidate[]> {
    const res = await ApiService<PeerReviewCandidate[]>(
      `/matching-groups/${groupId}/peer-reviews/candidates`,
      'GET'
    );
    return unwrapResponse(res);
  },

  async getGroupPeerReviews(groupId: string): Promise<PeerReviewItem[]> {
    const res = await ApiService<PeerReviewItem[]>(
      `/matching-groups/${groupId}/peer-reviews`,
      'GET'
    );
    return unwrapResponse(res);
  },

  async getUserPeerReviews(userId: string): Promise<PeerReviewItem[]> {
    const res = await ApiService<PeerReviewItem[]>(`/users/${userId}/peer-reviews`, 'GET');
    return unwrapResponse(res);
  },
};
