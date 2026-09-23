import { Route } from 'lucide-react';
import { RichTextContent } from '@/shared/ui';
import { MemberAvatar } from '../../detail/MemberAvatar';

interface LeaderCardProps {
  ownerName: string;
  ownerAvatarUrl?: string | null;
  groupDescription?: string | null;
  journeyDescription?: string | null;
  descriptionText?: string;
}

export function LeaderCard({
  ownerName,
  ownerAvatarUrl,
  groupDescription,
  journeyDescription,
  descriptionText,
}: LeaderCardProps) {
  const groupDesc = groupDescription || descriptionText;
  const hasGroupDesc = Boolean(groupDesc?.trim());
  const hasJourneyDesc = Boolean(
    journeyDescription?.trim() && journeyDescription.trim() !== groupDesc?.trim()
  );

  return (
    <div className="space-y-5 rounded-3xl border border-border bg-card p-6 shadow-xs">
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
            <p className="text-muted-foreground text-xs">Trưởng nhóm hiện tại</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {hasGroupDesc ? (
          <div>
            <h4 className="mb-1.5 font-bold text-muted-foreground text-xs uppercase tracking-wider">
              Mô tả nhóm ghép
            </h4>
            <RichTextContent content={groupDesc!} />
          </div>
        ) : !hasJourneyDesc ? (
          <div>
            <h4 className="mb-1.5 font-bold text-muted-foreground text-xs uppercase tracking-wider">
              Mô tả chuyến đi
            </h4>
            <p className="text-xs text-muted-foreground italic">
              Chưa có mô tả chi tiết cho chuyến đi này.
            </p>
          </div>
        ) : null}

        {hasJourneyDesc && (
          <div className="rounded-2xl border border-border/80 bg-muted/30 p-4 space-y-2">
            <h4 className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Route className="h-3.5 w-3.5 text-primary" />
              Tổng quan lộ trình
            </h4>
            <RichTextContent content={journeyDescription!} />
          </div>
        )}
      </div>
    </div>
  );
}
