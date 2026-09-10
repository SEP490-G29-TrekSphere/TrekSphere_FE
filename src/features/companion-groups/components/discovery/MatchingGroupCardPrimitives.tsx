import { cn } from '@/lib/utils';
import { MATCHING_GROUP_STATUS_META } from '../../constants';
import type { MatchingGroupStatus } from '../../types/matchingGroup';

export function MatchingGroupStatusBadge({ status }: { status: MatchingGroupStatus }) {
  const meta = MATCHING_GROUP_STATUS_META[status];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 font-bold text-[10px] uppercase tracking-wider shadow-sm',
        meta.className
      )}
    >
      {meta.label}
    </span>
  );
}

interface MatchingGroupOwnerAvatarProps {
  name: string;
  avatarUrl?: string;
}

export function MatchingGroupOwnerAvatar({ name, avatarUrl }: MatchingGroupOwnerAvatarProps) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-200 font-bold text-[10px] text-emerald-900 shadow-inner">
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
