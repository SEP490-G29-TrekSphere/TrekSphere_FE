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
  /** `true` khi người dùng hiện tại ĐÃ chấm điểm thành viên này. */
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

/**
 * DTO thô của BE. Cờ "đã đánh giá" từng được trả về dưới nhiều tên khác nhau
 * (`isReviewed` / `reviewed` / `hasReviewed` / `alreadyReviewed` / `reviewedByCurrentUser`);
 * nếu không chuẩn hóa thì FE luôn coi là CHƯA chấm và hiện lại nút "Đánh giá"
 * cho người đã chấm rồi.
 */
interface RawPeerReviewCandidate {
  matchingMemberId?: string;
  memberId?: string;
  userId?: string;
  revieweeUserId?: string;
  fullName?: string;
  name?: string;
  avatarUrl?: string;
  role?: 'LEADER' | 'MEMBER';
  roleLabel?: string;
  isReviewed?: boolean;
  reviewed?: boolean;
  hasReviewed?: boolean;
  alreadyReviewed?: boolean;
  reviewedByCurrentUser?: boolean;
  existingReviewId?: string;
  groupPeerReviewId?: string;
}

const ROLE_LABELS: Record<'LEADER' | 'MEMBER', string> = {
  LEADER: 'Trưởng nhóm',
  MEMBER: 'Thành viên',
};

function unwrapResponse<T>(response: ApiResponse<T>): T {
  if (response.error) {
    throw new Error(response.error);
  }
  if (response.data === undefined || response.data === null) {
    throw new Error(response.message ?? 'Máy chủ không phản hồi dữ liệu.');
  }
  return response.data;
}

function mapRawCandidate(raw: RawPeerReviewCandidate): PeerReviewCandidate {
  const existingReviewId = raw.existingReviewId || raw.groupPeerReviewId;
  const role = raw.role ?? 'MEMBER';

  return {
    matchingMemberId: raw.matchingMemberId || raw.memberId || '',
    userId: raw.userId || raw.revieweeUserId || '',
    fullName: raw.fullName || raw.name || 'Thành viên',
    avatarUrl: raw.avatarUrl,
    role,
    roleLabel: raw.roleLabel || ROLE_LABELS[role],
    isReviewed: Boolean(
      raw.isReviewed ??
        raw.reviewed ??
        raw.hasReviewed ??
        raw.alreadyReviewed ??
        raw.reviewedByCurrentUser ??
        // Có `existingReviewId` nghĩa là bản ghi đánh giá đã tồn tại.
        Boolean(existingReviewId)
    ),
    existingReviewId,
  };
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
    const res = await ApiService<RawPeerReviewCandidate[]>(
      `/matching-groups/${groupId}/peer-reviews/candidates`,
      'GET'
    );
    const data = unwrapResponse(res);
    return Array.isArray(data) ? data.map(mapRawCandidate) : [];
  },

  async getGroupPeerReviews(groupId: string): Promise<PeerReviewItem[]> {
    const res = await ApiService<PeerReviewItem[]>(
      `/matching-groups/${groupId}/peer-reviews`,
      'GET'
    );
    const data = unwrapResponse(res);
    return Array.isArray(data) ? data : [];
  },

  async getUserPeerReviews(userId: string): Promise<PeerReviewItem[]> {
    const res = await ApiService<PeerReviewItem[]>(`/users/${userId}/peer-reviews`, 'GET');
    const data = unwrapResponse(res);
    return Array.isArray(data) ? data : [];
  },
};
