import type { MatchingMemberRole } from './matchingGroup';

export type BeneficiaryScope = 'ALL_MEMBERS' | 'SELECTED_MEMBERS';
export type SplitMethod = 'EQUAL' | 'PERCENTAGE' | 'EXACT' | 'CUSTOM';

export interface GroupMemberSummaryResponse {
  matchingMemberId: string;
  userId: string;
  fullName: string;
  avatarUrl?: string | null;
  role: MatchingMemberRole;
}

export interface GroupExpenseShareResponse {
  expenseShareId: string;
  member: GroupMemberSummaryResponse;
  shareAmount: number;
  isSettled: boolean;
}

export interface GroupExpenseResponse {
  groupExpenseId: string;
  title: string;
  amount: number;
  payer: GroupMemberSummaryResponse;
  beneficiaryScope: BeneficiaryScope;
  beneficiaryCount: number;
  splitMethod: SplitMethod;
  spentAt?: string | null;
  receiptUrl?: string | null;
  note?: string | null;
  shares: GroupExpenseShareResponse[];
  createdAt?: string | null;
}

export interface GroupExpenseSummaryResponse {
  matchingGroupId: string;
  totalExpenseAmount: number;
  totalExpensesCount: number;
  activeMemberCount: number;
  averageExpensePerMember: number;
}

export interface GroupExpenseCustomShareRequest {
  matchingMemberId: string;
  amount: number;
}

export interface GroupExpenseCreateRequest {
  title: string;
  amount: number;
  paidByMemberId?: string | null;
  beneficiaryScope?: BeneficiaryScope;
  beneficiaryMemberIds?: string[];
  splitMethod?: SplitMethod;
  customShares?: GroupExpenseCustomShareRequest[];
  spentAt?: string | null;
  receiptUrl?: string | null;
  note?: string | null;
}

export interface GroupExpenseUpdateRequest {
  title?: string;
  amount?: number;
  paidByMemberId?: string | null;
  beneficiaryScope?: BeneficiaryScope;
  beneficiaryMemberIds?: string[];
  splitMethod?: SplitMethod;
  customShares?: GroupExpenseCustomShareRequest[];
  spentAt?: string | null;
  receiptUrl?: string | null;
  note?: string | null;
}
