import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface MomentEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Nút hành động (chỉ hiện với chủ sở hữu nội dung). */
  action?: ReactNode;
}

/** Khối rỗng dùng chung cho dòng thời gian và album khoảnh khắc. */
export function MomentEmptyState({
  icon: Icon,
  title,
  description,
  action,
}: MomentEmptyStateProps) {
  return (
    <div className="rounded-3xl border border-border border-dashed bg-card/40 p-10 text-center sm:p-12">
      <Icon className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
      <h4 className="font-bold text-foreground text-sm">{title}</h4>
      <p className="mx-auto mt-1 max-w-sm text-muted-foreground text-xs">{description}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}
