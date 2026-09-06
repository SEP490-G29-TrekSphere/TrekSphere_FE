import type { LucideIcon } from 'lucide-react';

interface ProfileComingSoonProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

/**
 * Empty state cho các tab đã dựng theo design nhưng BE chưa có API
 * (Hoạt động, Đã hoàn thành). Nói rõ là chưa mở thay vì hiện dữ liệu giả.
 */
export function ProfileComingSoon({ icon: Icon, title, description }: ProfileComingSoonProps) {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-card px-6 py-16 text-center shadow-sm">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Icon className="size-6 text-muted-foreground" />
      </div>
      <p className="mt-4 text-base font-semibold text-primary">{title}</p>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
