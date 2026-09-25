import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, CheckCircle2, FileText, Loader2, Save, UserCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import {
  AppCurrencyInput,
  AppFormDatePicker,
  AppModalShell,
  useImageUploadCleanup,
} from '@/shared/ui';
import { toast } from '@/store/useToastStore';
import { useUpdateGroupExpense } from '../../../hooks/useGroupExpenseWorkspace';
import type {
  BeneficiaryScope,
  GroupExpenseResponse,
  GroupExpenseUpdateRequest,
  SplitMethod,
} from '../../../types/expense';
import type { MatchingMemberItem } from '../../../types/matchingGroup';
import {
  type GroupExpenseUpdateFormValues,
  groupExpenseUpdateSchema,
} from '../../../validations/expenseValidation';
import { ExpenseReceiptUpload } from './ExpenseReceiptUpload';
import { ExpenseSplitFormFields } from './ExpenseSplitFormFields';

interface EditExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  expense: GroupExpenseResponse | null;
  members: MatchingMemberItem[];
}

export function EditExpenseModal({
  isOpen,
  onClose,
  groupId,
  expense,
  members,
}: EditExpenseModalProps) {
  const updateExpenseMutation = useUpdateGroupExpense(groupId);
  const activeMembers = useMemo(
    () =>
      members.filter(
        (m): m is MatchingMemberItem & { matchingMemberId: string } =>
          m.status === 'ACCEPTED' && Boolean(m.matchingMemberId)
      ),
    [members]
  );

  const [scope, setScope] = useState<BeneficiaryScope>(expense?.beneficiaryScope || 'ALL_MEMBERS');
  const [selectedMembers, setSelectedMembers] = useState<string[]>(
    expense?.shares.map((s) => s.member.matchingMemberId) ||
      activeMembers.map((m) => m.matchingMemberId)
  );
  const [splitMethod, setSplitMethod] = useState<SplitMethod>(expense?.splitMethod || 'EQUAL');
  const [customSharesMap, setCustomSharesMap] = useState<Record<string, number>>({});
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const receiptCleanup = useImageUploadCleanup();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<GroupExpenseUpdateFormValues>({
    resolver: zodResolver(groupExpenseUpdateSchema),
    defaultValues: {
      title: expense?.title || '',
      amount: expense?.amount || 0,
      paidByMemberId: expense?.payer.matchingMemberId || '',
      beneficiaryScope: expense?.beneficiaryScope || 'ALL_MEMBERS',
      splitMethod: expense?.splitMethod || 'EQUAL',
      spentAt: expense?.spentAt
        ? expense.spentAt.slice(0, 16)
        : new Date().toISOString().slice(0, 16),
      receiptUrl: expense?.receiptUrl || '',
      note: expense?.note || '',
    },
  });

  const enteredAmount = useWatch({ control, name: 'amount' }) || expense?.amount || 0;
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
    return currentBeneficiaryMembers.reduce((acc, m) => {
      const val = customSharesMap[m.matchingMemberId] || 0;
      return acc + val;
    }, 0);
  }, [currentBeneficiaryMembers, customSharesMap]);

  const difference = useMemo(() => {
    return (Number(enteredAmount) || 0) - totalCustomSharesSum;
  }, [enteredAmount, totalCustomSharesSum]);

  const isCustomBalanced = Math.abs(difference) < 0.01 && Number(enteredAmount) > 0;

  // Auto fill equal amounts to custom shares
  const handleAutoDistribute = () => {
    const numAmount = Number(enteredAmount) || 0;
    if (numAmount <= 0) {
      toast.warning('Vui lòng nhập tổng số tiền chi trước khi chia đều');
      return;
    }
    const count = currentBeneficiaryMembers.length;
    if (count === 0) return;

    const baseAmount = Math.floor(numAmount / count);
    const remainder = numAmount - baseAmount * count;

    const newMap: Record<string, number> = {};
    currentBeneficiaryMembers.forEach((m, idx) => {
      newMap[m.matchingMemberId] = idx === 0 ? baseAmount + remainder : baseAmount;
    });
    setCustomSharesMap(newMap);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: sync modal state with current expense prop
  useEffect(() => {
    if (isOpen && expense) {
      receiptCleanup.commit();
      setScope(expense.beneficiaryScope || 'ALL_MEMBERS');
      setSelectedMembers(
        expense.shares && expense.shares.length > 0
          ? expense.shares.map((s) => s.member.matchingMemberId)
          : activeMembers.map((m) => m.matchingMemberId)
      );
      setSplitMethod(expense.splitMethod || 'EQUAL');

      if (expense.shares && expense.shares.length > 0) {
        const initialMap: Record<string, number> = {};
        expense.shares.forEach((s) => {
          initialMap[s.member.matchingMemberId] = s.shareAmount;
        });
        setCustomSharesMap(initialMap);
      } else {
        setCustomSharesMap({});
      }

      reset({
        title: expense.title,
        amount: expense.amount,
        paidByMemberId: expense.payer.matchingMemberId,
        beneficiaryScope: expense.beneficiaryScope,
        splitMethod: expense.splitMethod,
        spentAt: expense.spentAt
          ? expense.spentAt.slice(0, 16)
          : new Date().toISOString().slice(0, 16),
        receiptUrl: expense.receiptUrl || '',
        note: expense.note || '',
      });
    }
  }, [isOpen, expense]);

  if (!expense) return null;

  const handleClose = () => {
    receiptCleanup.discard();
    onClose();
  };

  const onSubmit = (data: GroupExpenseUpdateFormValues) => {
    if (scope === 'SELECTED_MEMBERS' && selectedMembers.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 thành viên hưởng lợi');
      return;
    }

    if (splitMethod === 'CUSTOM' && !isCustomBalanced) {
      toast.error('Tổng tiền phân chia cho từng người chưa khớp với Tổng số tiền của hóa đơn');
      return;
    }

    const payload: GroupExpenseUpdateRequest = {
      title: data.title?.trim() || '',
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

    updateExpenseMutation.mutate(
      { expenseId: expense.groupExpenseId, payload },
      {
        onSuccess: () => {
          receiptCleanup.commit();
          toast.success('Đã cập nhật hóa đơn chi tiêu');
          onClose();
        },
        onError: (err: unknown) => {
          toast.error(err instanceof Error ? err.message : 'Có lỗi khi cập nhật hóa đơn');
        },
      }
    );
  };

  return (
    <AppModalShell open={isOpen} onClose={handleClose} className="max-w-xl p-6">
      <div className="flex items-center gap-2 text-foreground font-extrabold text-base mb-4">
        <Save className="h-5 w-5 text-primary" />
        Chỉnh Sửa Hóa Đơn / Khoản Chi Thực Tế
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
                  {m.fullName}
                  {m.role === 'LEADER' ? ' (Trưởng nhóm)' : ''}
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
          <AppFormDatePicker
            name="spentAt"
            control={control}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            timeCaption="Giờ"
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
            disabled={updateExpenseMutation.isPending || isUploadingReceipt}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition shadow-sm cursor-pointer disabled:opacity-50"
          >
            {updateExpenseMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              'Cập nhật hóa đơn'
            )}
          </button>
        </div>
      </form>
    </AppModalShell>
  );
}
