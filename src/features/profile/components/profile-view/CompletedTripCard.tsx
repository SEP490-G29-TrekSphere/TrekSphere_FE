import { CalendarDays, CheckCircle2, MapPin, ShieldCheck, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { MatchingGroupItem } from '@/features/companion-groups/types/matchingGroup';
import { formatDate } from '@/utils/format';
import { getSafeImageUrl } from '@/utils/sanitize';

interface CompletedTripCardProps {
  group: MatchingGroupItem;
  detailPath: string;
}

/** Một chuyến đi ghép nhóm đã hoàn thành trên tab "Đã hoàn thành" của hồ sơ. */
export function CompletedTripCard({ group, detailPath }: CompletedTripCardProps) {
  const coverUrl = getSafeImageUrl(group.tourImageUrl);
  const isLeader = group.isOwner || group.myRole === 'LEADER';
  const journeyName = group.tourName || group.customJourneyTitle || group.groupName;

  return (
    <Link
      to={detailPath}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition hover:border-primary/40 hover:shadow-md"
    >
      <div className="relative h-32 w-full overflow-hidden bg-muted">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={journeyName}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary/5 text-primary/40">
            <MapPin className="h-8 w-8" />
          </div>
        )}

        <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-full bg-emerald-600/90 px-2.5 py-1 font-bold text-[10px] text-white backdrop-blur-xs">
          <CheckCircle2 className="h-3 w-3" /> Đã hoàn thành
        </span>

        {isLeader && (
          <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 font-bold text-[10px] text-primary backdrop-blur-xs">
            <ShieldCheck className="h-3 w-3" /> Trưởng nhóm
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h4 className="line-clamp-2 font-bold text-foreground text-sm">{group.groupName}</h4>

        <ul className="space-y-1.5 text-muted-foreground text-xs">
          {group.location ? (
            <li className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="truncate">{group.location}</span>
            </li>
          ) : null}
          <li className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span>Khởi hành: {formatDate(group.targetDate)}</span>
          </li>
          <li className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span>
              {group.currentSize}/{group.maxSize} thành viên
            </span>
          </li>
        </ul>

        <span className="mt-auto pt-2 font-bold text-primary text-xs group-hover:underline">
          Xem lại chuyến đi →
        </span>
      </div>
    </Link>
  );
}
