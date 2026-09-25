import { Eye, FileText, Pencil, Plus, Trash2, UserCheck, Users } from 'lucide-react';
import type { GroupExpenseResponse } from '../../../types/expense';

interface GroupExpenseListSectionProps {
  isLoadingExpenses: boolean;
  actualExpenses: GroupExpenseResponse[];
  activeMemberCount: number;
  isLeader: boolean;
  isCancelled: boolean;
  onOpenAddExpense: () => void;
  onViewExpenseDetail: (expense: GroupExpenseResponse) => void;
  onEditExpense: (expense: GroupExpenseResponse) => void;
  onVoidExpense: (expense: GroupExpenseResponse) => void;
}

export function GroupExpenseListSection({
  isLoadingExpenses,
  actualExpenses,
  activeMemberCount,
  isLeader,
  isCancelled,
  onOpenAddExpense,
  onViewExpenseDetail,
  onEditExpense,
  onVoidExpense,
}: GroupExpenseListSectionProps) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
            Khoản Chi Thực Tế &amp; Hóa Đơn
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ghi nhận các khoản ứng trước thực tế để tự động tính đối trừ giao dịch tối ưu
          </p>
        </div>
        {isLeader && !isCancelled && (
          <button
            type="button"
            onClick={onOpenAddExpense}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-xs font-bold hover:bg-primary-hover transition shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Nhập Hóa Đơn
          </button>
        )}
      </div>

      {/* Actual Expenses Table */}
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
                          onClick={() => onViewExpenseDetail(exp)}
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
                              className="p-1.5 text-destructive hover:text-destructive/80 rounded-lg hover:bg-destructive/10 transition cursor-pointer"
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
