import { CheckCircle2, Clock3, XCircle } from 'lucide-react';
import type { PaymentTransaction } from '../../types';

export const paymentLabels: Record<string, string> = {
  FULL: 'Thanh toán toàn bộ',
  DEPOSIT: 'Tiền đặt cọc',
  REMAINING: 'Phần còn lại',
  CREATED: 'Đã tạo',
  PENDING: 'Đang chờ',
  PROCESSING: 'Đang xử lý',
  PAID: 'Đã thanh toán',
  FAILED: 'Thất bại',
  CANCELLED: 'Đã hủy',
  EXPIRED: 'Hết hạn',
  REFUNDED: 'Đã hoàn tiền',
  AWAITING_VENDOR_ACTION: 'Chờ vendor chuyển khoản',
  MANUAL_REVIEW: 'Chờ admin xác minh',
  OVERDUE: 'Quá hạn xử lý',
};

const DANGER_STATUSES = ['FAILED', 'CANCELLED', 'EXPIRED', 'OVERDUE'];
const DONE_STATUSES = ['PAID', 'REFUNDED'];

export function statusDotTone(status: string): string {
  if (DONE_STATUSES.includes(status)) return 'bg-emerald-500';
  if (DANGER_STATUSES.includes(status)) return 'bg-destructive';
  if (status === 'MANUAL_REVIEW') return 'bg-primary';
  return 'bg-amber-400';
}

export function statusTextTone(status: string): string {
  return DANGER_STATUSES.includes(status) ? 'text-destructive' : 'text-foreground';
}

export function iconTone(status: string): string {
  if (DONE_STATUSES.includes(status)) return 'text-emerald-600';
  if (DANGER_STATUSES.includes(status)) return 'text-destructive';
  return 'text-muted-foreground';
}

export function StatusChip({ status, label }: { status: string; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-bold ${statusTextTone(status)}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${statusDotTone(status)}`} />
      {label}
    </span>
  );
}

export function dateTime(value?: string | null): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function transactionTimeLabel(
  status: string,
  paidAt?: string | null,
  expiredAt?: string | null
): string {
  if (paidAt) return `Thanh toán lúc ${dateTime(paidAt)}`;
  if (expiredAt && status === 'EXPIRED') return `Hết hạn lúc ${dateTime(expiredAt)}`;
  if (expiredAt) return `Có hiệu lực đến ${dateTime(expiredAt)}`;
  return 'Chưa có thời gian cập nhật';
}

interface PaymentItemRowProps {
  payment: PaymentTransaction;
}

export function PaymentItemRow({ payment }: PaymentItemRowProps) {
  const isLegacy = payment.source === 'LEGACY_BANK_TRANSFER';

  return (
    <div className="flex flex-col gap-3 border-b border-border/50 py-4 last:border-b-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-muted/30">
          {payment.status === 'PAID' ? (
            <CheckCircle2 className={`h-4 w-4 ${iconTone(payment.status)}`} />
          ) : ['FAILED', 'CANCELLED', 'EXPIRED'].includes(payment.status) ? (
            <XCircle className={`h-4 w-4 ${iconTone(payment.status)}`} />
          ) : (
            <Clock3 className={`h-4 w-4 ${iconTone(payment.status)}`} />
          )}
        </span>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-extrabold text-foreground">
              {isLegacy
                ? 'Chuyển khoản ngân hàng (đơn cũ)'
                : paymentLabels[payment.paymentStage]}
            </p>
            <StatusChip
              status={payment.status}
              label={paymentLabels[payment.status] || payment.status}
            />
          </div>
          <p className="mt-1.5 text-xs font-medium text-muted-foreground">
            {isLegacy
              ? `Dữ liệu trước khi tích hợp payOS · ${dateTime(payment.createdAt)}`
              : `Mã giao dịch ${payment.orderCode ?? '—'} · Lần thử ${payment.attemptNumber}`}
          </p>
          {payment.failureMessage && (
            <p className="mt-1 text-xs font-semibold text-destructive">
              {payment.failureMessage}
            </p>
          )}
        </div>
      </div>
      <div className="pl-12 text-left sm:pl-0 sm:text-right">
        <p className="text-base font-extrabold tabular-nums text-foreground">
          {payment.amount.toLocaleString('vi-VN')}đ
        </p>
        <p className="mt-1 text-[11px] font-medium text-muted-foreground">
          {transactionTimeLabel(payment.status, payment.paidAt, payment.expiredAt)}
        </p>
      </div>
    </div>
  );
}
