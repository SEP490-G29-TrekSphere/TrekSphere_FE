import { AlertTriangle, Building2, Clock3, ReceiptText, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import type { RefundTransaction } from '../../types';
import { bankDisplayName } from '../../utils/banks';
import { dateTime, paymentLabels, StatusChip } from './PaymentItemRow';
import { RefundDestinationForm } from './RefundDestinationForm';
import { VendorRefundActions } from './VendorRefundActions';

const refundReasonLabels: Record<string, string> = {
  TREKKER_CANCEL: 'Khách hủy đặt tour',
  VENDOR_CANCEL: 'Nhà tổ chức hủy tour',
  INSUFFICIENT_PAX: 'Không đủ số khách khởi hành',
  NO_SHOW: 'Khách không tham gia',
  PAYMENT_ADJUSTMENT: 'Điều chỉnh thanh toán',
  OTHER: 'Lý do khác',
};

function deadlineText(value?: string | null): string | null {
  if (!value) return null;
  const difference = new Date(value).getTime() - Date.now();
  const absoluteHours = Math.max(1, Math.ceil(Math.abs(difference) / 3_600_000));
  const duration =
    absoluteHours >= 24 ? `${Math.ceil(absoluteHours / 24)} ngày` : `${absoluteHours} giờ`;
  return difference > 0 ? `Còn khoảng ${duration}` : `Đã quá hạn khoảng ${duration}`;
}

function visibleRefundAccountNumber(
  refund: RefundTransaction,
  audience: 'trekker' | 'vendor'
): string | null {
  if (audience === 'vendor') return refund.destinationAccountNumber ?? null;
  if (refund.maskedDestinationAccountNumber) return refund.maskedDestinationAccountNumber;
  const account = refund.destinationAccountNumber;
  if (!account) return null;
  return account.length > 4 ? `${'*'.repeat(account.length - 4)}${account.slice(-4)}` : account;
}

function NoteRow({
  icon: Icon,
  tone = 'muted',
  children,
}: {
  icon: typeof Clock3;
  tone?: 'muted' | 'danger';
  children: ReactNode;
}) {
  return (
    <div
      className={`mt-4 flex items-start gap-2.5 border-t border-border/60 pt-3 text-[11px] font-medium leading-relaxed ${
        tone === 'danger' ? 'text-destructive' : 'text-muted-foreground'
      }`}
    >
      <Icon className="mt-px h-3.5 w-3.5 shrink-0" />
      <p>{children}</p>
    </div>
  );
}

interface RefundItemCardProps {
  refund: RefundTransaction;
  audience: 'trekker' | 'vendor';
  canManageRefunds: boolean;
  onRefresh: () => void;
}

export function RefundItemCard({
  refund,
  audience,
  canManageRefunds,
  onRefresh,
}: RefundItemCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <p className="text-xl font-extrabold tracking-tight tabular-nums text-foreground">
              {refund.amount.toLocaleString('vi-VN')}đ
            </p>
            <StatusChip
              status={refund.status}
              label={
                audience === 'trekker' && refund.status === 'AWAITING_VENDOR_ACTION'
                  ? 'Chờ nhà tổ chức chuyển khoản'
                  : paymentLabels[refund.status] || refund.status
              }
            />
          </div>
          <p className="mt-2 text-xs font-semibold text-muted-foreground">
            {refund.reasonDetail ||
              refundReasonLabels[refund.reason] ||
              refund.reason}
          </p>
          <p className="mt-1 text-[11px] font-medium text-muted-foreground">
            Tạo lúc {dateTime(refund.requestedAt)}
          </p>
          {refund.failureMessage && (
            <p className="mt-1.5 text-xs font-semibold text-destructive">
              {refund.failureMessage}
            </p>
          )}
        </div>

        <div className="shrink-0 rounded-2xl bg-muted/40 px-4 py-3 sm:min-w-[224px]">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
            Tài khoản nhận hoàn
          </p>
          <p className="mt-2 flex items-center gap-2 text-xs font-bold text-foreground">
            <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            {bankDisplayName(refund.destinationBin, refund.destinationBankName)}
          </p>
          {visibleRefundAccountNumber(refund, audience) && (
            <p className="mt-1.5 text-xs font-semibold tabular-nums text-muted-foreground">
              {visibleRefundAccountNumber(refund, audience)}
              {refund.destinationAccountName && (
                <span className="text-muted-foreground">
                  {' · '}
                  {refund.destinationAccountName}
                </span>
              )}
            </p>
          )}
          {audience === 'trekker' &&
            (!refund.destinationBin ||
              !refund.destinationBankName ||
              !refund.destinationAccountNumber ||
              !refund.destinationAccountName) && (
              <p className="mt-2 text-[10px] font-medium text-muted-foreground">
                Vui lòng nhập tài khoản muốn nhận tiền. TrekSphere không tự động dùng tài khoản đã
                chuyển tiền.
              </p>
            )}
        </div>
      </div>

      {refund.dueAt && !['REFUNDED', 'CANCELLED'].includes(refund.status) && (
        <NoteRow
          icon={refund.status === 'OVERDUE' ? AlertTriangle : Clock3}
          tone={refund.status === 'OVERDUE' ? 'danger' : 'muted'}
        >
          <span className="font-bold">
            {audience === 'trekker' ? 'Hạn nhà tổ chức xử lý' : 'Hạn xử lý'}:{' '}
            {dateTime(refund.dueAt)}
          </span>{' '}
          · {deadlineText(refund.dueAt)}. Đây là hạn chuyển tiền hoặc gửi biên nhận, không phải cam
          kết tiền đã về tài khoản ngân hàng.
        </NoteRow>
      )}

      {refund.status === 'MANUAL_REVIEW' && (
        <NoteRow icon={ShieldCheck}>
          Vendor đã gửi biên nhận lúc {dateTime(refund.manualSubmittedAt)}. Admin đang đối soát
          trước khi xác nhận hoàn tiền.
          {refund.manualReceiptUrl && audience === 'vendor' && (
            <a
              href={refund.manualReceiptUrl}
              target="_blank"
              rel="noreferrer"
              className="ml-1 font-bold text-foreground underline underline-offset-2"
            >
              Xem biên nhận
            </a>
          )}
        </NoteRow>
      )}

      {refund.adminReviewNote && (
        <NoteRow icon={ReceiptText}>
          <span className="font-bold">Phản hồi đối soát:</span> {refund.adminReviewNote}
        </NoteRow>
      )}

      {audience === 'trekker' &&
        ['PENDING', 'FAILED', 'AWAITING_VENDOR_ACTION', 'OVERDUE'].includes(refund.status) &&
        (!refund.destinationBin ||
          !refund.destinationBankName ||
          !refund.destinationAccountNumber ||
          !refund.destinationAccountName) && (
          <RefundDestinationForm refund={refund} onSaved={onRefresh} />
        )}

      {audience === 'vendor' && canManageRefunds && (
        <VendorRefundActions refund={refund} onSaved={onRefresh} />
      )}
    </div>
  );
}
