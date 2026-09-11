import {
  ArrowRightLeft,
  Bus,
  Calculator,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  Compass,
  FileText,
  Pencil,
  Plus,
  Receipt,
  Send,
  ShieldCheck,
  Tent,
  Trash2,
  Upload,
  UserCheck,
  Users,
  UtensilsCrossed,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useGroupCostSummary } from '../../hooks/useGroupBudgetWorkspace';
import { useGroupExpenses } from '../../hooks/useGroupExpenseWorkspace';
import { useGroupSettlement } from '../../hooks/useGroupSettlement';
import type { GroupExpenseResponse } from '../../types/expense';
import type { CostItemCategory, MatchingGroupDetailResponse } from '../../types/matchingGroup';
import type { GroupSettlementResponse } from '../../types/settlement';
import type { CustomJourneyCostItemResponse } from '../../types/workspace';
import {
  AddCostItemModal,
  DeleteCostItemConfirmModal,
  EditCostItemModal,
} from '../workspace/budget';
import {
  CreateExpenseModal,
  EditExpenseModal,
  VoidExpenseConfirmModal,
} from '../workspace/expense';
import {
  ConfirmSettlementModal,
  RejectSettlementModal,
  SubmitProofModal,
} from '../workspace/settlement';
import { MemberAvatar } from './MemberAvatar';

interface GroupBudgetTabProps {
  group: MatchingGroupDetailResponse;
  isLeader?: boolean;
  currentUserId?: string;
}

const CATEGORY_META: Record<
  CostItemCategory | 'trans' | 'food' | 'gear' | 'other',
  { label: string; icon: typeof CircleDollarSign; colorClass: string }
> = {
  PERMIT: {
    label: 'Giấy phép & Phí',
    icon: ShieldCheck,
    colorClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
  },
  GUIDE: {
    label: 'HDV & Porter',
    icon: Compass,
    colorClass: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
  },
  FOOD: {
    label: 'Ăn Uống BBQ',
    icon: UtensilsCrossed,
    colorClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
  },
  TRANSPORT: {
    label: 'Di Chuyển',
    icon: Bus,
    colorClass: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
  },
  GEAR: {
    label: 'Dụng Cụ Lều',
    icon: Tent,
    colorClass: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20',
  },
  OTHER: {
    label: 'Chi Phí Khác',
    icon: CircleDollarSign,
    colorClass: 'bg-muted text-muted-foreground border-border',
  },
  trans: {
    label: 'Di Chuyển',
    icon: Bus,
    colorClass: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
  },
  food: {
    label: 'Ăn Uống BBQ',
    icon: UtensilsCrossed,
    colorClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
  },
  gear: {
    label: 'Dụng Cụ Lều',
    icon: Tent,
    colorClass: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20',
  },
  other: {
    label: 'Chi Phí Khác',
    icon: CircleDollarSign,
    colorClass: 'bg-muted text-muted-foreground border-border',
  },
};

