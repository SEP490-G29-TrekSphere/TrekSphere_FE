import {
  Bus,
  CircleDollarSign,
  Compass,
  Info,
  ShieldCheck,
  Tent,
  UtensilsCrossed,
  WalletCards,
} from 'lucide-react';
import type {
  CostItemCategory,
  CustomJourneyCostItem,
  MatchingGroupDetailResponse,
} from '../../types/matchingGroup';

interface GroupBudgetTabProps {
  group: MatchingGroupDetailResponse;
}

const CATEGORY_META: Record<CostItemCategory, { label: string; icon: typeof CircleDollarSign }> = {
  PERMIT: { label: 'Giấy phép & Phí bảo tồn', icon: ShieldCheck },
  GUIDE: { label: 'Hướng dẫn viên & Porter', icon: Compass },
  FOOD: { label: 'Ăn uống & Nước uống', icon: UtensilsCrossed },
  TRANSPORT: { label: 'Di chuyển & Xe đưa đón', icon: Bus },
  GEAR: { label: 'Thuê lều & Trang bị', icon: Tent },
  OTHER: { label: 'Chi phí phát sinh khác', icon: CircleDollarSign },
};

export function GroupBudgetTab({ group }: GroupBudgetTabProps) {
  const costItems: CustomJourneyCostItem[] = group.costItems ?? [];
  const hasCostItems = costItems.length > 0;
  const totalItemizedCost = costItems.reduce((sum, item) => sum + (item.estimatedAmount || 0), 0);
  const displayEstimatedCost = group.estimatedCost || totalItemizedCost;

  return (
    <div className="space-y-6">
      {/* 1. Summary Card */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h3 className="text-base font-bold text-foreground">Dự toán chi phí hành trình</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Chi phí ước tính chia đều trên mỗi thành viên
            </p>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-xs text-muted-foreground">Ngân sách dự kiến</span>
            <div className="text-xl font-black text-primary">
              {displayEstimatedCost.toLocaleString('vi-VN')} đ
              <span className="text-xs font-normal text-muted-foreground"> / người</span>
            </div>
          </div>
        </div>

        {/* Cost items table / list */}
        {hasCostItems ? (
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Các khoản chi tiết ({costItems.length} hạng mục)
            </h4>
            <div className="divide-y divide-border rounded-2xl border border-border bg-background overflow-hidden">
              {costItems.map((item, idx) => {
                const meta = CATEGORY_META[item.category] ?? CATEGORY_META.OTHER;
                const Icon = meta.icon;

                return (
                  <div
                    key={item.customJourneyCostItemId || `cost-${idx}`}
                    className="flex items-center justify-between p-4 text-xs hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-bold text-foreground">{item.itemName}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {meta.label}
                          {item.note && ` • ${item.note}`}
                        </div>
                      </div>
                    </div>
                    <div className="text-right font-bold text-foreground">
                      {item.estimatedAmount.toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center space-y-2">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary">
              <WalletCards className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold text-foreground">
              Chi phí trọn gói theo báo giá của chuyến đi
            </p>
            <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
              Trưởng nhóm dự kiến mức chi phí khoảng {displayEstimatedCost.toLocaleString('vi-VN')}{' '}
              đ mỗi thành viên, bao gồm các dịch vụ cơ bản.
            </p>
          </div>
        )}

        <div className="flex items-start gap-2.5 rounded-xl bg-muted/40 p-3.5 text-xs text-muted-foreground">
          <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Mô hình ghép nhóm TrekSphere hoạt động theo nguyên tắc chia sẻ chi phí thực tế minh bạch
            (C2C). Số tiền thanh toán cuối cùng sẽ dựa trên hóa đơn thực tế của cả đoàn sau khi hoàn
            thành chuyến đi.
          </p>
        </div>
      </div>
    </div>
  );
}
