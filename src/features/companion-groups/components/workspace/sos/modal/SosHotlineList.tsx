import { MessageSquare, PhoneCall } from 'lucide-react';
import { NATIONAL_HOTLINES } from '../../../../constants/sos';

interface SosHotlineListProps {
  leaderName?: string;
  leaderPhone?: string;
  gpsCoords?: { latitude: number; longitude: number } | null;
}

export function SosHotlineList({
  leaderName = 'Trưởng nhóm',
  leaderPhone,
  gpsCoords,
}: SosHotlineListProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5">
          <PhoneCall className="h-3.5 w-3.5 text-primary shrink-0" />
          2. SỐ ĐIỆN THOẠI KHẨN CẤP & CỨU HỘ 24/7
        </span>
      </div>

      {leaderPhone && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-primary/30 bg-primary/5 p-3 gap-2.5">
          <div>
            <span className="text-[10px] font-extrabold text-primary uppercase">
              Trưởng Nhóm Đoàn
            </span>
            <p className="text-xs font-bold text-foreground">
              {leaderName} • {leaderPhone}
            </p>
          </div>
          <a
            href={`tel:${leaderPhone.replace(/\./g, '')}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-extrabold text-primary-foreground shadow-xs hover:bg-primary/90 transition self-start sm:self-auto"
          >
            <PhoneCall className="h-3.5 w-3.5" /> Gọi Leader
          </a>
        </div>
      )}

      <div className="space-y-2">
        {NATIONAL_HOTLINES.map((h) => (
          <div
            key={h.number}
            className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-border bg-background p-2.5 text-xs gap-2"
          >
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-foreground">{h.name}</span>
                <span className="rounded-md bg-muted px-1.5 py-0.2 text-[9.5px] font-bold text-muted-foreground">
                  {h.badge}
                </span>
              </div>
              <p className="text-[10.5px] text-muted-foreground">{h.desc}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
              <a
                href={`sms:${h.number}?body=${encodeURIComponent(
                  `[SOS TREKSPHERE] Can cuu ho gap! ${gpsCoords ? `Toa do: ${gpsCoords.latitude.toFixed(6)}, ${gpsCoords.longitude.toFixed(6)}` : ''}`
                )}`}
                className="inline-flex items-center justify-center gap-1 rounded-lg border border-border bg-muted px-2.5 py-1.5 sm:py-1 text-xs font-bold text-foreground hover:bg-muted/80 transition"
              >
                <MessageSquare className="h-3 w-3" /> SMS {h.number}
              </a>
              <a
                href={`tel:${h.number}`}
                className="inline-flex items-center justify-center gap-1 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-1.5 sm:py-1 text-xs font-extrabold text-destructive hover:bg-destructive/20 transition"
              >
                <PhoneCall className="h-3 w-3" /> Gọi {h.number}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
