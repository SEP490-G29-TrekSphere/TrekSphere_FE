import { Lock } from 'lucide-react';

interface MembersAccessRestrictedProps {
  isPending?: boolean;
}

export function MembersAccessRestricted({ isPending = false }: MembersAccessRestrictedProps) {
  return (
    <div className="space-y-4 rounded-3xl border border-amber-500/20 bg-card p-6 text-center shadow-xs md:p-8">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-600 shadow-inner dark:text-amber-400">
        <Lock className="h-6 w-6" />
      </div>

      <div className="space-y-1.5">
        <h3 className="font-bold text-base text-foreground md:text-lg">
          Chỉ thành viên nhóm mới xem được danh sách này
        </h3>
        <p className="mx-auto max-w-md text-xs text-muted-foreground leading-relaxed">
          {isPending
            ? 'Yêu cầu tham gia của bạn đang chờ Trưởng nhóm phê duyệt. Danh sách thành viên sẽ hiển thị sau khi được duyệt.'
            : 'Gửi yêu cầu tham gia nhóm để xem danh sách các thành viên đồng hành và cùng trò chuyện.'}
        </p>
      </div>
    </div>
  );
}
