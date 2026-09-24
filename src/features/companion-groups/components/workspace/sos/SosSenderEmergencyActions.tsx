import { Copy, MessageSquare, Phone, Siren } from 'lucide-react';
import { toast } from '@/store/useToastStore';
import type { IncidentMetaItem } from '../../../constants/sos';
import type { SosAlertResponse } from '../../../types/sos';

interface SosSenderEmergencyActionsProps {
  alert: SosAlertResponse;
  meta: IncidentMetaItem;
}

export function SosSenderEmergencyActions({ alert, meta }: SosSenderEmergencyActionsProps) {
  const handleCopySms = () => {
    const body =
      `[SOS TREKSPHERE] Can cuu ho gap!\nNguoi gui: ${alert.senderName}\nSu co: ${meta.label}\n` +
      (alert.latitude != null && alert.longitude != null
        ? `Toa do: ${alert.latitude.toFixed(6)}, ${alert.longitude.toFixed(6)}\nLink: https://maps.google.com/?q=${alert.latitude},${alert.longitude}\n`
        : '') +
      (alert.message ? `Loi nhan: ${alert.message}` : '');
    navigator.clipboard.writeText(body);
    toast.success('Đã sao chép nội dung tin nhắn cứu hộ SMS!');
  };

  const sms112Href = `sms:112?body=${encodeURIComponent(
    `[SOS TREKSPHERE] Can cuu ho gap! Nguoi gui: ${alert.senderName}. Su co: ${meta.label}. ` +
      (alert.latitude != null && alert.longitude != null
        ? `Toa do: ${alert.latitude.toFixed(6)}, ${alert.longitude.toFixed(6)} (https://maps.google.com/?q=${alert.latitude},${alert.longitude}). `
        : '') +
      (alert.message ? `Loi nhan: ${alert.message}` : '')
  )}`;

  return (
    <div className="rounded-xl border-2 border-destructive/60 bg-destructive/10 p-3.5 space-y-2.5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-xs font-black text-destructive uppercase tracking-wide flex items-center gap-1.5">
          <Siren className="h-4 w-4 shrink-0 text-destructive animate-pulse" />
          THAO TÁC CỨU HỘ DÀNH CHO BẠN (NGƯỜI GỬI TÍN HIỆU)
        </span>
        <span className="text-[10.5px] text-muted-foreground">
          Mất mạng hoặc cần cứu viện gấp? Dùng SMS / Gọi 112 ngay:
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-0.5">
        <a
          href={sms112Href}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-destructive px-3.5 py-2 text-xs font-black text-destructive-foreground hover:bg-destructive/90 transition shadow-xs cursor-pointer"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Gửi SMS Cứu Nạn 112
        </a>

        <a
          href="tel:112"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-destructive/60 bg-background px-3.5 py-2 text-xs font-black text-destructive hover:bg-destructive/15 transition shadow-2xs cursor-pointer"
        >
          <Phone className="h-3.5 w-3.5" />
          Gọi Tổng Đài 112
        </a>

        <a
          href="tel:115"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-destructive/60 bg-background px-3.5 py-2 text-xs font-black text-destructive hover:bg-destructive/15 transition shadow-2xs cursor-pointer"
        >
          <Phone className="h-3.5 w-3.5" />
          Gọi Cấp Cứu 115
        </a>

        <button
          type="button"
          onClick={handleCopySms}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold text-foreground hover:bg-muted transition cursor-pointer"
        >
          <Copy className="h-3.5 w-3.5" />
          Sao chép cú pháp SMS
        </button>
      </div>
    </div>
  );
}
