import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  ExternalLink,
  FileText,
  Send,
  Upload,
  X,
  XCircle,
} from 'lucide-react';
import { AppModalShell } from '@/shared/ui';
import type { GroupSettlementResponse } from '../../../types/settlement';
import { MemberAvatar } from '../../detail/MemberAvatar';

interface SettlementDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  settlement: GroupSettlementResponse | null;
  onOpenProof?: (settlement: GroupSettlementResponse) => void;
  onOpenConfirm?: (settlement: GroupSettlementResponse) => void;
  onOpenReject?: (settlement: GroupSettlementResponse) => void;
  currentUserId?: string;
}

export function SettlementDetailModal({
  isOpen,
  onClose,
  settlement,
  onOpenProof,
  onOpenConfirm,
  onOpenReject,
  currentUserId,
}: SettlementDetailModalProps) {
  if (!settlement) return null;

  const isDebtor = settlement.fromMember.userId === currentUserId;
  const isPayee = settlement.toMember.userId === currentUserId;

  return (
    <AppModalShell
      open={isOpen}
      onClose={onClose}
      aria-label="Chi tiết giao dịch bù trừ"
      className="flex max-w-xl flex-col overflow-hidden border border-border p-0"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Chi tiết giao dịch bù trừ</h3>
            <p className="text-[11px] text-muted-foreground">
              Mã giao dịch: #{settlement.groupSettlementId.slice(0, 8)}
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

      <div className="space-y-4 p-5 max-h-[80vh] overflow-y-auto">
        {/* Parties Card */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Debtor */}
            <div className="flex items-center gap-2.5">
              <MemberAvatar
                fullName={settlement.fromMember.fullName}
                avatarUrl={settlement.fromMember.avatarUrl ?? undefined}
                size="md"
              />
              <div>
                <div className="text-[10px] uppercase font-bold text-rose-500">Người chuyển</div>
                <div className="text-sm font-extrabold text-foreground">
                  {settlement.fromMember.fullName}
                </div>
              </div>
            </div>

            {/* Transfer Direction & Amount */}
            <div className="flex flex-col items-center justify-center py-1 sm:py-0 px-2">
              <div className="text-base font-black text-rose-600 dark:text-rose-400 bg-rose-500/10 px-3 py-0.5 rounded-lg border border-rose-500/20">
                {settlement.amount.toLocaleString('vi-VN')} đ
              </div>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                <ArrowRight className="h-3 w-3" /> Chuyển đến
              </div>
            </div>

            {/* Payee */}
            <div className="flex items-center gap-2.5 sm:flex-row-reverse sm:text-right">
              <MemberAvatar
                fullName={settlement.toMember.fullName}
                avatarUrl={settlement.toMember.avatarUrl ?? undefined}
                size="md"
              />
              <div>
                <div className="text-[10px] uppercase font-bold text-emerald-600">Người nhận</div>
                <div className="text-sm font-extrabold text-foreground">
                  {settlement.toMember.fullName}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center justify-between rounded-xl border border-border bg-background p-3">
          <span className="text-xs text-muted-foreground font-medium">Trạng thái:</span>
          <div>
            {settlement.status === 'CONFIRMED' && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                <CheckCircle2 className="h-3.5 w-3.5" /> Đã hoàn tất
              </span>
            )}
            {settlement.status === 'PROOF_SUBMITTED' && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20">
                <Send className="h-3.5 w-3.5" /> Đã gửi chứng từ (Chờ xác nhận)
              </span>
            )}
            {settlement.status === 'PENDING' && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20">
                <Clock className="h-3.5 w-3.5" /> Chờ chuyển tiền
              </span>
            )}
            {settlement.status === 'REJECTED' && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-500/10 px-3 py-1 rounded-lg border border-rose-500/20">
                <XCircle className="h-3.5 w-3.5" /> Chứng từ bị từ chối
              </span>
            )}
          </div>
        </div>

        {/* Rejection reason alert */}
        {settlement.status === 'REJECTED' && settlement.rejectReason && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Lý do từ chối: </span>
              <span>{settlement.rejectReason}</span>
            </div>
          </div>
        )}

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2.5 rounded-xl border border-border bg-background p-3">
            <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <div className="text-[10px] text-muted-foreground">Phương thức thanh toán</div>
              <div className="font-semibold text-foreground">
                {settlement.paymentMethod || 'Chuyển khoản ngân hàng'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-xl border border-border bg-background p-3">
            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <div className="text-[10px] text-muted-foreground">Thời gian tạo</div>
              <div className="font-semibold text-foreground">
                {settlement.createdAt
                  ? new Date(settlement.createdAt).toLocaleDateString('vi-VN')
                  : 'Sau khi kết thúc chuyến đi'}
              </div>
            </div>
          </div>
        </div>

        {/* Note if present */}
        {settlement.note && (
          <div className="rounded-xl border border-border bg-muted/20 p-3 text-xs space-y-1">
            <div className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
              <FileText className="h-3 w-3" /> Ghi chú chuyển tiền
            </div>
            <p className="text-foreground leading-relaxed whitespace-pre-line">{settlement.note}</p>
          </div>
        )}

        {/* Proof Document Preview */}
        {settlement.proofUrl && (
          <div className="rounded-xl border border-border bg-background p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <FileText className="h-3.5 w-3.5 text-primary" />
                <span>Ảnh chứng từ chuyển khoản</span>
              </div>
              <a
                href={settlement.proofUrl}
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline flex items-center gap-1 text-[11px] font-semibold"
              >
                Xem ảnh gốc <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="relative rounded-lg border border-border overflow-hidden max-h-48 bg-black/5 flex items-center justify-center p-1">
              <img
                src={settlement.proofUrl}
                alt="Proof document"
                className="max-h-48 w-full object-contain rounded"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://placehold.co/400x200?text=Invalid+Image';
                }}
              />
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-border">
          {/* Debtor action */}
          {isDebtor &&
            (settlement.status === 'PENDING' || settlement.status === 'REJECTED') &&
            onOpenProof && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenProof(settlement);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs transition shadow-xs cursor-pointer"
              >
                <Upload className="h-3.5 w-3.5" /> Nộp chứng từ
              </button>
            )}

          {/* Payee action */}
          {isPayee && settlement.status === 'PROOF_SUBMITTED' && (
            <>
              {onOpenReject && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenReject(settlement);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-destructive/30 text-destructive hover:bg-destructive/10 font-bold text-xs transition cursor-pointer"
                >
                  <XCircle className="h-3.5 w-3.5" /> Từ chối
                </button>
              )}
              {onOpenConfirm && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenConfirm(settlement);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs cursor-pointer"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Xác nhận đã nhận
                </button>
              )}
            </>
          )}

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </AppModalShell>
  );
}
