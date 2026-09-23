import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, CheckCircle2, FileText, Loader2, Plus, UserCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { AppCurrencyInput, AppModalShell, useImageUploadCleanup } from '@/shared/ui';
import { toast } from '@/store/useToastStore';
import { useCreateGroupExpense } from '../../../hooks/useGroupExpenseWorkspace';
import type {
  BeneficiaryScope,
  GroupExpenseCreateRequest,
  SplitMethod,
} from '../../../types/expense';
import type { MatchingMemberItem } from '../../../types/matchingGroup';
import {
  type GroupExpenseCreateFormValues,
  groupExpenseCreateSchema,
} from '../../../validations/expenseValidation';
import { ExpenseReceiptUpload } from './ExpenseReceiptUpload';
import { ExpenseSplitFormFields } from './ExpenseSplitFormFields';

interface CreateExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  members: MatchingMemberItem[];
  currentUserId?: string;
}

function getLocalCurrentDatetime(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function CreateExpenseModal({
  isOpen,
  onClose,
  groupId,
  members,
  currentUserId,
}: CreateExpenseModalProps) {
  const createExpenseMutation = useCreateGroupExpense(groupId);
  const activeMembers = members.filter(
    (m): m is MatchingMemberItem & { matchingMemberId: string } =>
      m.status === 'ACCEPTED' && Boolean(m.matchingMemberId)
  );

  const [scope, setScope] = useState<BeneficiaryScope>('ALL_MEMBERS');
  const [selectedMembers, setSelectedMembers] = useState<string[]>(
    activeMembers.map((m) => m.matchingMemberId)
  );
  const [splitMethod, setSplitMethod] = useState<SplitMethod>('EQUAL');
  const [customSharesMap, setCustomSharesMap] = useState<Record<string, number>>({});
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const receiptCleanup = useImageUploadCleanup();

  const defaultLeaderMember = activeMembers.find(
    (m) => m.role === 'LEADER' || m.userId === currentUserId
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<GroupExpenseCreateFormValues>({
    resolver: zodResolver(groupExpenseCreateSchema),
    defaultValues: {
      title: '',
      amount: undefined,
      paidByMemberId: defaultLeaderMember?.matchingMemberId || '',
      beneficiaryScope: 'ALL_MEMBERS',
      beneficiaryMemberIds: [],
      splitMethod: 'EQUAL',
      spentAt: getLocalCurrentDatetime(),
      receiptUrl: '',
      note: '',
    },
  });

  const enteredAmount = useWatch({ control, name: 'amount' }) || 0;
  const receiptUrl = useWatch({ control, name: 'receiptUrl' });

  // Beneficiary members list
  const currentBeneficiaryMembers = useMemo(() => {
    if (scope === 'ALL_MEMBERS') {
      return activeMembers;
    }
    return activeMembers.filter((m) => selectedMembers.includes(m.matchingMemberId));
  }, [scope, activeMembers, selectedMembers]);

  // Sum of custom shares
  const totalCustomSharesSum = useMemo(() => {
    if (splitMethod !== 'CUSTOM') return enteredAmount;
    return currentBeneficiaryMembers.reduce(
      (sum, m) => sum + (customSharesMap[m.matchingMemberId] || 0),
      0
    );
  }, [splitMethod, customSharesMap, currentBeneficiaryMembers, enteredAmount]);

  const difference = (Number(enteredAmount) || 0) - totalCustomSharesSum;
  const isCustomBalanced = Math.abs(difference) < 1;

  // Auto distribute equally helper
  const handleAutoDistribute = () => {
    if (!enteredAmount || currentBeneficiaryMembers.length === 0) return;
    const baseShare = Math.floor(enteredAmount / currentBeneficiaryMembers.length);
    const remainder = enteredAmount - baseShare * currentBeneficiaryMembers.length;

    const newMap: Record<string, number> = {};
    currentBeneficiaryMembers.forEach((m, idx) => {
      newMap[m.matchingMemberId] = baseShare + (idx === 0 ? remainder : 0);
    });
    setCustomSharesMap(newMap);
  };

  useEffect(() => {
    if (isOpen) {
      setScope('ALL_MEMBERS');
      setSelectedMembers(activeMembers.map((m) => m.matchingMemberId));
      setSplitMethod('EQUAL');
      setCustomSharesMap({});
      reset({
        title: '',
        amount: undefined,
        paidByMemberId: defaultLeaderMember?.matchingMemberId || '',
        beneficiaryScope: 'ALL_MEMBERS',
        beneficiaryMemberIds: [],
        splitMethod: 'EQUAL',
        spentAt: getLocalCurrentDatetime(),
        receiptUrl: '',
        note: '',
      });
    }
  }, [isOpen, activeMembers, defaultLeaderMember, reset]);

  const handleClose = () => {
    receiptCleanup.discard();
    onClose();
  };

  const onSubmit = (data: GroupExpenseCreateFormValues) => {
    if (scope === 'SELECTED_MEMBERS' && selectedMembers.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 thành viên hưởng lợi');
      return;
    }

    if (splitMethod === 'CUSTOM' && !isCustomBalanced) {
      toast.error('Tổng tiền phân chia cho từng người chưa khớp với Tổng số tiền của hóa đơn');
      return;
    }

    const payload: GroupExpenseCreateRequest = {
      title: data.title.trim(),
      amount: data.amount,
      paidByMemberId: data.paidByMemberId,
      beneficiaryScope: scope,
      splitMethod: splitMethod,
      spentAt: data.spentAt ? new Date(data.spentAt).toISOString() : new Date().toISOString(),
      receiptUrl: data.receiptUrl?.trim() || null,
      note: data.note?.trim() || null,
      beneficiaryMemberIds:
        scope === 'SELECTED_MEMBERS'
          ? selectedMembers
          : activeMembers.map((m) => m.matchingMemberId),
      customShares:
        splitMethod === 'CUSTOM'
          ? currentBeneficiaryMembers.map((m) => ({
              matchingMemberId: m.matchingMemberId,
              amount: customSharesMap[m.matchingMemberId] || 0,
            }))
          : undefined,
    };

    createExpenseMutation.mutate(payload, {
      onSuccess: () => {
        receiptCleanup.commit();
        toast.success('Đã thêm hóa đơn chi tiêu thành công');
        onClose();
      },
      onError: (err: unknown) => {
        toast.error(err instanceof Error ? err.message : 'Có lỗi khi lưu hóa đơn');
      },
    });
  };

  return (
    <AppModalShell open={isOpen} onClose={handleClose} className="max-w-xl p-6">
      <div className="flex items-center gap-2 text-foreground font-extrabold text-base mb-4">
        <Plus className="h-5 w-5 text-primary" />
        Nhập Hóa Đơn / Khoản Chi Thực Tế
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-primary" />
            Tên khoản chi / Hóa đơn (*):
          </label>
          <input
            type="text"
            placeholder="Ví dụ: Ăn tối lẩu gà lá é ngày 1, Mua nước suối & lương khô..."
            {...register('title')}
            className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.title && (
            <p className="text-destructive text-[11px] font-bold">{errors.title.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              Tổng số tiền (VND) (*):
            </label>
            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <AppCurrencyInput
                  placeholder="0"
                  value={field.value ?? 0}
                  onChange={field.onChange}
                  className="w-full p-3 text-sm font-extrabold text-primary"
                />
              )}
            />
            {errors.amount && (
              <p className="text-destructive text-[11px] font-bold">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5 text-primary" />
              Người đã thanh toán / ứng trước:
            </label>
            <select
              {...register('paidByMemberId')}
              className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground outline-none focus:ring-2 focus:ring-primary font-medium"
            >
              {activeMembers.map((m) => (
                <option key={m.matchingMemberId} value={m.matchingMemberId}>
                  {m.fullName} {m.userId === currentUserId ? '(Bạn)' : ''}{' '}
                  {m.role === 'LEADER' ? '👑 Trưởng nhóm' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            Thời gian chi tiêu:
          </label>
          <input
            type="datetime-local"
            {...register('spentAt')}
            className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Split Form Fields */}
        <ExpenseSplitFormFields
          activeMembers={activeMembers}
          scope={scope}
          setScope={setScope}
          selectedMembers={selectedMembers}
          setSelectedMembers={setSelectedMembers}
          splitMethod={splitMethod}
          setSplitMethod={setSplitMethod}
          customSharesMap={customSharesMap}
          setCustomSharesMap={setCustomSharesMap}
          currentBeneficiaryMembers={currentBeneficiaryMembers}
          enteredAmount={enteredAmount}
          totalCustomSharesSum={totalCustomSharesSum}
          difference={difference}
          isCustomBalanced={isCustomBalanced}
          onAutoDistribute={handleAutoDistribute}
        />

        {/* Receipt Image Upload */}
        <ExpenseReceiptUpload
          receiptUrl={receiptUrl}
          onReceiptChange={(url: string) => {
            setValue('receiptUrl', url, { shouldValidate: true });
            if (url) receiptCleanup.track(url);
          }}
          cleanup={receiptCleanup}
          onUploadingChange={setIsUploadingReceipt}
        />

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground">Ghi chú thêm:</label>
          <textarea
            rows={2}
            placeholder="Địa chỉ quán, chi tiết món gọi hoặc lưu ý thanh toán..."
            {...register('note')}
            className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl px-4 py-2.5 text-xs font-bold text-muted-foreground hover:bg-muted/50 transition cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={createExpenseMutation.isPending || isUploadingReceipt}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition shadow-sm cursor-pointer disabled:opacity-50"
          >
            {createExpenseMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              'Lưu hóa đơn'
            )}
          </button>
        </div>
      </form>
    </AppModalShell>
  );
}
