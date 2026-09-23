import { Eye, FileText, Pencil, Plus, Receipt, Trash2, UserCheck, Users } from 'lucide-react';
import { getSafeImageUrl } from '@/utils/sanitize';
import type { GroupExpenseResponse } from '../../../types/expense';

export interface ActualExpensesSectionProps {
  actualExpenses: GroupExpenseResponse[];
  isLoadingExpenses: boolean;
  activeMemberCount: number;
  isLeader: boolean;
  isCancelled?: boolean;
  onAddExpense: () => void;
  onViewDetail: (exp: GroupExpenseResponse) => void;
  onEditExpense: (exp: GroupExpenseResponse) => void;
  onVoidExpense: (exp: GroupExpenseResponse) => void;
}

export function ActualExpensesSection({
  actualExpenses,
  isLoadingExpenses,
  activeMemberCount,
  isLeader,
  isCancelled = false,
  onAddExpense,
  onViewDetail,
  onEditExpense,
  onVoidExpense,
}: ActualExpensesSectionProps) {
  return (
    <div
      id="actual-expenses-section"
      className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm space-y-5 scroll-mt-24"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
            <Receipt className="h-5 w-5 text-purple-600 dark:text-purple-400 shrink-0" />
            Hóa Đơn Thực Tế & Quyết Toán Chi Phí
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ghi nhận các khoản ứng trước thực tế để tự động tính đối trừ giao dịch P2P tối ưu
          </p>
        </div>
        {isLeader && !isCancelled && (
          <button
            type="button"
            onClick={onAddExpense}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white dark:bg-purple-600 px-4 py-2 text-xs font-bold hover:bg-slate-800 dark:hover:bg-purple-700 transition shadow-xs cursor-pointer self-start sm:self-auto"
          >
            <Plus className="h-4 w-4 shrink-0" />
            Nhập Hóa Đơn
          </button>
        )}
      </div>

      {/* Actual Expenses Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-xs min-w-[640px]">
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
                const beneficiaryCount =
                  actualSharesCount > 0 ? actualSharesCount : activeMemberCount;
                const isWholeGroup =
                  exp.beneficiaryScope === 'ALL_MEMBERS'
                    ? actualSharesCount === activeMemberCount || actualSharesCount === 0
                    : beneficiaryCount >= activeMemberCount;
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
                        {getSafeImageUrl(exp.receiptUrl) ? (
                          <a
                            href={getSafeImageUrl(exp.receiptUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Xem ảnh hóa đơn"
                            className="shrink-0"
                          >
                            <img
                              src={getSafeImageUrl(exp.receiptUrl)}
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
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                          <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          {isCustomSplit ? (
                            <span className="inline-flex items-center gap-1.5">
                              <span className="rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                Tùy chỉnh
                              </span>
                              <span className="text-foreground font-semibold">
                                {beneficiaryCount}/{activeMemberCount} người
                              </span>
                            </span>
                          ) : isSingleBeneficiary && singleBeneficiary ? (
                            <span className="text-foreground font-semibold text-xs">
                              {isPaidOnBehalf
                                ? `Chi hộ ${singleBeneficiary.fullName}`
                                : `Chi riêng cho ${singleBeneficiary.fullName}`}
                              <span className="text-[10px] text-muted-foreground font-normal ml-1">
                                (1/{activeMemberCount} người)
                              </span>
                            </span>
                          ) : isWholeGroup ? (
                            <span>Chia đều cả đoàn ({activeMemberCount} người)</span>
                          ) : (
                            <span>
                              Chia đều {beneficiaryCount}/{activeMemberCount} người
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
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onViewDetail(exp)}
                          className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition cursor-pointer"
                          title="Xem chi tiết phân bổ"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        {isLeader && !isCancelled && (
                          <>
                            <button
                              type="button"
                              onClick={() => onEditExpense(exp)}
                              className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition cursor-pointer"
                              title="Sửa"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onVoidExpense(exp)}
                              className="p-1.5 text-rose-500 hover:text-rose-600 rounded-lg hover:bg-rose-500/10 transition cursor-pointer"
                              title="Xóa"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
