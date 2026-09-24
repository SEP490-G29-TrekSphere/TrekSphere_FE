import { MessageSquare, Phone } from 'lucide-react';

export function SosNationalHotlineBar() {
  return (
    <div className="rounded-2xl border border-border bg-card p-3.5 sm:p-4 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-destructive/10 text-destructive shrink-0">
            <Phone className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-foreground uppercase tracking-wide">
              Tổng Đài Cứu Hộ & Cấp Cứu Khẩn Cấp 24/7
            </h4>
            <p className="text-[11px] text-muted-foreground">
              Đường dây nóng quốc gia hoạt động liên tục khi cần trợ giúp y tế hoặc tìm kiếm cứu nạn
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <a
            href="tel:112"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-destructive/50 bg-destructive/10 px-3 py-1.5 text-xs font-black text-destructive hover:bg-destructive/20 transition"
          >
            <Phone className="h-3 w-3" /> Gọi 112 (Cứu nạn)
          </a>
          <a
            href="sms:112"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted transition"
          >
            <MessageSquare className="h-3 w-3" /> SMS 112
          </a>
          <a
            href="tel:115"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-destructive/50 bg-destructive/10 px-3 py-1.5 text-xs font-black text-destructive hover:bg-destructive/20 transition"
          >
            <Phone className="h-3 w-3" /> Gọi 115 (Cấp cứu)
          </a>
        </div>
      </div>
    </div>
  );
}
