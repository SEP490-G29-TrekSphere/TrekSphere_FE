import { Copy, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/store/useToastStore';
import type { IncidentType } from '../../../../types/sos';

interface SosOfflineFallbackSectionProps {
  isError: boolean;
  selectedIncident: IncidentType;
  customNote: string;
  leaderPhone?: string;
  gpsCoords?: { latitude: number; longitude: number } | null;
}

export function SosOfflineFallbackSection({
  isError,
  selectedIncident,
  customNote,
  leaderPhone,
  gpsCoords,
}: SosOfflineFallbackSectionProps) {
  const handleCopySms = () => {
    const body =
      `[SOS TREKSPHERE] Can cuu ho gap!\nSu co: ${selectedIncident}\n` +
      (gpsCoords
        ? `Toa do: ${gpsCoords.latitude.toFixed(6)}, ${gpsCoords.longitude.toFixed(6)}\nLink: https://maps.google.com/?q=${gpsCoords.latitude},${gpsCoords.longitude}\n`
        : '') +
      (customNote.trim() ? `Loi nhan: ${customNote.trim()}` : '');
    navigator.clipboard.writeText(body);
    toast.success('Đã sao chép nội dung tin nhắn cứu hộ SMS!');
  };

  const sms112Href = `sms:112?body=${encodeURIComponent(
    `[SOS TREKSPHERE] Can cuu ho gap! Su co: ${selectedIncident}. ` +
      (gpsCoords
        ? `Toa do: ${gpsCoords.latitude.toFixed(6)}, ${gpsCoords.longitude.toFixed(6)} (https://maps.google.com/?q=${gpsCoords.latitude},${gpsCoords.longitude}). `
        : '') +
      (customNote.trim() ? `Loi nhan: ${customNote.trim()}` : '')
  )}`;

  const smsLeaderHref = leaderPhone
    ? `sms:${leaderPhone.replace(/\./g, '')}?body=${encodeURIComponent(
        `[SOS TREKSPHERE] Can cuu ho gap! Su co: ${selectedIncident}. ` +
          (gpsCoords
            ? `Toa do: ${gpsCoords.latitude.toFixed(6)}, ${gpsCoords.longitude.toFixed(6)} (https://maps.google.com/?q=${gpsCoords.latitude},${gpsCoords.longitude}). `
            : '') +
          (customNote.trim() ? `Loi nhan: ${customNote.trim()}` : '')
      )}`
    : undefined;

  return (
    <div
      className={cn(
        'rounded-xl border p-3.5 space-y-2.5 transition-all',
        isError
          ? 'border-destructive bg-destructive/15 ring-2 ring-destructive/40'
          : 'border-destructive/30 bg-destructive/5'
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-black text-destructive uppercase tracking-wider flex items-center gap-1.5">
          <MessageSquare className="h-4 w-4 shrink-0" />
          GỬI SMS CỨU HỘ & TỔNG ĐÀI KHẨN CẤP (KHÔNG CẦN INTERNET)
        </span>
        {isError && (
          <span className="rounded-md bg-destructive px-2 py-0.5 text-[9px] font-extrabold text-destructive-foreground animate-pulse">
            Mất kết nối mạng
          </span>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground leading-relaxed">
        Nếu mạng yếu hoặc mất sóng 4G/Wifi trên rừng, hãy dùng SMS / Điện thoại thoại trực tiếp (tự
        động đính kèm tọa độ GPS):
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
        <a
          href={sms112Href}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-destructive px-3 py-2 text-xs font-black text-destructive-foreground hover:bg-destructive/90 transition shadow-xs cursor-pointer"
        >
          <MessageSquare className="h-3.5 w-3.5" /> Gửi SMS Cứu Nạn 112
        </a>

        {smsLeaderHref ? (
          <a
            href={smsLeaderHref}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-destructive/60 bg-background px-3 py-2 text-xs font-black text-destructive hover:bg-muted transition shadow-2xs cursor-pointer"
          >
            <MessageSquare className="h-3.5 w-3.5" /> SMS Trưởng Nhóm ({leaderPhone})
          </a>
        ) : (
          <button
            type="button"
            onClick={handleCopySms}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold text-foreground hover:bg-muted transition cursor-pointer"
          >
            <Copy className="h-3.5 w-3.5" /> Sao chép cú pháp SMS
          </button>
        )}

        <button
          type="button"
          onClick={handleCopySms}
          className={cn(
            'inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold text-foreground hover:bg-muted transition cursor-pointer',
            leaderPhone ? 'col-span-1 sm:col-span-2' : 'hidden'
          )}
        >
          <Copy className="h-3.5 w-3.5" /> Sao chép cú pháp SMS đầy đủ
        </button>
      </div>
    </div>
  );
}
