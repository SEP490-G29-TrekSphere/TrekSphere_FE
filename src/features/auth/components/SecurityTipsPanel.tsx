import { Fingerprint, LockKeyhole, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

const TIPS = [
  {
    icon: LockKeyhole,
    title: 'Đừng dùng lại mật khẩu',
    description: 'Mật khẩu trùng với email hay mạng xã hội khiến một vụ rò rỉ kéo theo tất cả.',
  },
  {
    icon: Fingerprint,
    title: 'Càng dài càng khó đoán',
    description: 'Một cụm từ dễ nhớ với bạn nhưng vô nghĩa với người khác luôn an toàn hơn.',
  },
  {
    icon: RefreshCw,
    title: 'Đổi ngay khi thấy lạ',
    description: 'Nếu có đăng nhập bất thường, đổi mật khẩu trước rồi kiểm tra sau.',
  },
];

/** Panel gợi ý bảo mật hiển thị cạnh form đổi mật khẩu ở màn hình rộng. */
export function SecurityTipsPanel({ className }: { className?: string }) {
  return (
    <aside className={cn('rounded-2xl border border-border bg-card/60 p-5', className)}>
      <h2 className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">
        Mẹo giữ tài khoản an toàn
      </h2>

      <ul className="mt-4 space-y-5">
        {TIPS.map((tip) => (
          <li key={tip.title} className="flex gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary/40 text-primary">
              <tip.icon className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{tip.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {tip.description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
