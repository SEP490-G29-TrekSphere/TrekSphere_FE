import { Calendar, Users } from 'lucide-react';
import { formatDate } from '@/utils/format';
import type { MatchingGroupDetailResponse } from '../../types/matchingGroup';
import { MatchingGroupStatusBadge } from '../discovery/MatchingGroupCardPrimitives';

interface JoinGroupSummaryProps {
  group: MatchingGroupDetailResponse;
}

export function JoinGroupSummary({ group }: JoinGroupSummaryProps) {
  const acceptedMembers = group.members.filter((member) => member.status === 'ACCEPTED');
  const visibleMembers = acceptedMembers.slice(0, 5);

  return (
    <div className="space-y-6 lg:col-span-5">
      <section className="space-y-4 rounded-[2rem] border border-border/60 bg-muted/40 p-5 shadow-xs">
        <MatchingGroupStatusBadge status={group.status} />
        <h2 className="font-bold text-foreground text-xl leading-snug sm:text-2xl">
          {group.groupName}
        </h2>
        <div className="flex items-center gap-2 font-medium text-muted-foreground text-xs">
          <Calendar className="h-4 w-4" />
          <span>Khởi hành: {formatDate(group.targetDate)}</span>
        </div>
        <div className="flex items-center justify-between border-border/40 border-t pt-2 font-medium text-xs">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>
              Trưởng nhóm: <strong className="font-semibold">{group.ownerName}</strong>
            </span>
          </div>
          <span className="rounded-full bg-muted px-3 py-1 font-bold text-xs">
            {acceptedMembers.length}/{group.maxSize} Thành viên
          </span>
        </div>
      </section>

      <section className="space-y-4 rounded-[2rem] border border-border/60 bg-card p-5 shadow-xs">
        <h3 className="font-extrabold text-muted-foreground text-xs uppercase tracking-wider">
          Thành viên hiện tại
        </h3>
        <div className="grid grid-cols-5 gap-2 text-center">
          {visibleMembers.map((member) => (
            <div key={member.userId} className="flex min-w-0 flex-col items-center gap-1">
              <div className="relative">
                {member.avatarUrl ? (
                  <img
                    src={member.avatarUrl}
                    alt={member.fullName}
                    className="h-11 w-11 rounded-full border-2 border-card object-cover shadow-xs"
                  />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-card bg-emerald-100 font-bold text-emerald-900 text-xs shadow-xs">
                    {member.fullName
                      .split(' ')
                      .map((part) => part[0])
                      .join('')
                      .substring(0, 2)
                      .toUpperCase()}
                  </div>
                )}
                {member.role === 'LEADER' && (
                  <span className="absolute right-0 bottom-0 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-white bg-emerald-600 font-bold text-[9px] text-white">
                    ★
                  </span>
                )}
              </div>
              <span className="w-full truncate font-medium text-[11px] text-foreground">
                {member.fullName}
              </span>
            </div>
          ))}
        </div>
        {acceptedMembers.length > visibleMembers.length && (
          <p className="text-muted-foreground text-xs">
            Và {acceptedMembers.length - visibleMembers.length} thành viên khác
          </p>
        )}
      </section>
    </div>
  );
}
