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

  myBallotOptionId: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateGroupVotePayload {
  title: string;
  reason?: string;
  closesAt: string;
  optionLabels: string[];
}

export interface CastBallotPayload {
  optionId: string;
}

export interface OpenLeaderElectionPayload {
  reason: string;
  closesAt: string;
  candidateMemberIds: string[];
}

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
