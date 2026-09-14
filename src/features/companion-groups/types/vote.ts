// Khớp đúng matching/enums/VoteType.java, VoteStatus.java, GroupVoteResponse.java,
// GroupVoteOptionResponse.java, CreateGroupVoteRequest.java, CastBallotRequest.java phía backend.

export type GroupVoteType = 'LEADER_ELECTION' | 'GROUP_DISSOLUTION' | 'OTHER';

export type GroupVoteStatus = 'OPEN' | 'CLOSED';

export interface GroupVoteOptionResponse {
  groupVoteOptionId: string;
  optionOrder: number;
  optionLabel: string;
  candidateMemberId: string | null;
  candidateMemberName: string | null;
  ballotCount: number;
}

export interface GroupVoteResponse {
  groupVoteId: string;
  matchingGroupId: string;
  voteType: GroupVoteType;
  title: string;
  reason: string;
  createdByMemberId: string;
  createdByName: string;
  status: GroupVoteStatus;
  opensAt: string;
  closesAt: string;
  eligibleVoterCount: number;
  winningOptionId: string | null;
  closedAt: string | null;
  options: GroupVoteOptionResponse[];
  /** Option mà người xem hiện tại đã bỏ phiếu, null nếu chưa vote. */
  myBallotOptionId: string | null;
  createdAt: string;
  updatedAt: string | null;
}

/** Tạo bình chọn chung (voteType luôn là OTHER — election/dissolution do server tự dựng option). */
export interface CreateGroupVotePayload {
  title: string;
  reason: string;
  closesAt: string;
  optionLabels: string[];
}

export interface CastBallotPayload {
  optionId: string;
}

export interface GetGroupVotesParams {
  voteType?: GroupVoteType;
  status?: GroupVoteStatus;
  page?: number;
  size?: number;
}
