import {
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Receipt,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import { AppModalShell } from '@/shared/ui';
import type { GroupExpenseResponse } from '../../../types/expense';
import { MemberAvatar } from '../../detail/MemberAvatar';

interface ExpenseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: GroupExpenseResponse | null;
}

export function ExpenseDetailModal({ isOpen, onClose, expense }: ExpenseDetailModalProps) {
  if (!expense) return null;

  return (
    <AppModalShell
      open={isOpen}
      onClose={onClose}
      aria-label="Chi tiết khoản chi tiêu"
      className="flex max-w-xl flex-col overflow-hidden border border-border p-0"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">{expense.title}</h3>
            <p className="text-[11px] text-muted-foreground">
              Mã hóa đơn: #{expense.groupExpenseId.slice(0, 8)}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4 p-5">
        {/* Total Amount & Payer Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center gap-3">
            <MemberAvatar
              fullName={expense.payer.fullName}
              avatarUrl={expense.payer.avatarUrl ?? undefined}
              size="md"
            />
            <div>
              <div className="text-[11px] text-muted-foreground">Người chi trả</div>
              <div className="text-sm font-extrabold text-foreground flex items-center gap-1.5">
                {expense.payer.fullName}
                {expense.payer.role === 'LEADER' && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.2 text-[9px] font-bold text-primary border border-primary/20">
                    <ShieldCheck className="h-2.5 w-2.5" /> Trưởng nhóm
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-[11px] text-muted-foreground">Tổng số tiền chi</div>
            <div className="text-xl font-black text-primary">
              {expense.amount.toLocaleString('vi-VN')} đ
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2.5 rounded-xl border border-border bg-background p-3">
            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <div className="text-[10px] text-muted-foreground">Thời điểm chi tiền</div>
              <div className="font-semibold text-foreground">
                {expense.spentAt
                  ? new Date(expense.spentAt).toLocaleString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Không xác định'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-xl border border-border bg-background p-3">
            <Users className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <div className="text-[10px] text-muted-foreground">Phạm vi thụ hưởng</div>
              <div className="font-semibold text-foreground">
                {expense.beneficiaryScope === 'ALL_MEMBERS'
                  ? `Toàn bộ đoàn (${expense.beneficiaryCount} người)`
                  : `Chỉ định (${expense.beneficiaryCount} người)`}
              </div>
            </div>
          </div>
        </div>

        {/* Note if present */}
        {expense.note && (
          <div className="rounded-xl border border-border bg-muted/20 p-3 text-xs space-y-1">
            <div className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
              <FileText className="h-3 w-3" /> Ghi chú
            </div>
            <p className="text-foreground leading-relaxed whitespace-pre-line">{expense.note}</p>
          </div>
        )}

        {/* Receipt Link if present */}
        {expense.receiptUrl && (
          <div className="flex items-center justify-between rounded-xl border border-border bg-background p-3 text-xs">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <Receipt className="h-4 w-4 text-primary" />
              <span>Hóa đơn / Ảnh chứng từ</span>
            </div>
            <a
              href={expense.receiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-bold text-primary hover:underline text-[11px]"
            >
              Xem hóa đơn <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}

        {/* Shares Breakdown Table */}
        <div className="space-y-2 pt-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
            <span>Phân bổ chia tiền ({expense.shares.length} thành viên)</span>
            <span className="text-[11px] font-normal normal-case text-muted-foreground">
              Phương thức:{' '}
              <strong className="text-foreground">
                {expense.splitMethod === 'CUSTOM'
                  ? 'Chia theo số tiền chỉ định (CUSTOM)'
                  : 'Chia đều (EQUAL)'}
              </strong>
            </span>
          </h4>

          <div className="divide-y divide-border rounded-2xl border border-border bg-background overflow-hidden max-h-56 overflow-y-auto">
            {expense.shares.map((share) => (
              <div
                key={share.expenseShareId}
                className="flex items-center justify-between p-3 text-xs hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <MemberAvatar
                    fullName={share.member.fullName}
                    avatarUrl={share.member.avatarUrl ?? undefined}
                    size="sm"
                  />
                  <div>
                    <div className="font-bold text-foreground flex items-center gap-1">
                      {share.member.fullName}
                      {share.member.matchingMemberId === expense.payer.matchingMemberId && (
                        <span className="text-[9px] rounded-sm bg-primary/10 px-1 py-0.2 font-semibold text-primary">
                          Payer
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {share.member.role === 'LEADER' ? 'Trưởng nhóm' : 'Thành viên'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-extrabold text-foreground">
                      {share.shareAmount.toLocaleString('vi-VN')} đ
                    </div>
                    <div className="text-[10px] flex items-center justify-end gap-1">
                      {share.isSettled ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                          <CheckCircle2 className="h-2.5 w-2.5" /> Đã quyết toán
                        </span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-0.5">
                          <Clock className="h-2.5 w-2.5" /> Chưa quyết toán
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-3 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border px-5 py-2 text-xs font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </AppModalShell>
  );
}
