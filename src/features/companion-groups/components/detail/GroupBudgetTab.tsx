import { useGroupCostSummary } from '../../hooks/useGroupBudgetWorkspace';
import { useGroupExpenses } from '../../hooks/useGroupExpenseWorkspace';
import { useGroupBudgetModals } from '../../hooks/useGroupBudgetModals';
import { useGroupSettlement } from '../../hooks/useGroupSettlement';
import type { MatchingGroupDetailResponse } from '../../types/matchingGroup';
import type { GroupExpenseResponse } from '../../types/expense';
import type { CustomJourneyCostItemResponse } from '../../types/workspace';
import {
  AddCostItemModal,
  DeleteCostItemConfirmModal,
  EditCostItemModal,
} from '../workspace/budget';
import {
  CreateExpenseModal,
  EditExpenseModal,
  ExpenseDetailModal,
  VoidExpenseConfirmModal,
} from '../workspace/expense';
import {
  ConfirmSettlementModal,
  RejectSettlementModal,
  SettlementDetailModal,
  SubmitProofModal,
} from '../workspace/settlement';
import {
  GroupBudgetSummarySection,
  GroupCostItemListSection,
  GroupExpenseListSection,
  GroupSettlementSection,
} from './budget';

interface GroupBudgetTabProps {
  group: MatchingGroupDetailResponse;
  isLeader?: boolean;
  isOutsider?: boolean;
  currentUserId?: string;
}

