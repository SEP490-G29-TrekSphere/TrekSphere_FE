import { useState } from 'react';
import type { GroupExpenseResponse } from '../types/expense';
import type { GroupSettlementResponse } from '../types/settlement';
import type { CustomJourneyCostItemResponse } from '../types/workspace';

/**
 * Custom hook to manage open/close dialog states and selected entities
 * for the Group Budget, Expense, and Settlement workflows.
 */
export function useGroupBudgetModals() {
  // Modal States - Budget Plan
  const [isAddBudgetOpen, setIsAddBudgetOpen] = useState(false);
  const [selectedItemForEdit, setSelectedItemForEdit] =
    useState<CustomJourneyCostItemResponse | null>(null);
  const [selectedItemForDelete, setSelectedItemForDelete] =
    useState<CustomJourneyCostItemResponse | null>(null);

  // Modal States - Actual Expenses
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [selectedExpenseForDetail, setSelectedExpenseForDetail] =
    useState<GroupExpenseResponse | null>(null);
  const [selectedExpenseForEdit, setSelectedExpenseForEdit] = useState<GroupExpenseResponse | null>(
    null
  );
  const [selectedExpenseForVoid, setSelectedExpenseForVoid] = useState<GroupExpenseResponse | null>(
    null
  );

  // Modal States - Settlements
  const [selectedSettlementForDetail, setSelectedSettlementForDetail] =
    useState<GroupSettlementResponse | null>(null);
  const [selectedSettlementForProof, setSelectedSettlementForProof] =
    useState<GroupSettlementResponse | null>(null);
  const [selectedSettlementForConfirm, setSelectedSettlementForConfirm] =
    useState<GroupSettlementResponse | null>(null);
  const [selectedSettlementForReject, setSelectedSettlementForReject] =
    useState<GroupSettlementResponse | null>(null);

  return {
    isAddBudgetOpen,
    setIsAddBudgetOpen,
    selectedItemForEdit,
    setSelectedItemForEdit,
    selectedItemForDelete,
    setSelectedItemForDelete,

    isAddExpenseOpen,
    setIsAddExpenseOpen,
    selectedExpenseForDetail,
    setSelectedExpenseForDetail,
    selectedExpenseForEdit,
    setSelectedExpenseForEdit,
    selectedExpenseForVoid,
    setSelectedExpenseForVoid,

    selectedSettlementForDetail,
    setSelectedSettlementForDetail,
    selectedSettlementForProof,
    setSelectedSettlementForProof,
    selectedSettlementForConfirm,
    setSelectedSettlementForConfirm,
    selectedSettlementForReject,
    setSelectedSettlementForReject,
  };
}
