import {
  Calendar,
  DollarSign,
  Edit2,
  Eye,
  Info,
  Plus,
  Receipt,
  Trash2,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import { useState } from 'react';
import { AppEmptyState, AppSpinner } from '@/shared/ui';
import { useGroupExpenseSummary, useGroupExpenses } from '../../../hooks/useGroupExpenseWorkspace';
import type { GroupExpenseResponse } from '../../../types/expense';
import type { MatchingGroupDetailResponse } from '../../../types/matchingGroup';
import { CreateExpenseModal } from './CreateExpenseModal';
import { EditExpenseModal } from './EditExpenseModal';
import { ExpenseDetailModal } from './ExpenseDetailModal';
import { VoidExpenseConfirmModal } from './VoidExpenseConfirmModal';

interface GroupExpenseTabProps {
  group: MatchingGroupDetailResponse;
  isLeader: boolean;
  currentUserId?: string;
}

export function GroupExpenseTab({ group, isLeader, currentUserId }: GroupExpenseTabProps) {
  const groupId = group.matchingGroupId;

  const [page, setPage] = useState(0);
  const size = 20;

  const { data: expensesData, isLoading: isLoadingExpenses } = useGroupExpenses(
    groupId,
    page,
    size
  );
  const { data: summaryData, isLoading: isLoadingSummary } = useGroupExpenseSummary(groupId);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedExpenseForDetail, setSelectedExpenseForDetail] =
    useState<GroupExpenseResponse | null>(null);
  const [selectedExpenseForEdit, setSelectedExpenseForEdit] = useState<GroupExpenseResponse | null>(
    null
  );
  const [selectedExpenseForVoid, setSelectedExpenseForVoid] = useState<GroupExpenseResponse | null>(
    null
  );

  const expenses = expensesData?.content || [];
  const totalElements = expensesData?.totalElements || 0;
  const totalPages = expensesData?.totalPages || 0;
  const summary = summaryData;

  const activeMembersCount = group.members.filter((m) => m.status === 'ACCEPTED').length;

  return (
    <div className="space-y-6">
      {/* 1. Header Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Expense */}
        <div className="rounded-3xl border border-border bg-card p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Tổng chi tiêu thực tế
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-foreground">
            {isLoadingSummary ? (
              <span className="text-muted-foreground text-sm">Đang tính...</span>
            ) : (
              `${(summary?.totalExpenseAmount || 0).toLocaleString('vi-VN')} đ`
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Tổng cộng {summary?.totalExpensesCount || 0} khoản chi đã ghi nhận
          </p>
        </div>

        {/* Average Per Member */}
        <div className="rounded-3xl border border-border bg-card p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Bình quân / Thành viên
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-foreground">
            {isLoadingSummary ? (
              <span className="text-muted-foreground text-sm">Đang tính...</span>
            ) : (
              `${(summary?.averageExpensePerMember || 0).toLocaleString('vi-VN')} đ`
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Phân bổ trên {summary?.activeMemberCount || activeMembersCount || 1} thành viên
          </p>
        </div>

        {/* Estimated Budget Comparison */}
        <div className="rounded-3xl border border-border bg-card p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Dự toán ban đầu
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-foreground">
            {group.estimatedCost ? `${group.estimatedCost.toLocaleString('vi-VN')} đ` : 'Chưa đặt'}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {group.estimatedCost && summary?.totalExpenseAmount
              ? `${Math.round((summary.totalExpenseAmount / group.estimatedCost) * 100)}% so với dự toán`
              : 'Chi phí ước tính chuyến đi'}
          </p>
        </div>

        {/* Active Members count */}
        <div className="rounded-3xl border border-border bg-card p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Thành viên tham gia
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-foreground">
            {activeMembersCount}{' '}
            <span className="text-sm font-normal text-muted-foreground">người</span>
          </div>
          <p className="text-[11px] text-muted-foreground">Tất cả thành viên chính thức của nhóm</p>
        </div>
      </div>

      {/* 2. Transparency Notice */}
      <div className="flex items-start gap-3 rounded-2xl border border-border bg-muted/20 p-4 text-xs text-muted-foreground">
        <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold text-foreground">Nguyên tắc minh bạch tài chính nhóm ghép</p>
          <p className="text-[11px] leading-relaxed">
            Chỉ <strong>Trưởng nhóm (Leader)</strong> có quyền ghi nhận, chỉnh sửa hoặc hủy các hóa
            đơn chi tiêu thực tế. Mọi thành viên trong nhóm đều có thể theo dõi chi tiết hóa đơn,
            người chi trả và công nợ chia sẻ theo thời gian thực.
          </p>
        </div>
      </div>

      {/* 3. Expense List Table & Action Bar */}
      <div className="rounded-3xl border border-border bg-card p-5 shadow-xs space-y-4">
        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <Receipt className="h-4 w-4 text-primary" /> Sổ chi tiêu thực tế
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Danh sách các khoản tiền phát sinh trong chuyến đi và chi tiết phần chia
            </p>
          </div>

          {isLeader && (
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 transition cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Thêm khoản chi mới
            </button>
          )}
        </div>

        {/* Content Table / Cards */}
        {isLoadingExpenses ? (
          <div className="py-12 flex justify-center">
            <AppSpinner size="lg" />
          </div>
        ) : expenses.length === 0 ? (
          <div className="py-8 text-center space-y-4">
            <AppEmptyState
              icon={Receipt}
              title="Chưa có khoản chi tiêu nào"
              description={
                isLeader
                  ? 'Hãy bấm "Thêm khoản chi mới" để bắt đầu ghi nhận các hóa đơn phát sinh trong chuyến đi.'
                  : 'Trưởng nhóm chưa ghi nhận khoản chi tiêu nào cho chuyến đi này.'
              }
            />
            {isLeader && (
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition cursor-pointer shadow-xs"
              >
                <Plus className="h-4 w-4" /> Thêm khoản chi đầu tiên
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="divide-y divide-border rounded-2xl border border-border bg-background overflow-hidden">
              {expenses.map((expense) => {
                const spentDateStr = expense.spentAt
                  ? new Date(expense.spentAt).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })
                  : 'N/A';

                return (
                  <div
                    key={expense.groupExpenseId}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 hover:bg-muted/20 transition-colors"
                  >
                    {/* Left: Info */}
                    <div className="flex items-start gap-3.5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary font-bold">
                        <Receipt className="h-5 w-5" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-extrabold text-foreground text-sm">
                            {expense.title}
                          </h4>
                          <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                            {expense.beneficiaryScope === 'ALL_MEMBERS'
                              ? `Cả đoàn (${expense.beneficiaryCount} người)`
                              : `Chọn người (${expense.beneficiaryCount} người)`}
                          </span>
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                              expense.splitMethod === 'CUSTOM'
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                : 'bg-primary/10 text-primary border border-primary/20'
                            }`}
                          >
                            {expense.splitMethod === 'CUSTOM' ? 'Tùy chỉnh' : 'Chia đều'}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                          <span>
                            Người chi:{' '}
                            <strong className="text-foreground font-semibold">
                              {expense.payer.fullName}
                            </strong>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {spentDateStr}
                          </span>
                          {expense.note && (
                            <>
                              <span>•</span>
                              <span className="max-w-xs truncate italic text-[11px]">
                                &ldquo;{expense.note}&rdquo;
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Amount & Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pl-13 sm:pl-0">
                      <div className="text-left sm:text-right">
                        <div className="text-base font-black text-primary">
                          {expense.amount.toLocaleString('vi-VN')} đ
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {Math.round(
                            expense.amount / (expense.beneficiaryCount || 1)
                          ).toLocaleString('vi-VN')}{' '}
                          đ / người
                        </div>
                      </div>

                      <div className="flex items-center gap-1 border-l border-border pl-3">
                        <button
                          type="button"
                          onClick={() => setSelectedExpenseForDetail(expense)}
                          title="Xem chi tiết phân bổ"
                          className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {isLeader && (
                          <>
                            <button
                              type="button"
                              onClick={() => setSelectedExpenseForEdit(expense)}
                              title="Chỉnh sửa khoản chi"
                              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-primary transition cursor-pointer"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setSelectedExpenseForVoid(expense)}
                              title="Hủy khoản chi"
                              className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2 px-1 text-xs text-muted-foreground">
                <div>
                  Tổng cộng <strong>{totalElements}</strong> khoản chi
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    className="rounded-lg border border-border px-3 py-1.5 font-bold hover:bg-muted disabled:opacity-40 cursor-pointer"
                  >
                    Trang trước
                  </button>
                  <span>
                    Trang {page + 1} / {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded-lg border border-border px-3 py-1.5 font-bold hover:bg-muted disabled:opacity-40 cursor-pointer"
                  >
                    Trang sau
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Modals */}
      <CreateExpenseModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
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

      <ExpenseDetailModal
        isOpen={Boolean(selectedExpenseForDetail)}
        onClose={() => setSelectedExpenseForDetail(null)}
        expense={selectedExpenseForDetail}
      />

      <VoidExpenseConfirmModal
        isOpen={Boolean(selectedExpenseForVoid)}
        onClose={() => setSelectedExpenseForVoid(null)}
        groupId={groupId}
        expense={selectedExpenseForVoid}
      />
    </div>
  );
}
