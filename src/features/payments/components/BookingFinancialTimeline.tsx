import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ReceiptText, RefreshCw, RotateCcw, ShieldCheck } from 'lucide-react';
import { paymentService } from '@/features/payments/services/paymentService';
import { AppCard } from '@/shared/ui';
import { PaymentItemRow, RefundItemCard } from './timeline';

interface BookingFinancialTimelineProps {
  bookingId: string;
  audience: 'trekker' | 'vendor';
  canManageRefunds?: boolean;
  view?: 'all' | 'payments' | 'refunds';
}

export function BookingFinancialTimeline({
  bookingId,
  audience,
  canManageRefunds = false,
  view = 'all',
}: BookingFinancialTimelineProps) {
  const queryClient = useQueryClient();
  const showPayments = view !== 'refunds';
  const showRefunds = view !== 'payments';

  const payments = useQuery({
    queryKey: ['booking-payments', bookingId],
    queryFn: () => paymentService.getPayments(bookingId),
    enabled: showPayments,
  });

  const refunds = useQuery({
    queryKey: ['booking-refunds', bookingId],
    queryFn: () => paymentService.getRefunds(bookingId),
    enabled: showRefunds,
    refetchInterval: (query) =>
      query.state.data?.some((item) => item.status === 'PROCESSING') ? 5_000 : false,
  });

  const refundItems = refunds.data ?? [];
  const hasVendorInitiatedRefund = refundItems.some((refund) =>
    ['VENDOR_CANCEL', 'INSUFFICIENT_PAX'].includes(refund.reason)
  );

  function refreshRefunds() {
    queryClient.invalidateQueries({ queryKey: ['booking-refunds', bookingId] });
    queryClient.invalidateQueries({ queryKey: ['booking-detail', bookingId] });
    queryClient.invalidateQueries({ queryKey: ['vendor-bookings'] });
  }

  return (
    <AppCard className="rounded-3xl border-border bg-card p-5 shadow-none sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold tracking-tight text-foreground">
            {view === 'payments'
              ? 'Lịch sử thanh toán'
              : view === 'refunds'
                ? 'Xử lý hoàn tiền'
                : 'Thanh toán & hoàn tiền'}
          </h2>
          <p className="mt-1 text-xs font-medium text-muted-foreground">
            {view === 'refunds'
              ? 'Theo dõi tài khoản nhận tiền và xử lý từng yêu cầu.'
              : audience === 'trekker'
                ? 'Theo dõi các khoản đã thanh toán và tiến độ hoàn tiền.'
                : 'Gồm cả giao dịch payOS và dữ liệu chuyển khoản cũ.'}
          </p>
        </div>
        {((showPayments && payments.isFetching) || (showRefunds && refunds.isFetching)) && (
          <RefreshCw className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
        )}
      </div>

      <div className="mt-5">
        {showPayments && (
          <div>
            <div className="mb-1 flex items-center justify-between gap-3">
              <h3 className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
                Lịch sử thanh toán
              </h3>
              <span className="text-[11px] font-bold text-muted-foreground">
                {(payments.data ?? []).length} giao dịch
              </span>
            </div>

            <div>
              {(payments.data ?? []).length === 0 ? (
                <div className="mt-3 rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-center">
                  <ReceiptText className="mx-auto h-5 w-5 text-muted-foreground" />
                  <p className="mt-2 text-xs font-semibold text-muted-foreground">
                    Chưa phát sinh giao dịch thanh toán
                  </p>
                </div>
              ) : (
                payments.data?.map((payment) => (
                  <PaymentItemRow key={payment.paymentTransactionId} payment={payment} />
                ))
              )}
            </div>
          </div>
        )}

        {showRefunds && (view === 'refunds' || (refunds.data ?? []).length > 0) && (
          <div className={showPayments ? 'mt-8 border-t border-border/50 pt-6' : ''}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
                {audience === 'trekker' ? 'Khoản hoàn tiền' : 'Yêu cầu cần hoàn tiền'}
              </h3>
              <span className="text-[11px] font-bold text-muted-foreground">
                {refundItems.length} khoản
              </span>
            </div>

            {audience === 'trekker' && hasVendorInitiatedRefund && (
              <p className="mb-4 flex items-start gap-2.5 text-[11px] font-medium leading-relaxed text-muted-foreground">
                <ShieldCheck className="mt-px h-3.5 w-3.5 shrink-0 text-primary" />
                <span>
                  <strong className="font-extrabold text-foreground">
                    Khoản hoàn được tạo tự động.
                  </strong>{' '}
                  Nhà tổ chức đã hủy đơn sau khi bạn thanh toán. TrekSphere đã tự động tạo khoản
                  hoàn này; bạn không cần gửi thêm yêu cầu.
                </span>
              </p>
            )}

            <div className="space-y-3">
              {refundItems.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-center">
                  <RotateCcw className="mx-auto h-5 w-5 text-muted-foreground" />
                  <p className="mt-2 text-xs font-semibold text-muted-foreground">
                    Đơn này chưa phát sinh khoản hoàn tiền.
                  </p>
                </div>
              ) : (
                refundItems.map((refund) => (
                  <RefundItemCard
                    key={refund.refundTransactionId}
                    refund={refund}
                    audience={audience}
                    canManageRefunds={canManageRefunds}
                    onRefresh={refreshRefunds}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {(showPayments && payments.isError) || (showRefunds && refunds.isError) ? (
          <p className="mt-4 flex items-center gap-2 text-xs font-semibold text-destructive">
            <ReceiptText className="h-4 w-4" /> Không thể tải đầy đủ lịch sử tài chính.
          </p>
        ) : null}
      </div>
    </AppCard>
  );
}
