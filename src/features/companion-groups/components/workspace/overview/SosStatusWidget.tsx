import { ChevronRight, ShieldCheck, Siren } from 'lucide-react';
import type { SosAlertResponse } from '../../../types/sos';

interface SosStatusWidgetProps {
  activeSosAlerts: SosAlertResponse[];
  onViewSosDetail: () => void;
}

/** Widget tóm tắt trạng thái SOS trong tab Tổng quan — banner sticky đã hiện chi tiết đầy đủ ở trên. */
export function SosStatusWidget({ activeSosAlerts, onViewSosDetail }: SosStatusWidgetProps) {
  const hasActive = activeSosAlerts.length > 0;

  if (!hasActive) {
    return (
      <div className="flex items-center gap-2.5 rounded-3xl border border-border bg-card px-6 py-4 shadow-xs">
        <ShieldCheck className="h-4 w-4 text-emerald-600" />
        <p className="text-xs text-muted-foreground">
          Không có tín hiệu SOS nào đang mở. Nhóm đang an toàn.
        </p>
      </div>
    );
  }

  const latest = activeSosAlerts[0];

  return (
    <button
      type="button"
      onClick={onViewSosDetail}
      className="flex w-full items-center justify-between gap-3 rounded-3xl border-2 border-destructive/60 bg-destructive/5 px-6 py-4 text-left shadow-xs transition hover:bg-destructive/10 cursor-pointer"
    >
      <div className="flex items-center gap-2.5">
        <Siren className="h-4 w-4 shrink-0 animate-pulse text-destructive" />
        <p className="text-xs font-bold text-destructive">
          {activeSosAlerts.length} tín hiệu SOS đang mở — mới nhất từ {latest.senderName} lúc{' '}
          {new Date(latest.createdAt).toLocaleTimeString('vi-VN')}
        </p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-destructive" />
    </button>
  );
}
