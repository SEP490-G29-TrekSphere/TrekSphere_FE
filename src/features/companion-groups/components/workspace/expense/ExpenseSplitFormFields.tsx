import { AlertCircle, Calculator, CheckCircle2, Scale, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AppCurrencyInput } from '@/shared/ui';
import type { BeneficiaryScope, SplitMethod } from '../../../types/expense';
import type { MatchingMemberItem } from '../../../types/matchingGroup';
import { MemberAvatar } from '../../detail/MemberAvatar';

interface ExpenseSplitFormFieldsProps {
  activeMembers: (MatchingMemberItem & { matchingMemberId: string })[];
  scope: BeneficiaryScope;
  setScope: (scope: BeneficiaryScope) => void;
  selectedMembers: string[];
  setSelectedMembers: React.Dispatch<React.SetStateAction<string[]>>;
  splitMethod: SplitMethod;
  setSplitMethod: (method: SplitMethod) => void;
  customSharesMap: Record<string, number>;
  setCustomSharesMap: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  currentBeneficiaryMembers: (MatchingMemberItem & { matchingMemberId: string })[];
  enteredAmount: number;
  totalCustomSharesSum: number;
  difference: number;
  isCustomBalanced: boolean;
  onAutoDistribute: () => void;
}

export function ExpenseSplitFormFields({
  activeMembers,
  scope,
  setScope,
  selectedMembers,
  setSelectedMembers,
  splitMethod,
  setSplitMethod,
  customSharesMap,
  setCustomSharesMap,
  currentBeneficiaryMembers,
  enteredAmount,
  totalCustomSharesSum,
  difference,
  isCustomBalanced,
  onAutoDistribute,
}: ExpenseSplitFormFieldsProps) {
  return (
    <div className="space-y-4 rounded-xl border border-border bg-muted/20 p-3.5">
      <div className="space-y-2">
        <label className="text-xs font-bold text-foreground flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-primary" />
            Phạm vi người cùng hưởng thụ / chịu chi:
          </span>
          <span className="text-[11px] font-normal text-muted-foreground">
            ({currentBeneficiaryMembers.length}/{activeMembers.length} thành viên)
          </span>
        </label>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setScope('ALL_MEMBERS');
              setSelectedMembers(activeMembers.map((m) => m.matchingMemberId));
            }}
            className={cn(
              'flex items-center justify-center gap-2 rounded-xl p-2.5 text-xs font-bold border transition cursor-pointer',
              scope === 'ALL_MEMBERS'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-background text-muted-foreground hover:bg-muted/50'
            )}
          >
            <Users className="h-3.5 w-3.5" />
            Cả đoàn ({activeMembers.length} người)
          </button>
          <button
            type="button"
            onClick={() => setScope('SELECTED_MEMBERS')}
            className={cn(
              'flex items-center justify-center gap-2 rounded-xl p-2.5 text-xs font-bold border transition cursor-pointer',
              scope === 'SELECTED_MEMBERS'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-background text-muted-foreground hover:bg-muted/50'
            )}
          >
            <Users className="h-3.5 w-3.5" />
            Chỉ định thành viên
          </button>
        </div>

        {/* Member Checkboxes for SELECTED_MEMBERS */}
        {scope === 'SELECTED_MEMBERS' && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted-foreground">
                Chọn người hưởng lợi:
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMembers(activeMembers.map((m) => m.matchingMemberId))}
                  className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                >
                  Chọn tất cả
                </button>
                <span className="text-muted-foreground">•</span>
                <button
                  type="button"
                  onClick={() => setSelectedMembers([])}
                  className="text-[10px] font-bold text-muted-foreground hover:underline cursor-pointer"
                >
                  Bỏ chọn
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
              {activeMembers.map((m) => {
                const isSelected = selectedMembers.includes(m.matchingMemberId);
                return (
                  <label
                    key={m.matchingMemberId}
                    className={cn(
                      'flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition select-none',
                      isSelected
                        ? 'border-primary/40 bg-primary/5 text-foreground font-bold'
                        : 'border-border bg-background text-muted-foreground hover:bg-muted/30'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedMembers((prev) => [...prev, m.matchingMemberId]);
                        } else {
                          setSelectedMembers((prev) =>
                            prev.filter((id) => id !== m.matchingMemberId)
                          );
                        }
                      }}
                      className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
                    />
                    <MemberAvatar
                      fullName={m.fullName}
                      avatarUrl={m.avatarUrl ?? undefined}
                      size="sm"
                    />
                    <span className="truncate flex-1">{m.fullName}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2 pt-2 border-t border-border">
        <label className="text-xs font-bold text-foreground flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Scale className="h-3.5 w-3.5 text-primary" />
            Quy tắc phân chia tiền:
          </span>
        </label>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setSplitMethod('EQUAL')}
            className={cn(
              'flex items-center justify-center gap-2 rounded-xl p-2.5 text-xs font-bold border transition cursor-pointer',
              splitMethod === 'EQUAL'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-background text-muted-foreground hover:bg-muted/50'
            )}
          >
            <Scale className="h-3.5 w-3.5" />
            Chia đều tự động
          </button>
          <button
            type="button"
            onClick={() => {
              setSplitMethod('CUSTOM');
              if (Object.keys(customSharesMap).length === 0) {
                onAutoDistribute();
              }
            }}
            className={cn(
              'flex items-center justify-center gap-2 rounded-xl p-2.5 text-xs font-bold border transition cursor-pointer',
              splitMethod === 'CUSTOM'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-background text-muted-foreground hover:bg-muted/50'
            )}
          >
            <Calculator className="h-3.5 w-3.5" />
            Tùy chỉnh từng người
          </button>
        </div>

        {/* EQUAL SPLIT PREVIEW */}
        {splitMethod === 'EQUAL' && (
          <div className="rounded-xl bg-background border border-border p-3 text-xs flex items-center justify-between">
            <span className="text-muted-foreground">Mỗi người chịu:</span>
            <span className="font-extrabold text-primary text-sm">
              {currentBeneficiaryMembers.length > 0
                ? Math.round(
                    (Number(enteredAmount) || 0) / currentBeneficiaryMembers.length
                  ).toLocaleString('vi-VN')
                : 0}
              đ
            </span>
          </div>
        )}

        {/* CUSTOM SPLIT PER MEMBER INPUTS */}
        {splitMethod === 'CUSTOM' && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted-foreground">
                Số tiền mỗi người phải chịu:
              </span>
              <button
                type="button"
                onClick={onAutoDistribute}
                className="text-[10px] font-bold text-primary hover:underline cursor-pointer flex items-center gap-1"
              >
                <Calculator className="h-3 w-3" /> Chia đều mẫu
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {currentBeneficiaryMembers.map((m) => (
                <div
                  key={m.matchingMemberId}
                  className="flex items-center justify-between gap-3 p-2 rounded-xl bg-background border border-border"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <MemberAvatar
                      fullName={m.fullName}
                      avatarUrl={m.avatarUrl ?? undefined}
                      size="sm"
                    />
                    <span className="text-xs font-bold text-foreground truncate max-w-[120px]">
                      {m.fullName}
                    </span>
                  </div>
                  <div className="w-32">
                    <AppCurrencyInput
                      placeholder="0"
                      value={customSharesMap[m.matchingMemberId] ?? 0}
                      onChange={(val) => {
                        setCustomSharesMap((prev) => ({
                          ...prev,
                          [m.matchingMemberId]: val || 0,
                        }));
                      }}
                      className="w-full text-right p-1.5 text-xs font-bold"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* BALANCE DIFFERENCE BAR */}
            <div
              className={cn(
                'rounded-xl border p-2.5 text-xs flex items-center justify-between font-bold',
                isCustomBalanced
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
              )}
            >
              <div className="flex items-center gap-1.5">
                {isCustomBalanced ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0" />
                )}
                <span>
                  Đã chia: {totalCustomSharesSum.toLocaleString('vi-VN')}đ /{' '}
                  {(Number(enteredAmount) || 0).toLocaleString('vi-VN')}đ
                </span>
              </div>
              <div>
                {!isCustomBalanced && (
                  <span>
                    {difference > 0
                      ? `Còn thiếu ${difference.toLocaleString('vi-VN')}đ`
                      : `Dư ${Math.abs(difference).toLocaleString('vi-VN')}đ`}
                  </span>
                )}
                {isCustomBalanced && <span>Khớp 100%</span>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
