import { MemberAvatar } from '../../detail/MemberAvatar';

interface LeaderCardProps {
  ownerName: string;
  ownerAvatarUrl?: string | null;
  descriptionText: string;
}

/** Card giới thiệu Trưởng nhóm + mô tả chuyến đi — phần nội dung gốc của tab Tổng quan. */
export function LeaderCard({ ownerName, ownerAvatarUrl, descriptionText }: LeaderCardProps) {
  return (
    <div className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-xs">
      <div className="flex flex-col justify-between gap-4 border-border border-b pb-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3.5">
          <MemberAvatar
            fullName={ownerName}
            avatarUrl={ownerAvatarUrl ?? undefined}
            size="lg"
            isLeader
          />
          <div>
            <h3 className="font-extrabold text-base text-foreground">{ownerName}</h3>
            <p className="text-muted-foreground text-xs">Trưởng nhóm khởi xướng chuyến đi</p>
          </div>
        </div>
      </div>

      <div>
        <h4 className="mb-1.5 font-bold text-muted-foreground text-xs uppercase tracking-wider">
          Mô tả chuyến đi
        </h4>
        <p className="whitespace-pre-line text-muted-foreground text-xs leading-relaxed">
          {descriptionText}
        </p>
      </div>
    </div>
  );
}
