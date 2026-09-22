import { Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CATEGORY_META } from '../../../constants';
import type { CustomJourneyCostItemResponse } from '../../../types/workspace';

interface GroupCostItemListSectionProps {
  isLoadingBudget: boolean;
  liveCostItems: CustomJourneyCostItemResponse[];
  plannedMemberCount: number;
  isLeader: boolean;
  isCustomJourney: boolean;
  isLocked?: boolean;
  isCancelled: boolean;
  onEditItem: (item: CustomJourneyCostItemResponse) => void;
  onDeleteItem: (item: CustomJourneyCostItemResponse) => void;
}

export function GroupCostItemListSection({
  isLoadingBudget,
  liveCostItems,
  plannedMemberCount,
  isLeader,
  isCustomJourney,
  isLocked,
  isCancelled,
  onEditItem,
  onDeleteItem,
}: GroupCostItemListSectionProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-left text-xs">
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
                    {isLeader && isCustomJourney && !isLocked && !isCancelled ? (
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onEditItem(item)}
                          className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition cursor-pointer"
                          title="Sửa"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteItem(item)}
                          className="p-1.5 text-destructive hover:text-destructive/80 rounded-lg hover:bg-destructive/10 transition cursor-pointer"
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
  );
}
