import type { GroupMemberSummaryResponse } from './expense';

export type SettlementStatus = 'PENDING' | 'PROOF_SUBMITTED' | 'CONFIRMED' | 'REJECTED';
export type BalanceType = 'CREDITOR' | 'DEBTOR' | 'BALANCED';

export interface MemberBalanceResponse {
  member: GroupMemberSummaryResponse;
  totalPaid: number;
  totalShare: number;
  netBalance: number;
  balanceType: BalanceType;
}

export interface SettlementSuggestionResponse {
  fromMember: GroupMemberSummaryResponse;
  toMember: GroupMemberSummaryResponse;
  amount: number;
}

export interface GroupSettlementResponse {
  groupSettlementId: string;
  fromMember: GroupMemberSummaryResponse;
  toMember: GroupMemberSummaryResponse;
  amount: number;
  status: SettlementStatus;
  paymentMethod?: string | null;
  proofUrl?: string | null;
  proofSubmittedAt?: string | null;
  confirmedAt?: string | null;
  rejectReason?: string | null;
  note?: string | null;
  createdAt?: string | null;
}

export interface GroupSettlementSummaryResponse {
  matchingGroupId: string;
  groupTripId?: string;
  totalGroupExpense: number;
  totalSettledAmount?: number;
  totalPendingAmount?: number;
  memberBalances: MemberBalanceResponse[];
  suggestions?: SettlementSuggestionResponse[];
  suggestedSettlements?: SettlementSuggestionResponse[];
  persistedSettlements?: GroupSettlementResponse[];
  isFullySettled?: boolean;
}

export interface GroupSettlementProofRequest {
  proofUrl: string;
  paymentMethod?: string | null;
  note?: string | null;
}

export interface GroupSettlementRejectRequest {
  reason: string;
  rejectReason?: string;
}
