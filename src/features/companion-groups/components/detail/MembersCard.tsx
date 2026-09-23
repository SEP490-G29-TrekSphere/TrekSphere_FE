import { MessageCircle, MoreHorizontal, UserMinus, UserPlus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUserProfilePath } from '@/constants';
import { AppBadge } from '@/shared/ui';
import type { MatchingMemberItem } from '../../services/companionGroupService';
import type { MatchingGroupStatus } from '../../types/matchingGroup';
import { MemberAvatar } from './MemberAvatar';

interface MembersCardProps {
  members: MatchingMemberItem[];
  maxSize: number;
  ownerName: string;
  currentUserId?: string;
  role?: string;
  hasConversation?: boolean;
  groupStatus?: MatchingGroupStatus;
  onDirectChat?: (userId: string, userName: string, userAvatar?: string) => void;
  onAddMemberToChat?: (userId: string, userName: string) => void;
  onRemoveMember?: (memberId: string, memberName: string) => void;
}

export function MembersCard({
  members,
  maxSize,
  ownerName,
  currentUserId,
  role,
  hasConversation,
  groupStatus,
  onDirectChat,
  onAddMemberToChat,
  onRemoveMember,
}: MembersCardProps) {
  const isCancelled = groupStatus === 'CANCELLED';
  const acceptedMembers = members.filter((m) => m.status === 'ACCEPTED');
  const currentLeader = acceptedMembers.find((m) => m.role === 'LEADER');
  const displayLeaderName = currentLeader?.fullName || ownerName;
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdownId(null);
      }
    }
    if (activeDropdownId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdownId]);

  return (
    <div className="rounded-2xl bg-card p-6 md:p-8 border border-border space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">Thành viên nhóm</h2>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            {acceptedMembers.length}/{maxSize} người đồng hành đã tham gia
          </p>
        </div>
        <AppBadge variant="secondary" className="text-xs font-bold">
          Trưởng nhóm: {displayLeaderName}
        </AppBadge>
      </div>

      {/* Members Avatar Cards Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {acceptedMembers.map((member) => {
          const isLeader = member.role === 'LEADER';
          const profileLink = getUserProfilePath(member.userId);

          return (
            <div
              key={member.matchingMemberId}
              className="flex items-center gap-3 rounded-xl bg-background p-3.5 shadow-sm border border-border"
            >
              {member.userId ? (
                <Link
                  to={profileLink}
                  className="group flex min-w-0 flex-1 items-center gap-3 hover:opacity-90 transition-opacity"
                >
                  <MemberAvatar
                    fullName={member.fullName}
                    avatarUrl={member.avatarUrl ?? undefined}
                    isLeader={isLeader}
                  />
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                      {member.fullName}
                    </h3>
                    <p
                      className={`text-[10px] tracking-wider font-bold uppercase ${
                        isLeader ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      {isLeader ? 'Trưởng nhóm' : 'Thành viên'}
                    </p>
                  </div>
                </Link>
              ) : (
                <div className="flex min-w-0 flex-1 items-center gap-3 opacity-80">
                  <MemberAvatar
                    fullName={member.fullName || 'NGƯỜI DÙNG HỆ THỐNG'}
                    avatarUrl={undefined}
                    isLeader={isLeader}
                  />
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-muted-foreground truncate">
                      {member.fullName || 'NGƯỜI DÙNG HỆ THỐNG'}
                    </h3>
                    <p
                      className={`text-[10px] tracking-wider font-bold uppercase ${
                        isLeader ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      {isLeader ? 'Trưởng nhóm' : 'Thành viên'}
                    </p>
                  </div>
                </div>
              )}

              {/* Action: Direct Chat / Add to Group (hide for self) */}
              {currentUserId && String(currentUserId) !== String(member.userId) && (
                <div className="ml-auto relative">
                  {role === 'leader' ? (
                    <div ref={activeDropdownId === member.userId ? dropdownRef : null}>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveDropdownId(
                            activeDropdownId === member.userId ? null : member.userId
                          )
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/50 text-foreground hover:bg-primary hover:text-white transition-colors cursor-pointer"
                        title="Tùy chọn"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>

                      {activeDropdownId === member.userId && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden py-1">
                          {hasConversation && !member.isInConversation && (
                            <button
                              type="button"
                              onClick={() => {
                                onAddMemberToChat?.(member.userId, member.fullName);
                                setActiveDropdownId(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors text-left"
                            >
                              <UserPlus className="h-4 w-4 text-primary" />
                              Thêm vào nhóm chat
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              onDirectChat?.(
                                member.userId,
                                member.fullName,
                                member.avatarUrl ?? undefined
                              );
                              setActiveDropdownId(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors text-left"
                          >
                            <MessageCircle className="h-4 w-4 text-primary" />
                            Nhắn tin riêng
                          </button>
                          {!isLeader && !isCancelled && member.matchingMemberId && (
                            <button
                              type="button"
                              onClick={() => {
                                onRemoveMember?.(
                                  member.matchingMemberId as string,
                                  member.fullName
                                );
                                setActiveDropdownId(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors text-left cursor-pointer"
                            >
                              <UserMinus className="h-4 w-4" />
                              Xoá khỏi nhóm
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        onDirectChat?.(
                          member.userId,
                          member.fullName,
                          member.avatarUrl ?? undefined
                        )
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/50 text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer"
                      title={`Nhắn tin cho ${member.fullName}`}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