export function GroupBudgetTab({
  group,
  isLeader = false,
  isOutsider = false,
  currentUserId,
}: GroupBudgetTabProps) {
  const groupId = group.matchingGroupId;
  const isCancelled = group.status === 'CANCELLED';
  const isCustomJourney = group.sourceType === 'CUSTOM_JOURNEY' || Boolean(group.customJourneyId);

  // 1. Data queries
  const { data: costSummaryData, isLoading: isLoadingBudget } = useGroupCostSummary(
    isCustomJourney ? groupId : ''
  );
  const { data: expensesData, isLoading: isLoadingExpenses } = useGroupExpenses(
    groupId,
    0,
    50,
    { enabled: !isOutsider }
  );
  const {
    summary: settlementSummary,
    settlements: liveSettlements,
    actionLoading,
    generateSettlements,
    submitProof,
    confirmPayment,
    rejectPayment,
  } = useGroupSettlement({ groupId, autoFetch: !isOutsider });

  // 2. Modal state hook
  const modals = useGroupBudgetModals();

  // 3. Computed cost items & counts
  const liveCostItems: CustomJourneyCostItemResponse[] =
    costSummaryData?.costItems ??
    group.costItems?.map((item) => ({
      customJourneyCostItemId: item.customJourneyCostItemId,
      itemName: item.itemName,
      category: item.category,
      estimatedAmount: item.estimatedAmount,
      note: item.note,
    })) ??
    [];

  const totalItemizedCost =
    costSummaryData?.totalEstimatedCost ??
    liveCostItems.reduce((sum: number, item) => sum + (item.estimatedAmount || 0), 0);
  const plannedMemberCount = costSummaryData?.maxSize || group.maxSize || 1;
  const activeMemberCount =
    group.members?.filter((m) => m.status === 'ACCEPTED').length ||
    costSummaryData?.activeMemberCount ||
    1;
  const effectivePerMemberCost =
    costSummaryData?.estimatedCostPerMember ??
    (plannedMemberCount > 0
      ? Math.round(totalItemizedCost / plannedMemberCount)
      : totalItemizedCost);

  // 4. Computed expenses & settlements
  const actualExpenses = expensesData?.content || [];
  const totalActualSpent =
    settlementSummary?.totalGroupExpense ??
    actualExpenses.reduce((sum: number, exp: GroupExpenseResponse) => sum + (exp.amount || 0), 0);
  const avgActualSpentPerPerson =
    activeMemberCount > 0 ? Math.round(totalActualSpent / activeMemberCount) : 0;

  const persistedSettlements = settlementSummary?.persistedSettlements || liveSettlements || [];
  const suggestedSettlements =
    settlementSummary?.suggestions || settlementSummary?.suggestedSettlements || [];
  const displaySettlements =
    persistedSettlements.length > 0 ? persistedSettlements : suggestedSettlements;

  return (
    <div className="space-y-6">
      {/* ── CARD 1: BUDGET ESTIMATE PLAN ── */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-5">
        <GroupBudgetSummarySection
          isLeader={isLeader}
          isCustomJourney={isCustomJourney}
          isLocked={group.isLocked ?? undefined}
          isCancelled={isCancelled}
          totalItemizedCost={totalItemizedCost}
          plannedMemberCount={plannedMemberCount}
          activeMemberCount={activeMemberCount}
          effectivePerMemberCost={effectivePerMemberCost}
          onOpenAddBudget={() => modals.setIsAddBudgetOpen(true)}
        />
        <GroupCostItemListSection
          isLoadingBudget={isLoadingBudget}
          liveCostItems={liveCostItems}
          plannedMemberCount={plannedMemberCount}
          isLeader={isLeader}
          isCustomJourney={isCustomJourney}
          isLocked={group.isLocked ?? undefined}
          isCancelled={isCancelled}
          onEditItem={(item) => modals.setSelectedItemForEdit(item)}
          onDeleteItem={(item) => modals.setSelectedItemForDelete(item)}
        />
      </div>

      {!isOutsider && (
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-5">
          <GroupExpenseListSection
            isLoadingExpenses={isLoadingExpenses}
            actualExpenses={actualExpenses}
            activeMemberCount={activeMemberCount}
            isLeader={isLeader}
            isCancelled={isCancelled}
            onOpenAddExpense={() => modals.setIsAddExpenseOpen(true)}
            onViewExpenseDetail={(exp) => modals.setSelectedExpenseForDetail(exp)}
            onEditExpense={(exp) => modals.setSelectedExpenseForEdit(exp)}
            onVoidExpense={(exp) => modals.setSelectedExpenseForVoid(exp)}
          />
          <GroupSettlementSection
            settlementSummary={settlementSummary}
            displaySettlements={displaySettlements}
            persistedSettlements={persistedSettlements}
            suggestedSettlements={suggestedSettlements}
            totalActualSpent={totalActualSpent}
            avgActualSpentPerPerson={avgActualSpentPerPerson}
            currentUserId={currentUserId}
            isLeader={isLeader}
            isCancelled={isCancelled}
            actionLoading={actionLoading}
            onGenerateSettlements={generateSettlements}
            onViewSettlementDetail={(st) => modals.setSelectedSettlementForDetail(st)}
            onOpenProof={(st) => modals.setSelectedSettlementForProof(st)}
            onOpenConfirm={(st) => modals.setSelectedSettlementForConfirm(st)}
            onOpenReject={(st) => modals.setSelectedSettlementForReject(st)}
          />
        </div>
      )}

      {/* ── MODALS ── */}
      {isLeader && isCustomJourney && (
        <>
          <AddCostItemModal
            isOpen={modals.isAddBudgetOpen}
            onClose={() => modals.setIsAddBudgetOpen(false)}
            groupId={groupId}
          />
          <EditCostItemModal
            isOpen={Boolean(modals.selectedItemForEdit)}
            onClose={() => modals.setSelectedItemForEdit(null)}
            groupId={groupId}
            costItem={modals.selectedItemForEdit}
          />
          <DeleteCostItemConfirmModal
            isOpen={Boolean(modals.selectedItemForDelete)}
            onClose={() => modals.setSelectedItemForDelete(null)}
            groupId={groupId}
            costItem={modals.selectedItemForDelete}
          />
        </>
      )}

      {!isOutsider && (
        <>
          <ExpenseDetailModal
            isOpen={Boolean(modals.selectedExpenseForDetail)}
            onClose={() => modals.setSelectedExpenseForDetail(null)}
            expense={modals.selectedExpenseForDetail}
          />
          <CreateExpenseModal
            isOpen={modals.isAddExpenseOpen}
            onClose={() => modals.setIsAddExpenseOpen(false)}
            groupId={groupId}
            members={group.members}
            currentUserId={currentUserId}
          />
          <EditExpenseModal
            isOpen={Boolean(modals.selectedExpenseForEdit)}
            onClose={() => modals.setSelectedExpenseForEdit(null)}
            groupId={groupId}
            expense={modals.selectedExpenseForEdit}
            members={group.members}
          />
          <VoidExpenseConfirmModal
            isOpen={Boolean(modals.selectedExpenseForVoid)}
            onClose={() => modals.setSelectedExpenseForVoid(null)}
            groupId={groupId}
            expense={modals.selectedExpenseForVoid}
          />
          <SettlementDetailModal
            isOpen={Boolean(modals.selectedSettlementForDetail)}
            onClose={() => modals.setSelectedSettlementForDetail(null)}
            settlement={modals.selectedSettlementForDetail}
            onOpenProof={(st) => modals.setSelectedSettlementForProof(st)}
            onOpenConfirm={(st) => modals.setSelectedSettlementForConfirm(st)}
            onOpenReject={(st) => modals.setSelectedSettlementForReject(st)}
            currentUserId={currentUserId}
          />
          <SubmitProofModal
            isOpen={Boolean(modals.selectedSettlementForProof)}
            onClose={() => modals.setSelectedSettlementForProof(null)}
            settlement={modals.selectedSettlementForProof}
            onSubmit={submitProof}
            actionLoading={actionLoading}
          />
          <ConfirmSettlementModal
            isOpen={Boolean(modals.selectedSettlementForConfirm)}
            onClose={() => modals.setSelectedSettlementForConfirm(null)}
            settlement={modals.selectedSettlementForConfirm}
            onConfirm={confirmPayment}
            actionLoading={actionLoading}
          />
          <RejectSettlementModal
            isOpen={Boolean(modals.selectedSettlementForReject)}
            onClose={() => modals.setSelectedSettlementForReject(null)}
            settlement={modals.selectedSettlementForReject}
            onReject={rejectPayment}
            actionLoading={actionLoading}
          />
        </>
      )}
    </div>
  );
}
