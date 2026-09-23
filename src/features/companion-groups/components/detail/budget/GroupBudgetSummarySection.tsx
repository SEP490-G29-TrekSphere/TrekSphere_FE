import { Calculator, Plus, Users } from 'lucide-react';

interface GroupBudgetSummarySectionProps {
  isLeader: boolean;
  isCustomJourney: boolean;
  isLocked?: boolean;
  isCancelled: boolean;
  totalItemizedCost: number;
  plannedMemberCount: number;
  activeMemberCount: number;
  effectivePerMemberCost: number;
  onOpenAddBudget: () => void;
}

export function GroupBudgetSummarySection({
  isLeader,
  isCustomJourney,
  isLocked,
  isCancelled,
  totalItemizedCost,
  plannedMemberCount,
  activeMemberCount,
  effectivePerMemberCost,
  onOpenAddBudget,
}: GroupBudgetSummarySectionProps) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
            <Calculator className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Kế Hoạch Dự Toán &amp; Chia Sẻ Chi Phí
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Định mức chi phí chuyến đi được tính toán dựa trên quy mô số lượng thành viên dự kiến
          </p>
        </div>
        {isLeader && isCustomJourney && !isLocked && !isCancelled ? (
          <button
            type="button"
            onClick={onOpenAddBudget}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Thêm Khoản Chi Mới
          </button>
        ) : isCancelled ? null : (
          <span
            className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-border px-3 py-2 text-[11px] font-bold text-muted-foreground"
            title="Chỉ Leader được sửa dự toán chung của nhóm"
          >
            Chỉ Leader chỉnh dự toán
          </span>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-1">
          <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            Tổng Chi Phí Đoàn
          </span>
          <div className="text-xl font-black text-foreground">
            {totalItemizedCost.toLocaleString('vi-VN')}đ
          </div>
        </div>

        <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-1">
          <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1">
            <Users className="h-3 w-3 text-muted-foreground" />
            Sĩ Số Dự Kiến
          </span>
          <div className="text-xl font-black text-foreground">
            {plannedMemberCount} Trekker
            <span className="text-[11px] font-normal text-muted-foreground ml-1.5">
              ({activeMemberCount} đã ghép)
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-1">
          <span className="text-[10px] font-bold tracking-wider text-emerald-700 dark:text-emerald-300 uppercase">
            Dự Toán / Trekker
          </span>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
            {effectivePerMemberCost.toLocaleString('vi-VN')}đ
          </div>
        </div>
      </div>
    </div>
  );
}
