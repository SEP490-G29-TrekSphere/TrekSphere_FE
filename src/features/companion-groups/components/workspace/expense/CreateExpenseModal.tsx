import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  Calculator,
  Calendar,
  CheckCircle2,
  DollarSign,
  FileText,
  Loader2,
  Plus,
  Scale,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { profileService } from '@/features/profile/services/profileService';
import { AppModalShell } from '@/shared/ui';
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
import { MemberAvatar } from '../../detail/MemberAvatar';
import { ExpenseReceiptUploader } from './ExpenseReceiptUploader';

interface CreateExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  members: MatchingMemberItem[];
  currentUserId?: string;
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
  const newlyUploadedUrlRef = useRef<string | null>(null);

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
      spentAt: new Date().toISOString().slice(0, 16),
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
      // Add remainder to the first person so sum matches exact amount
      newMap[m.matchingMemberId] = idx === 0 ? baseAmount + remainder : baseAmount;
    });
    setCustomSharesMap(newMap);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset modal state when opened
  useEffect(() => {
    if (isOpen) {
      newlyUploadedUrlRef.current = null;
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
        spentAt: new Date().toISOString().slice(0, 16),
        receiptUrl: '',
        note: '',
      });
    }
  }, [isOpen, reset, defaultLeaderMember, activeMembers.length]);

  const toggleMemberSelection = (memberId: string) => {
    setSelectedMembers((prev) => {
      if (prev.includes(memberId)) {
        if (prev.length === 1) {
          toast.warning('Khoản chi phải có ít nhất 1 thành viên thụ hưởng');
          return prev;
        }
        return prev.filter((id) => id !== memberId);
      }
      return [...prev, memberId];
    });
  };

  const handleCustomShareChange = (memberId: string, value: string) => {
    const num = parseFloat(value) || 0;
    setCustomSharesMap((prev) => ({
      ...prev,
      [memberId]: Math.max(0, num),
    }));
  };

  const onFormError = (formErrors: typeof errors) => {
    if (formErrors.title?.message) {
      toast.error(formErrors.title.message);
    } else if (formErrors.amount?.message) {
      toast.error(formErrors.amount.message);
    } else if (formErrors.receiptUrl?.message) {
      toast.error(formErrors.receiptUrl.message);
    } else {
      toast.error('Vui lòng kiểm tra lại thông tin biểu mẫu');
    }
  };

  const onSubmit = async (data: GroupExpenseCreateFormValues) => {
    try {
      const amountVal = Number(data.amount);
      if (!amountVal || amountVal <= 0) {
        toast.error('Số tiền chi tiêu phải lớn hơn 0');
        return;
      }

      if (splitMethod === 'CUSTOM') {
        if (!isCustomBalanced) {
          toast.error(
            difference > 0
              ? `Số tiền chia còn thiếu ${difference.toLocaleString('vi-VN')} đ so với tổng tiền`
              : `Số tiền chia vượt quá ${Math.abs(difference).toLocaleString('vi-VN')} đ so với tổng tiền`
          );
          return;
        }

        const customSharesList = currentBeneficiaryMembers.map((m) => ({
          matchingMemberId: m.matchingMemberId,
          amount: customSharesMap[m.matchingMemberId] || 0,
        }));

        const hasZeroShare = customSharesList.some((s) => s.amount <= 0);
        if (hasZeroShare) {
          toast.error('Mỗi thành viên thụ hưởng phải được phân bổ số tiền lớn hơn 0');
          return;
        }

        const payload: GroupExpenseCreateRequest = {
          title: data.title.trim(),
          amount: amountVal,
          paidByMemberId: data.paidByMemberId || defaultLeaderMember?.matchingMemberId,
          beneficiaryScope: scope,
          beneficiaryMemberIds: scope === 'SELECTED_MEMBERS' ? selectedMembers : [],
          splitMethod: 'CUSTOM',
          customShares: customSharesList,
          spentAt: data.spentAt ? new Date(data.spentAt).toISOString() : new Date().toISOString(),
          receiptUrl: data.receiptUrl?.trim() || null,
          note: data.note?.trim() || null,
        };

        await createExpenseMutation.mutateAsync(payload);
      } else {
        const payload: GroupExpenseCreateRequest = {
          title: data.title.trim(),
          amount: amountVal,
          paidByMemberId: data.paidByMemberId || defaultLeaderMember?.matchingMemberId,
          beneficiaryScope: scope,
          beneficiaryMemberIds: scope === 'SELECTED_MEMBERS' ? selectedMembers : [],
          splitMethod: 'EQUAL',
          spentAt: data.spentAt ? new Date(data.spentAt).toISOString() : new Date().toISOString(),
          receiptUrl: data.receiptUrl?.trim() || null,
          note: data.note?.trim() || null,
        };

        await createExpenseMutation.mutateAsync(payload);
      }

      newlyUploadedUrlRef.current = null;
      toast.success('Ghi nhận khoản chi tiêu thực tế thành công!');
      onClose();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Không thể tạo khoản chi. Vui lòng thử lại!';
      toast.error(errorMsg);
    }
  };

  const handleClose = () => {
    if (newlyUploadedUrlRef.current) {
      profileService.deleteFile(newlyUploadedUrlRef.current).catch(() => {});
      newlyUploadedUrlRef.current = null;
    }
    onClose();
  };

  return (
    <AppModalShell
      open={isOpen}
      onClose={handleClose}
      aria-label="Thêm khoản chi tiêu mới"
      className="flex max-w-xl flex-col overflow-hidden border border-border p-0"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Plus className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Thêm khoản chi tiêu mới</h3>
            <p className="text-[11px] text-muted-foreground">
              Ghi nhận hóa đơn chi tiêu thực tế phát sinh trong chuyến đi
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleClose}
          disabled={createExpenseMutation.isPending}
          className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit, onFormError)}
        className="space-y-4 p-5 max-h-[80vh] overflow-y-auto"
      >
        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground">
            Tên khoản chi <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="VD: Bữa tối lẩu cá hồi, Mua vé cáp treo..."
              {...register('title')}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden"
            />
          </div>
          {errors.title && (
            <p className="text-[11px] text-destructive font-medium">{errors.title.message}</p>
          )}
        </div>

        {/* Amount & Paid By */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              Số tiền (VNĐ) <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="1000"
                min="1000"
                placeholder="VD: 500000"
                {...register('amount', { valueAsNumber: true })}
                className="w-full rounded-xl border border-border bg-background pl-9 pr-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden font-bold"
              />
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            {errors.amount && (
              <p className="text-[11px] text-destructive font-medium">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Người chi trả</label>
            <select
              {...register('paidByMemberId')}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:outline-hidden"
            >
              {activeMembers.map((m) => (
                <option key={m.matchingMemberId} value={m.matchingMemberId}>
                  {m.fullName} {m.role === 'LEADER' ? '(Trưởng nhóm)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Beneficiary Scope Selection */}
        <div className="space-y-2 rounded-2xl border border-border bg-muted/20 p-3.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-primary" /> Phạm vi thụ hưởng
            </label>
            <div className="flex rounded-lg border border-border bg-background p-0.5 text-[11px]">
              <button
                type="button"
                onClick={() => {
                  setScope('ALL_MEMBERS');
                  setValue('beneficiaryScope', 'ALL_MEMBERS');
                }}
                className={`px-2.5 py-1 rounded-md font-bold transition cursor-pointer ${
                  scope === 'ALL_MEMBERS'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Cả đoàn ({activeMembers.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setScope('SELECTED_MEMBERS');
                  setValue('beneficiaryScope', 'SELECTED_MEMBERS');
                }}
                className={`px-2.5 py-1 rounded-md font-bold transition cursor-pointer ${
                  scope === 'SELECTED_MEMBERS'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Chọn người ({selectedMembers.length})
              </button>
            </div>
          </div>

          {scope === 'SELECTED_MEMBERS' && (
            <div className="pt-2 space-y-1.5">
              <p className="text-[11px] text-muted-foreground">
                Chọn các thành viên cùng tham gia chi tiêu:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                {activeMembers.map((member) => {
                  const isChecked = selectedMembers.includes(member.matchingMemberId);
                  return (
                    <label
                      key={member.matchingMemberId}
                      className={`flex items-center gap-2 rounded-xl border p-2 text-xs transition cursor-pointer ${
                        isChecked
                          ? 'border-primary/50 bg-primary/5 text-foreground font-semibold'
                          : 'border-border bg-background text-muted-foreground'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleMemberSelection(member.matchingMemberId)}
                        className="rounded border-border text-primary focus:ring-primary"
                      />
                      <span className="truncate">{member.fullName}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Split Method Selection */}
        <div className="space-y-3 rounded-2xl border border-border bg-card p-3.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Scale className="h-3.5 w-3.5 text-primary" /> Phương thức chia tiền
            </label>
            <div className="flex rounded-lg border border-border bg-muted/40 p-0.5 text-[11px]">
              <button
                type="button"
                onClick={() => {
                  setSplitMethod('EQUAL');
                  setValue('splitMethod', 'EQUAL');
                }}
                className={`px-3 py-1 rounded-md font-bold transition cursor-pointer ${
                  splitMethod === 'EQUAL'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Chia đều (EQUAL)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSplitMethod('CUSTOM');
                  setValue('splitMethod', 'CUSTOM');
                  if (Object.keys(customSharesMap).length === 0 && enteredAmount > 0) {
                    handleAutoDistribute();
                  }
                }}
                className={`px-3 py-1 rounded-md font-bold transition cursor-pointer ${
                  splitMethod === 'CUSTOM'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Tùy chỉnh (CUSTOM)
              </button>
            </div>
          </div>

          {/* Equal split helper preview */}
          {splitMethod === 'EQUAL' && (
            <div className="rounded-xl bg-muted/30 p-2.5 text-[11px] text-muted-foreground flex items-center justify-between">
              <span>Bình quân mỗi người ({currentBeneficiaryMembers.length} người):</span>
              <strong className="text-foreground text-xs">
                {enteredAmount > 0 && currentBeneficiaryMembers.length > 0
                  ? `${Math.round(enteredAmount / currentBeneficiaryMembers.length).toLocaleString('vi-VN')} đ`
                  : '0 đ'}
              </strong>
            </div>
          )}

          {/* Custom Split Inputs */}
          {splitMethod === 'CUSTOM' && (
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                  Nhập số tiền chi trả cho từng người ({currentBeneficiaryMembers.length} người):
                </span>
                <button
                  type="button"
                  onClick={handleAutoDistribute}
                  className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline cursor-pointer"
                >
                  <Calculator className="h-3 w-3" /> Tự động chia đều lại
                </button>
              </div>

              {/* Members Input List */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {currentBeneficiaryMembers.map((member) => {
                  const val = customSharesMap[member.matchingMemberId] ?? '';
                  return (
                    <div
                      key={member.matchingMemberId}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-2.5"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <MemberAvatar
                          fullName={member.fullName}
                          avatarUrl={member.avatarUrl ?? undefined}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">
                            {member.fullName}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {member.role === 'LEADER' ? 'Trưởng nhóm' : 'Thành viên'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <input
                          type="number"
                          step="1000"
                          min="0"
                          placeholder="0"
                          value={val}
                          onChange={(e) =>
                            handleCustomShareChange(member.matchingMemberId, e.target.value)
                          }
                          className="w-28 rounded-lg border border-border bg-muted/20 px-2.5 py-1.5 text-right text-xs font-bold text-foreground focus:border-primary focus:outline-hidden"
                        />
                        <span className="text-[11px] text-muted-foreground font-semibold">đ</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Status Bar */}
              <div
                className={`flex items-center justify-between rounded-xl p-3 text-xs border ${
                  isCustomBalanced
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                    : 'border-destructive/30 bg-destructive/10 text-destructive'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  {isCustomBalanced ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>Tổng tiền chia đã khớp chính xác</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>
                        {difference > 0
                          ? `Còn thiếu: ${difference.toLocaleString('vi-VN')} đ`
                          : `Vượt quá: ${Math.abs(difference).toLocaleString('vi-VN')} đ`}
                      </span>
                    </>
                  )}
                </div>
                <div className="text-[11px] font-semibold">
                  {totalCustomSharesSum.toLocaleString('vi-VN')} /{' '}
                  {(Number(enteredAmount) || 0).toLocaleString('vi-VN')} đ
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Spent At */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> Thời điểm chi tiền
          </label>
          <input
            type="datetime-local"
            {...register('spentAt')}
            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:outline-hidden"
          />
        </div>

        {/* Receipt Image Upload & URL */}
        <ExpenseReceiptUploader
          value={receiptUrl}
          onChange={(url) => setValue('receiptUrl', url, { shouldValidate: true })}
          newlyUploadedUrlRef={newlyUploadedUrlRef}
          errorMessage={errors.receiptUrl?.message}
          disabled={createExpenseMutation.isPending}
        />

        {/* Note */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-muted-foreground" /> Ghi chú thêm
          </label>
          <textarea
            rows={2}
            placeholder="Ghi chú chi tiết về khoản chi nếu cần..."
            {...register('note')}
            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
          <button
            type="button"
            onClick={handleClose}
            disabled={createExpenseMutation.isPending}
            className="rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={createExpenseMutation.isPending}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 transition cursor-pointer disabled:opacity-50"
          >
            {createExpenseMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Đang ghi nhận...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" /> Ghi nhận chi tiêu
              </>
            )}
          </button>
        </div>
      </form>
    </AppModalShell>
  );
}
