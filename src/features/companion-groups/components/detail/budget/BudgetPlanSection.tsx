import { Calculator, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CustomJourneyCostItemResponse } from '../../../types/workspace';
import { CATEGORY_META } from './categoryMeta';

export interface BudgetPlanSectionProps {
  liveCostItems: CustomJourneyCostItemResponse[];
  totalItemizedCost: number;
  plannedMemberCount: number;
  activeMemberCount: number;
  effectivePerMemberCost: number;
  isLoadingBudget: boolean;
  isLeader: boolean;
  isCustomJourney: boolean;
  isGroupLocked?: boolean;
  isCancelled?: boolean;
  onAddCostItem: () => void;
  onEditCostItem: (item: CustomJourneyCostItemResponse) => void;
  onDeleteCostItem: (item: CustomJourneyCostItemResponse) => void;
}

export function BudgetPlanSection({
  liveCostItems,
  totalItemizedCost,
  plannedMemberCount,
  activeMemberCount,
  effectivePerMemberCost,
  isLoadingBudget,
  isLeader,
  isCustomJourney,
  isGroupLocked = false,
  isCancelled = false,
  onAddCostItem,
  onEditCostItem,
  onDeleteCostItem,
}: BudgetPlanSectionProps) {
  const canEdit = isLeader && isCustomJourney && !isGroupLocked && !isCancelled;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
            <Calculator className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Kế Hoạch Dự Toán & Chia Sẻ Chi Phí
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Định mức chi phí chuyến đi được tính toán dựa trên quy mô số lượng thành viên dự kiến
          </p>
        </div>
        {canEdit ? (
          <button
            type="button"
            onClick={onAddCostItem}
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

      {/* Budget Items Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-xs min-w-[640px]">
          <thead className="bg-muted/50 font-bold text-muted-foreground border-b border-border">
            <tr>
              <th className="p-3">Danh Mục</th>
              <th className="p-3">Khoản Chi Tiêu</th>
              <th className="p-3">Tổng Chi Phí</th>
              <th className="p-3">Quy Tắc Chia</th>
              <th className="p-3">Phần / Người</th>
              <th className="p-3">Ghi Chú</th>
              <th className="p-3 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoadingBudget ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-xs text-muted-foreground">
                  Đang tải dữ liệu dự toán...
                </td>
              </tr>
            ) : liveCostItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-xs text-muted-foreground">
                  {isLeader
                    ? 'Chưa có khoản dự toán nào. Hãy bấm "Thêm Khoản Chi Mới" để thiết lập.'
                    : 'Trưởng nhóm chưa thiết lập bảng dự toán chi phí cho chuyến đi này.'}
                </td>
              </tr>
            ) : (
              liveCostItems.map((item, idx) => {
                const meta = CATEGORY_META[item.category] ?? CATEGORY_META.OTHER;
                const Icon = meta.icon;
                const perPerson = Math.round(item.estimatedAmount / (plannedMemberCount || 1));

                return (
                  <tr
                    key={item.customJourneyCostItemId || `budget-${idx}`}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-3 whitespace-nowrap">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border',
                          meta.colorClass
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {meta.label}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-foreground">{item.itemName}</td>
                    <td className="p-3 font-extrabold text-foreground whitespace-nowrap">
                      {item.estimatedAmount.toLocaleString('vi-VN')}đ
                    </td>
                    <td className="p-3 text-muted-foreground whitespace-nowrap">
                      Chia đều {plannedMemberCount} người (dự kiến)
                    </td>
                    <td className="p-3 font-extrabold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      {perPerson.toLocaleString('vi-VN')}đ
                    </td>
                    <td className="p-3 text-muted-foreground max-w-[200px] truncate">
                      {item.note || '-'}
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      {canEdit ? (
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onEditCostItem(item)}
                            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition cursor-pointer"
                            title="Sửa"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteCostItem(item)}
                            className="p-1.5 text-rose-500 hover:text-rose-600 rounded-lg hover:bg-rose-500/10 transition cursor-pointer"
                            title="Xóa"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-muted-foreground italic">Chỉ xem</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
