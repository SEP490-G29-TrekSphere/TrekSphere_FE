import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { AppImageUploadField, useImageUploadCleanup } from '@/shared/ui';
import { toast } from '@/store/useToastStore';
import { paymentService } from '../../services/paymentService';
import type { RefundTransaction } from '../../types';
import { type ManualValues, manualSchema } from '../../validations';

const FIELD_LABEL = 'block text-[11px] font-bold text-muted-foreground';
const FIELD_INPUT =
  'mt-1.5 w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm font-semibold text-foreground outline-none transition-colors placeholder:font-medium placeholder:text-muted-foreground focus:border-primary focus:bg-background';
const PRIMARY_BUTTON =
  'inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-extrabold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60';
const SECONDARY_BUTTON =
  'inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-extrabold text-foreground transition-colors hover:bg-muted';

interface VendorRefundActionsProps {
  refund: RefundTransaction;
  onSaved: () => void;
}

export function VendorRefundActions({ refund, onSaved }: VendorRefundActionsProps) {
  const [showManual, setShowManual] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState('');
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const receiptCleanup = useImageUploadCleanup();

  const form = useForm<ManualValues>({
    resolver: zodResolver(manualSchema),
    defaultValues: { note: '' },
  });

  const canProcess = ['PENDING', 'FAILED', 'AWAITING_VENDOR_ACTION', 'OVERDUE'].includes(
    refund.status
  );
  const hasDestination = Boolean(
    refund.destinationBin &&
      refund.destinationBankName &&
      refund.destinationAccountNumber &&
      refund.destinationAccountName
  );

  const gatewayMutation = useMutation({
    mutationFn: () => paymentService.processRefund(refund.refundTransactionId),
    onSuccess: () => {
      toast.success('Đã gửi lệnh chi tiền qua Kênh Chi payOS.');
      onSaved();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const manualMutation = useMutation({
    mutationFn: ({ values, imageUrl }: { values: ManualValues; imageUrl: string }) =>
      paymentService.completeManualRefund(refund.refundTransactionId, imageUrl, values.note),
    onSuccess: () => {
      toast.success('Đã gửi biên nhận. Refund đang chờ admin xác minh.');
      receiptCleanup.commit();
      setShowManual(false);
      setReceiptUrl('');
      form.reset();
      onSaved();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (!canProcess) return null;

  return (
    <div className="mt-4 border-t border-border pt-4">
      {!hasDestination ? (
        <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <AlertTriangle className="h-4 w-4 text-amber-500" /> Chờ khách cập nhật tài khoản nhận
          tiền.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {refund.automaticPayoutAvailable && (
            <button
              type="button"
              disabled={gatewayMutation.isPending}
              onClick={() => gatewayMutation.mutate()}
              className={PRIMARY_BUTTON}
            >
              {gatewayMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Chi tự động qua payOS
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              if (showManual) {
                receiptCleanup.discard();
                setReceiptUrl('');
              }
              setShowManual((value) => !value);
            }}
            className={SECONDARY_BUTTON}
          >
            Đã chuyển tiền, gửi biên nhận
          </button>
        </div>
      )}

      {showManual && hasDestination && (
        <form
          onSubmit={form.handleSubmit((values) => {
            if (!receiptUrl.trim()) {
              toast.error('Vui lòng chọn ảnh biên nhận chuyển khoản.');
              return;
            }
            manualMutation.mutate({ values, imageUrl: receiptUrl.trim() });
          })}
          className="mt-4 rounded-2xl border border-border bg-muted/30 p-4"
        >
          <div className="grid gap-3">
            <label className={FIELD_LABEL}>
              Ghi chú (không bắt buộc)
              <input {...form.register('note')} className={FIELD_INPUT} />
            </label>
            <AppImageUploadField
              label="Ảnh biên nhận chuyển khoản"
              value={receiptUrl}
              onChange={setReceiptUrl}
              folder="refund-receipts"
              cleanup={receiptCleanup}
              onUploadingChange={setIsUploadingReceipt}
              showOpenLink
              previewClassName="max-h-48 w-full bg-card object-contain"
              urlPlaceholder="https://... (nếu ảnh đã có sẵn trên mạng)"
              hint="Biên nhận chỉ là bằng chứng gửi duyệt; refund chỉ hoàn tất sau khi admin xác minh."
              disabled={manualMutation.isPending}
            />
          </div>
          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              disabled={manualMutation.isPending || isUploadingReceipt}
              className={PRIMARY_BUTTON}
            >
              {manualMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Gửi biên nhận để admin duyệt
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
