import { MessageCircle } from 'lucide-react';
import type { UserRoleInGroup } from '../../types';
import type { MatchingGroupDetailResponse } from '../../types/matchingGroup';
import { MemberAvatar } from './MemberAvatar';
import { MembersAccessRestricted } from './MembersAccessRestricted';

interface GroupOverviewTabProps {
  group: MatchingGroupDetailResponse;
  currentUserId?: string;
  role: UserRoleInGroup;
  onDirectChat: (memberId: string, memberName: string, memberAvatar?: string) => void;
  onAddMemberToChat?: (memberId: string, memberName: string) => void;
}

export function GroupOverviewTab({
  group,
  currentUserId,
  role,
  onDirectChat,
}: GroupOverviewTabProps) {
  const isLeader = currentUserId && String(group.ownerId) === String(currentUserId);
  const descriptionText =
    group.description ||
    group.tourDescription ||
    group.customJourneyDescription ||
    'Chưa có mô tả chi tiết cho chuyến đi này.';

  return (
    <div className="space-y-6">
      {/* 1. Leader Profile Card */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-3.5">
            <MemberAvatar
              fullName={group.ownerName}
              avatarUrl={group.ownerAvatarUrl ?? undefined}
              size="lg"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-foreground">{group.ownerName}</h3>
              </div>
              <p className="text-xs text-muted-foreground">Trưởng nhóm khởi xướng (Group Leader)</p>
            </div>
          </div>

          {!isLeader && currentUserId && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  onDirectChat(group.ownerId, group.ownerName, group.ownerAvatarUrl ?? undefined)
                }
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <MessageCircle className="h-3.5 w-3.5 text-primary" />
                <span>Nhắn tin Leader</span>
              </button>
            </div>
          )}
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
            Mô tả chuyến đi
          </h4>
          <p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-line">
            {descriptionText}
          </p>
        </div>
      </div>

      {/* 2. Members Section Restricted for public viewers */}
      <MembersAccessRestricted isPending={role === 'pending'} />
    </div>
  );
}