export function GroupBudgetTab({ group, isLeader = false, currentUserId }: GroupBudgetTabProps) {
  const groupId = group.matchingGroupId;
  const isCustomJourney = group.sourceType === 'CUSTOM_JOURNEY' || Boolean(group.customJourneyId);

  // 1. Budget Plan Data
  const { data: costSummaryData, isLoading: isLoadingBudget } = useGroupCostSummary(
    isCustomJourney ? groupId : ''
  );

  // 2. Actual Expenses Data
  const { data: expensesData, isLoading: isLoadingExpenses } = useGroupExpenses(groupId, 0, 50);

  // 3. Settlement Data
  const {
    summary: settlementSummary,
    settlements: liveSettlements,
    actionLoading,
    generateSettlements,
    submitProof,
    confirmPayment,
    rejectPayment,
  } = useGroupSettlement({ groupId });

  // Modal States - Budget Plan
  const [isAddBudgetOpen, setIsAddBudgetOpen] = useState(false);
  const [selectedItemForEdit, setSelectedItemForEdit] =
    useState<CustomJourneyCostItemResponse | null>(null);
  const [selectedItemForDelete, setSelectedItemForDelete] =
    useState<CustomJourneyCostItemResponse | null>(null);

  // Modal States - Actual Expenses
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [selectedExpenseForEdit, setSelectedExpenseForEdit] = useState<GroupExpenseResponse | null>(
    null
  );
  const [selectedExpenseForVoid, setSelectedExpenseForVoid] = useState<GroupExpenseResponse | null>(
    null
  );

  // Modal States - Settlements
  const [selectedSettlementForProof, setSelectedSettlementForProof] =
    useState<GroupSettlementResponse | null>(null);
  const [selectedSettlementForConfirm, setSelectedSettlementForConfirm] =
    useState<GroupSettlementResponse | null>(null);
  const [selectedSettlementForReject, setSelectedSettlementForReject] =
    useState<GroupSettlementResponse | null>(null);

  // Computed Values - Budget Plan
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
    liveCostItems.reduce((sum, item) => sum + (item.estimatedAmount || 0), 0);

  const memberCount =
    group.members?.filter((m) => m.status === 'ACCEPTED').length ||
    costSummaryData?.maxSize ||
    group.maxSize ||
    1;

  const effectivePerMemberCost =
    costSummaryData?.estimatedCostPerMember ??
    (memberCount > 0 ? Math.round(totalItemizedCost / memberCount) : totalItemizedCost);

  // Computed Values - Actual Expenses & Settlement
  const actualExpenses = expensesData?.content || [];
  const totalActualSpent =
    settlementSummary?.totalGroupExpense ??
    actualExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const avgActualSpentPerPerson = memberCount > 0 ? Math.round(totalActualSpent / memberCount) : 0;

  const persistedSettlements = settlementSummary?.persistedSettlements || liveSettlements || [];
  const suggestedSettlements =
    settlementSummary?.suggestions || settlementSummary?.suggestedSettlements || [];
  const displaySettlements =
    persistedSettlements.length > 0 ? persistedSettlements : suggestedSettlements;

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* CARD 1: KẾ HOẠCH DỰ TOÁN & CHIA SẺ CHI PHÍ */}
      {/* ========================================================= */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <Calculator className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Kế Hoạch Dự Toán & Chia Sẻ Chi Phí
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Định mức chi phí chuyến đi được tính tự động dựa trên số lượng thành viên ghép thực tế
            </p>
          </div>
          {isLeader && isCustomJourney && !group.isLocked ? (
            <button
              type="button"
              onClick={() => setIsAddBudgetOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Thêm Khoản Chi Mới
            </button>
          ) : (
            <span
              className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-border px-3 py-2 text-[11px] font-bold text-muted-foreground"
              title="Chỉ Leader được sửa dự toán chung của nhóm"
            >
              Chỉ Leader chỉnh dự toán
            </span>
          )}
        </div>

        {/* METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-1">
            <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
              Tổng Chi Phí Đoàn
            </span>
            <div className="text-xl font-black text-foreground">
              {totalItemizedCost.toLocaleString('vi-VN')}đ
            </div>
          </div>

          <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-1">
            <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1">
              <Users className="h-3 w-3 text-muted-foreground" />
              Sĩ Số Nhóm Ghép
            </span>
            <div className="text-xl font-black text-foreground">{memberCount} Trekker</div>
          </div>

          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-1">
            <span className="text-[10px] font-bold tracking-wider text-emerald-700 dark:text-emerald-300 uppercase">
              Dự Toán / Trekker
            </span>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              {effectivePerMemberCost.toLocaleString('vi-VN')}đ
            </div>
          </div>
        </div>

        {/* BUDGET TABLE */}
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 font-bold text-muted-foreground border-b border-border">
              <tr>
                <th className="p-3">Danh Mục</th>
                <th className="p-3">Khoản Chi Tiêu</th>
                <th className="p-3">Tổng Chi Phí</th>
                <th className="p-3">Quy Tắc Chia</th>
                <th className="p-3">Phần / Người</th>
                <th className="p-3">Ghi Chú</th>
                <th className="p-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoadingBudget ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-muted-foreground">
                    Đang tải dữ liệu dự toán...
                  </td>
                </tr>
              ) : liveCostItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-muted-foreground">
                    Chưa có khoản dự toán nào. Hãy bấm &quot;Thêm Khoản Chi Mới&quot; để thiết lập.
                  </td>
                </tr>
              ) : (
                liveCostItems.map((item, idx) => {
                  const meta = CATEGORY_META[item.category] ?? CATEGORY_META.OTHER;
                  const Icon = meta.icon;
                  const perPerson = Math.round(item.estimatedAmount / (memberCount || 1));

                  return (
                    <tr
                      key={item.customJourneyCostItemId || `budget-${idx}`}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-3 whitespace-nowrap">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border',
                            meta.colorClass
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {meta.label}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-foreground">{item.itemName}</td>
                      <td className="p-3 font-extrabold text-foreground whitespace-nowrap">
                        {item.estimatedAmount.toLocaleString('vi-VN')}đ
                      </td>
                      <td className="p-3 text-muted-foreground whitespace-nowrap">
                        Chia đều {memberCount} người
                      </td>
                      <td className="p-3 font-extrabold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        {perPerson.toLocaleString('vi-VN')}đ
                      </td>
                      <td className="p-3 text-muted-foreground max-w-[200px] truncate">
                        {item.note || '-'}
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        {isLeader && isCustomJourney && !group.isLocked ? (
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setSelectedItemForEdit(item)}
                              className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition cursor-pointer"
                              title="Sửa"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedItemForDelete(item)}
                              className="p-1.5 text-rose-500 hover:text-rose-600 rounded-lg hover:bg-rose-500/10 transition cursor-pointer"
                              title="Xóa"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground italic">Chỉ xem</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* CARD 2: HÓA ĐƠN THỰC TẾ & GREEDY DEBT SETTLEMENT */}
      {/* ========================================================= */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <Receipt className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              Hóa Đơn Thực Tế & Greedy Debt Settlement
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ghi nhận các khoản ứng trước thực tế để tự động tính đối trừ giao dịch P2P tối ưu
            </p>
          </div>
          {isLeader && (
            <button
              type="button"
              onClick={() => setIsAddExpenseOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white dark:bg-purple-600 px-4 py-2 text-xs font-bold hover:bg-slate-800 dark:hover:bg-purple-700 transition shadow-xs cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Nhập Hóa Đơn
            </button>
          )}
        </div>

        {/* ACTUAL EXPENSES TABLE */}
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 font-bold text-muted-foreground border-b border-border">
              <tr>
                <th className="p-3">Khoản Chi Phát Sinh</th>
                <th className="p-3">Người Đã Ứng Tiền</th>
                <th className="p-3">Số Tiền Thực Tế</th>
                <th className="p-3">Người Được Chi</th>
                <th className="p-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoadingExpenses ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-xs text-muted-foreground">
                    Đang tải danh sách hóa đơn...
                  </td>
                </tr>
              ) : actualExpenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-xs text-muted-foreground">
                    Chưa có hóa đơn thực tế nào. Bấm &quot;Nhập Hóa Đơn&quot; để thêm khoản đã ứng.
                  </td>
                </tr>
              ) : (
                actualExpenses.map((exp) => {
                  const actualSharesCount =
                    exp.shares && exp.shares.length > 0
                      ? exp.shares.length
                      : exp.beneficiaryCount || 0;
                  const beneficiaryCount = actualSharesCount > 0 ? actualSharesCount : memberCount;
                  const isWholeGroup =
                    exp.beneficiaryScope === 'ALL_MEMBERS'
                      ? actualSharesCount === memberCount || actualSharesCount === 0
                      : beneficiaryCount >= memberCount;
                  const isSingleBeneficiary =
                    beneficiaryCount === 1 && exp.shares && exp.shares.length === 1;
                  const singleBeneficiary = isSingleBeneficiary ? exp.shares[0].member : null;
                  const isPaidOnBehalf =
                    isSingleBeneficiary &&
                    singleBeneficiary &&
                    singleBeneficiary.matchingMemberId !== exp.payer.matchingMemberId;
                  const isCustomSplit =
                    exp.splitMethod === 'CUSTOM' ||
                    exp.splitMethod === 'EXACT' ||
                    exp.splitMethod === 'PERCENTAGE';

                  return (
                    <tr key={exp.groupExpenseId} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-bold text-foreground">
                        <div className="flex items-center gap-2.5">
                          {exp.receiptUrl ? (
                            <a
                              href={exp.receiptUrl}
                              target="_blank"
                              rel="noreferrer"
                              title="Xem ảnh hóa đơn"
                              className="shrink-0"
                            >
                              <img
                                src={exp.receiptUrl}
                                alt={exp.title}
                                className="h-8 w-8 rounded-lg object-cover border border-border"
                              />
                            </a>
                          ) : (
                            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0 border border-border">
                              <FileText className="h-4 w-4" />
                            </div>
                          )}
                          <span className="truncate max-w-[240px]">{exp.title}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground">
                          <UserCheck className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                          {exp.payer.fullName}
                        </span>
                      </td>
                      <td className="p-3 font-extrabold text-foreground whitespace-nowrap">
                        {exp.amount.toLocaleString('vi-VN')}đ
                      </td>
                      <td className="p-3 text-muted-foreground">
                        <div className="space-y-0.5">
                          {/* Heading Label */}
                          <div className="flex items-center gap-1.5 whitespace-nowrap">
                            <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            {isCustomSplit ? (
                              <span className="inline-flex items-center gap-1.5">
                                <span className="rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                  Tùy chỉnh
                                </span>
                                <span className="text-foreground font-semibold">
                                  {beneficiaryCount}/{memberCount} người
                                </span>
                              </span>
                            ) : isSingleBeneficiary && singleBeneficiary ? (
                              <span className="text-foreground font-semibold text-xs">
                                {isPaidOnBehalf
                                  ? `Chi hộ ${singleBeneficiary.fullName}`
                                  : `Chi riêng cho ${singleBeneficiary.fullName}`}
                                <span className="text-[10px] text-muted-foreground font-normal ml-1">
                                  (1/{memberCount} người)
                                </span>
                              </span>
                            ) : isWholeGroup ? (
                              <span>Chia đều cả đoàn ({memberCount} người)</span>
                            ) : (
                              <span>
                                Chia đều {beneficiaryCount}/{memberCount} người
                              </span>
                            )}
                          </div>

                          {/* Detail breakdown */}
                          {isCustomSplit && exp.shares && exp.shares.length > 0 ? (
                            <div className="text-[11px] text-muted-foreground flex flex-wrap gap-x-2 gap-y-0.5 pt-0.5">
                              {exp.shares.map((s, sIdx) => (
                                <span key={s.expenseShareId || sIdx}>
                                  {s.member.fullName}:{' '}
                                  <strong className="text-foreground font-bold">
                                    {s.shareAmount.toLocaleString('vi-VN')}đ
                                  </strong>
                                  {sIdx < exp.shares.length - 1 ? ',' : ''}
                                </span>
                              ))}
                            </div>
                          ) : !isWholeGroup &&
                            !isSingleBeneficiary &&
                            exp.shares &&
                            exp.shares.length > 0 ? (
                            <div className="text-[10px] font-bold text-primary">
                              ({exp.shares.map((s) => s.member.fullName).join(', ')})
                            </div>
                          ) : null}
                        </div>
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        {isLeader ? (
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setSelectedExpenseForEdit(exp)}
                              className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition cursor-pointer"
                              title="Sửa"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedExpenseForVoid(exp)}
                              className="p-1.5 text-rose-500 hover:text-rose-600 rounded-lg hover:bg-rose-500/10 transition cursor-pointer"
                              title="Xóa"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground italic">Chỉ xem</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* MEMBER NET BALANCES LIST */}
        {settlementSummary &&
          settlementSummary.memberBalances &&
          settlementSummary.memberBalances.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Calculator className="h-3.5 w-3.5" />
                  Bảng Số Dư Công Nợ Thành Viên ({settlementSummary.memberBalances.length} người)
                </h4>
                <span className="text-[11px] text-muted-foreground italic">
                  Số dư = Đã ứng trước - Phần phải chịu
                </span>
              </div>

              <div className="divide-y divide-border rounded-xl border border-border bg-background overflow-hidden">
                {settlementSummary.memberBalances.map((mb) => {
                  const isCurrentUser = mb.member.userId === currentUserId;
                  const isCreditor = mb.balanceType === 'CREDITOR' || mb.netBalance > 0.01;
                  const isDebtor = mb.balanceType === 'DEBTOR' || mb.netBalance < -0.01;

                  return (
                    <div
                      key={mb.member.matchingMemberId}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 gap-3 text-xs hover:bg-muted/30 transition-colors ${
                        isCurrentUser ? 'bg-primary/5' : ''
                      }`}
                    >
                      {/* Member Info */}
                      <div className="flex items-center gap-3">
                        <MemberAvatar
                          fullName={mb.member.fullName}
                          avatarUrl={mb.member.avatarUrl ?? undefined}
                          size="md"
                        />
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-foreground text-sm">
                              {mb.member.fullName}
                            </span>
                            {isCurrentUser && (
                              <span className="rounded-full bg-primary/20 px-2 py-0.2 text-[9px] font-black text-primary">
                                Bạn
                              </span>
                            )}
                            <span className="text-[10px] text-muted-foreground font-medium">
                              • {mb.member.role === 'LEADER' ? 'Trưởng nhóm' : 'Thành viên'}
                            </span>
                          </div>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                            <span>
                              Đã ứng:{' '}
                              <strong className="text-foreground font-semibold">
                                {mb.totalPaid.toLocaleString('vi-VN')}đ
                              </strong>
                            </span>
                            <span>•</span>
                            <span>
                              Phần phải chịu:{' '}
                              <strong className="text-foreground font-semibold">
                                {mb.totalShare.toLocaleString('vi-VN')}đ
                              </strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Net Balance & Status Badge */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-center">
                        <div className="text-right">
                          <div className="text-[10px] text-muted-foreground uppercase font-semibold">
                            Số dư ròng
                          </div>
                          <div
                            className={`text-sm font-black ${
                              isCreditor
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : isDebtor
                                  ? 'text-rose-600 dark:text-rose-400'
                                  : 'text-muted-foreground'
                            }`}
                          >
                            {mb.netBalance > 0.01
                              ? `+${mb.netBalance.toLocaleString('vi-VN')}đ`
                              : mb.netBalance < -0.01
                                ? `${mb.netBalance.toLocaleString('vi-VN')}đ`
                                : '0đ'}
                          </div>
                        </div>

                        <div className="min-w-[100px] text-center">
                          {isCreditor ? (
                            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              Được nhận lại
                            </span>
                          ) : isDebtor ? (
                            <span className="inline-flex items-center rounded-full bg-rose-500/10 px-2.5 py-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 border border-rose-500/20">
                              Cần thanh toán
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-[11px] font-bold text-muted-foreground border border-border">
                              Đã cân bằng
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        {/* GREEDY DEBT SETTLEMENT BANNER */}
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs sm:text-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Kết Quả Tối Ưu Hóa Giao Dịch P2P (Greedy Settlement Algorithm):
            </div>
            {isLeader && suggestedSettlements.length > 0 && persistedSettlements.length === 0 && (
              <button
                type="button"
                onClick={generateSettlements}
                disabled={actionLoading}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-700 transition cursor-pointer disabled:opacity-50"
              >
                Khởi tạo quyết toán
              </button>
            )}
          </div>

          <div className="text-xs text-foreground leading-relaxed space-y-1.5 border-t border-emerald-500/20 pt-3">
            <div>
              • Tổng chi thực tế cả đoàn:{' '}
              <strong className="text-emerald-700 dark:text-emerald-400 font-black">
                {totalActualSpent.toLocaleString('vi-VN')}đ
              </strong>{' '}
              (Trung bình{' '}
              <strong className="text-foreground">
                {avgActualSpentPerPerson.toLocaleString('vi-VN')}đ / Trekker
              </strong>
              ).
            </div>
            <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-bold">
              <ArrowRightLeft className="h-4 w-4 text-emerald-600 shrink-0" />
              Đã tối ưu hóa còn {displaySettlements.length} giao dịch trực tiếp giữa các thành viên:
            </div>
          </div>

          {/* DETAILED P2P SETTLEMENT TRANSACTIONS */}
          <div className="space-y-2.5 pt-1">
            <h4 className="text-[11px] font-extrabold tracking-wider uppercase text-emerald-900 dark:text-emerald-300">
              Danh Sách Giao Dịch Bù Trừ NỢ TRỰC TIẾP
            </h4>
            <div className="divide-y divide-emerald-500/20 rounded-xl border border-emerald-500/20 bg-background/80 overflow-hidden">
              {displaySettlements.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  Chưa có giao dịch bù trừ nào cần thực hiện (Tất cả đã cân bằng).
                </div>
              ) : (
                displaySettlements.map((st, idx) => {
                  const isDebtor = st.fromMember.userId === currentUserId;
                  const isPayee = st.toMember.userId === currentUserId;
                  const isPersisted = 'groupSettlementId' in st;
                  const persistedSt = isPersisted ? (st as GroupSettlementResponse) : null;

                  return (
                    <div
                      key={persistedSt ? persistedSt.groupSettlementId : `suggest-${idx}`}
                      className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/20 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-foreground text-xs">
                            {st.fromMember.fullName}
                          </span>
                          <span className="text-xs text-muted-foreground font-medium">
                            chuyển cho
                          </span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                            {st.toMember.fullName}
                          </span>
                          <span className="font-black text-rose-600 text-xs bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                            {st.amount.toLocaleString('vi-VN')}đ
                          </span>
                        </div>

                        {persistedSt && (
                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> Hạn thanh toán: Sau khi kết thúc chuyến
                              đi
                            </span>
                          </div>
                        )}
                      </div>

                      {/* STATUS & ACTIONS */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {persistedSt ? (
                          <>
                            {persistedSt.status === 'CONFIRMED' && (
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                                <CheckCircle2 className="h-4 w-4" /> Đã hoàn tất
                              </span>
                            )}

                            {persistedSt.status === 'PROOF_SUBMITTED' && !isPayee && (
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-500/10 px-3 py-1.5 rounded-xl border border-blue-500/20">
                                <Send className="h-3.5 w-3.5" /> Đã gửi chứng từ (Chờ xác nhận)
                              </span>
                            )}

                            {isDebtor &&
                              (persistedSt.status === 'PENDING' ||
                                persistedSt.status === 'REJECTED') && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedSettlementForProof(persistedSt)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-[11px] transition shadow-xs cursor-pointer"
                                >
                                  <Upload className="h-3.5 w-3.5" /> Nộp chứng từ
                                </button>
                              )}

                            {isPayee && persistedSt.status === 'PROOF_SUBMITTED' && (
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setSelectedSettlementForReject(persistedSt)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-destructive/30 text-destructive hover:bg-destructive/10 font-bold text-[11px] transition cursor-pointer"
                                >
                                  <XCircle className="h-3.5 w-3.5" /> Từ chối
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSelectedSettlementForConfirm(persistedSt)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition shadow-xs cursor-pointer"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" /> Xác nhận đã nhận
                                </button>
                              </div>
                            )}

                            {persistedSt.status === 'PENDING' && !isDebtor && (
                              <span className="text-[11px] font-bold text-muted-foreground italic px-2">
                                Chờ chuyển tiền
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 italic px-2">
                            Đề xuất tối ưu
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODALS */}
      {/* ========================================================= */}
      {/* Budget Plan Modals */}
      {isLeader && isCustomJourney && (
        <>
          <AddCostItemModal
            isOpen={isAddBudgetOpen}
            onClose={() => setIsAddBudgetOpen(false)}
            groupId={groupId}
          />
          <EditCostItemModal
            isOpen={Boolean(selectedItemForEdit)}
            onClose={() => setSelectedItemForEdit(null)}
            groupId={groupId}
            costItem={selectedItemForEdit}
          />
          <DeleteCostItemConfirmModal
            isOpen={Boolean(selectedItemForDelete)}
            onClose={() => setSelectedItemForDelete(null)}
            groupId={groupId}
            costItem={selectedItemForDelete}
          />
        </>
      )}

      {/* Actual Expense Modals */}
      <CreateExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        groupId={groupId}
        members={group.members}
        currentUserId={currentUserId}
      />
      <EditExpenseModal
        isOpen={Boolean(selectedExpenseForEdit)}
        onClose={() => setSelectedExpenseForEdit(null)}
        groupId={groupId}
        expense={selectedExpenseForEdit}
        members={group.members}
      />
      <VoidExpenseConfirmModal
        isOpen={Boolean(selectedExpenseForVoid)}
        onClose={() => setSelectedExpenseForVoid(null)}
        groupId={groupId}
        expense={selectedExpenseForVoid}
      />

      {/* Settlement Modals */}
      <SubmitProofModal
        isOpen={Boolean(selectedSettlementForProof)}
        onClose={() => setSelectedSettlementForProof(null)}
        settlement={selectedSettlementForProof}
        onSubmit={submitProof}
        actionLoading={actionLoading}
      />
      <ConfirmSettlementModal
        isOpen={Boolean(selectedSettlementForConfirm)}
        onClose={() => setSelectedSettlementForConfirm(null)}
        settlement={selectedSettlementForConfirm}
        onConfirm={confirmPayment}
        actionLoading={actionLoading}
      />
      <RejectSettlementModal
        isOpen={Boolean(selectedSettlementForReject)}
        onClose={() => setSelectedSettlementForReject(null)}
        settlement={selectedSettlementForReject}
        onReject={rejectPayment}
        actionLoading={actionLoading}
      />
    </div>
  );
}
