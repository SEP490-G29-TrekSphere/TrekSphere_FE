import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from '@/store/useToastStore';
import { paymentService } from '../../services/paymentService';
import type { RefundTransaction } from '../../types';
import { bankDisplayName, bankNameFromBin, VIETNAM_BANKS } from '../../utils/banks';
import { type DestinationValues, destinationSchema } from '../../validations';

const FIELD_LABEL = 'block text-[11px] font-bold text-muted-foreground';
const FIELD_INPUT =
  'mt-1.5 w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm font-semibold text-foreground outline-none transition-colors placeholder:font-medium placeholder:text-muted-foreground focus:border-primary focus:bg-background';
const FIELD_ERROR = 'mt-1 block text-[11px] font-semibold text-destructive';
const PRIMARY_BUTTON =
  'inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-extrabold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60';

interface RefundDestinationFormProps {
  refund: RefundTransaction;
  onSaved: () => void;
}

export function RefundDestinationForm({ refund, onSaved }: RefundDestinationFormProps) {
  const form = useForm<DestinationValues>({
    resolver: zodResolver(destinationSchema),
    defaultValues: {
      bankBin: refund.destinationBin ?? '',
      accountNumber: refund.destinationAccountNumber ?? '',
      accountName: refund.destinationAccountName ?? '',
    },
  });

  const mutation = useMutation({
    mutationFn: (values: DestinationValues) =>
      paymentService.updateRefundDestination(refund.refundTransactionId, {
        ...values,
        bankName: bankNameFromBin(values.bankBin),
        accountName: values.accountName.toUpperCase(),
      }),
    onSuccess: () => {
      toast.success('Đã cập nhật tài khoản nhận hoàn tiền.');
      onSaved();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <form
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      className="mt-4 border-t border-border pt-4"
    >
      <p className="text-xs font-extrabold text-foreground">Cập nhật tài khoản nhận hoàn tiền</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <label className={FIELD_LABEL}>
          Ngân hàng
          <select {...form.register('bankBin')} className={FIELD_INPUT}>
            <option value="">Chọn ngân hàng</option>
            {refund.destinationBin && !bankNameFromBin(refund.destinationBin) && (
              <option value={refund.destinationBin}>
                {bankDisplayName(refund.destinationBin, refund.destinationBankName)}
              </option>
            )}
            {VIETNAM_BANKS.map((bank) => (
              <option key={bank.bin} value={bank.bin}>
                {bank.name}
              </option>
            ))}
          </select>
          {form.formState.errors.bankBin && (
            <span className={FIELD_ERROR}>{form.formState.errors.bankBin.message}</span>
          )}
        </label>
        <label className={FIELD_LABEL}>
          Số tài khoản
          <input {...form.register('accountNumber')} inputMode="numeric" className={FIELD_INPUT} />
          {form.formState.errors.accountNumber && (
            <span className={FIELD_ERROR}>{form.formState.errors.accountNumber.message}</span>
          )}
        </label>
        <label className={FIELD_LABEL}>
          Tên chủ tài khoản
          <input {...form.register('accountName')} className={`${FIELD_INPUT} uppercase`} />
          {form.formState.errors.accountName && (
            <span className={FIELD_ERROR}>{form.formState.errors.accountName.message}</span>
          )}
        </label>
      </div>
      <div className="mt-3 flex justify-end">
        <button type="submit" disabled={mutation.isPending} className={PRIMARY_BUTTON}>
          {mutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Lưu tài khoản nhận tiền
        </button>
      </div>
    </form>
  );
}
