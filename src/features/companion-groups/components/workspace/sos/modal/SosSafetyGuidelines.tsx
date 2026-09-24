import { AlertTriangle } from 'lucide-react';

export function SosSafetyGuidelines() {
  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 space-y-1.5 text-[11px]">
      <span className="font-extrabold text-amber-700 dark:text-amber-400 flex items-center gap-1">
        <AlertTriangle className="h-3.5 w-3.5" /> Quy tắc an toàn khi gặp sự cố trên rừng:
      </span>
      <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground text-[10.5px]">
        <li>
          <strong>Giữ nguyên vị trí:</strong> Tránh tự di chuyển tiếp nếu mất phương hướng hoặc chấn
          thương.
        </li>
        <li>
          <strong>Tiết kiệm pin & nước:</strong> Tắt bớt ứng dụng ngầm, giữ ấm cơ thể.
        </li>
        <li>
          <strong>Tín hiệu âm thanh:</strong> Dùng còi cứu hộ (3 tiếng ngắn liên tiếp) hoặc đèn pin
          nhấp nháy.
        </li>
      </ul>
    </div>
  );
}
