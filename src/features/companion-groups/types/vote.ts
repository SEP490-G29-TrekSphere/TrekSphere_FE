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

/**
 * Mở cuộc bầu Trưởng nhóm mới (voteType luôn là LEADER_ELECTION). Server tự dựng title
 * cố định + option theo candidateMemberIds — không có title/optionLabels tự do như poll.
 */
export interface OpenLeaderElectionPayload {
  reason: string;
  closesAt: string;
  candidateMemberIds: string[];
}

/**
 * Mở biểu quyết giải tán nhóm (voteType luôn là GROUP_DISSOLUTION). Server tự dựng title cố
 * định + đúng 2 option ("Đồng ý"/"Không đồng ý") theo thứ tự cố định — chỉ nhập lý do + hạn.
 */
export interface OpenDissolutionVotePayload {
  reason: string;
  closesAt: string;
}

export interface GetGroupVotesParams {
  voteType?: GroupVoteType;
  status?: GroupVoteStatus;
  page?: number;
  size?: number;
}
