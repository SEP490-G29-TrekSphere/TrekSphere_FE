import { ArrowRight, Calendar, Clock, Eye, MapPin, RotateCcw, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { formatDate } from '@/utils/format';
import { type MatchingGroupCardData, toMatchingGroupCardViewModel } from '../mappers/matchingGroup';
import type { JoinApplicationStatus } from '../types/matchingGroup';
import {
  MatchingGroupOwnerAvatar,
  MatchingGroupStatusBadge,
} from './discovery/MatchingGroupCardPrimitives';

export type GroupCardData = MatchingGroupCardData;

interface CompanionGroupCardProps {
  group: GroupCardData;
  onJoinGroup?: (group: GroupCardData) => void;
  onViewDetail?: (group: GroupCardData) => void;
  layout?: 'list' | 'grid';
  /** Func tạo link chi tiết nhóm — dùng khi cần trỏ sang portal khác (vd trekker). */
  getDetailPath?: (groupId: string) => string;
  hasJoined?: boolean;
  applicationStatus?: JoinApplicationStatus | null;
}

export function CompanionGroupCard({
  group,
  onJoinGroup,
  onViewDetail,
  layout = 'grid',
  getDetailPath,
  hasJoined = false,
  applicationStatus,
}: CompanionGroupCardProps) {
  const user = useAppStore((state) => state.user);
  const viewModel = toMatchingGroupCardViewModel(group);
  const groupId = viewModel.groupId;
  const isLeader = Boolean(
    user && (viewModel.ownerId === user.id || viewModel.isOwner || viewModel.myRole === 'LEADER')
  );
  const isMember = Boolean(
    viewModel.myRole === 'MEMBER' ||
      (hasJoined && applicationStatus !== 'PENDING') ||
      applicationStatus === 'ACCEPTED'
  );
  const isPending = applicationStatus === 'PENDING';
  const isRejectedOrWithdrawn =
    applicationStatus === 'REJECTED' || applicationStatus === 'WITHDRAWN';
  const isMemberOrLeader = isLeader || isMember;
  const detailPath =
    getDetailPath?.(groupId) ??
    (isMemberOrLeader ? `/trekker/my-groups/${groupId}` : `/groups/${groupId}`);
  const neededMembers = Math.max(0, viewModel.maxSize - viewModel.currentSize);

  if (layout === 'list') {
    return (
      <article
        className={cn(
          'group flex flex-col gap-4 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-border transition-all hover:shadow-md sm:flex-row sm:items-stretch sm:gap-5 sm:p-4',
          isMemberOrLeader && 'ring-primary/40 bg-primary/[0.02]'
        )}
      >
        {/* Thumbnail */}
        {viewModel.coverImageUrl && (
          <Link
            to={detailPath}
            className="block h-40 w-full shrink-0 overflow-hidden rounded-xl sm:h-auto sm:w-40"
          >
            <img
              src={viewModel.coverImageUrl}
              alt={viewModel.groupName}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
        )}

        {/* Left: status + info */}
        <div className="flex flex-1 flex-col justify-between gap-3">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <MatchingGroupStatusBadge status={viewModel.status} />
              {isLeader ? (
                <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 ring-1 ring-amber-500/20">
                  Nhóm của bạn
                </span>
              ) : isMember ? (
                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-500/20">
                  Đã tham gia
                </span>
              ) : isPending ? (
                <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400 ring-1 ring-amber-500/20">
                  Đang chờ duyệt
                </span>
              ) : null}
            </div>
            <Link to={detailPath}>
              <h3 className="line-clamp-1 text-base font-bold text-primary transition-colors group-hover:text-primary/80 sm:text-lg">
                {viewModel.groupName}
              </h3>
            </Link>
            {viewModel.journeyName && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                <span className="truncate">{viewModel.journeyName}</span>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-primary/70" />
                <span>Khởi hành: {formatDate(viewModel.targetDate)}</span>
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-primary/70" />
                <span>
                  Cần {neededMembers} người ({viewModel.currentSize}/{viewModel.maxSize})
                </span>
              </span>
              {viewModel.matchingDeadline && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-primary/70" />
                  <span>
                    Hạn: {new Date(viewModel.matchingDeadline).toLocaleDateString('vi-VN')}
                  </span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MatchingGroupOwnerAvatar
              name={viewModel.ownerName}
              avatarUrl={viewModel.ownerAvatarUrl}
            />
            <span className="truncate font-semibold text-foreground text-xs">
              {viewModel.ownerName}
            </span>
          </div>
        </div>

        {/* Right: action buttons */}
        <div className="flex shrink-0 flex-row items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-center sm:py-1">
          {isMemberOrLeader ? (
            <Link
              to={detailPath}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 font-bold text-white text-xs shadow-sm transition-all hover:bg-primary/90 hover:scale-105 active:scale-95"
            >
              <span>Vào nhóm</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : isPending ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onViewDetail?.(group)}
                className="inline-flex items-center gap-1 rounded-full border border-border px-3.5 py-1.5 font-semibold text-foreground text-xs transition-all hover:border-primary hover:text-primary cursor-pointer"
              >
                <Eye className="h-3.5 w-3.5" />
                Chi tiết
              </button>
              <button
                type="button"
                onClick={() => onViewDetail?.(group)}
                className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 transition-all cursor-pointer"
              >
                <Clock className="h-3.5 w-3.5" />
                <span>Đang chờ duyệt</span>
              </button>
            </div>
          ) : isRejectedOrWithdrawn ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onViewDetail?.(group)}
                className="inline-flex items-center gap-1 rounded-full border border-border px-3.5 py-1.5 font-semibold text-foreground text-xs transition-all hover:border-primary hover:text-primary cursor-pointer"
              >
                <Eye className="h-3.5 w-3.5" />
                Chi tiết
              </button>
              <button
                type="button"
                disabled={viewModel.status !== 'OPEN'}
                onClick={() => onJoinGroup?.(group)}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all shadow-sm',
                  viewModel.status === 'OPEN'
                    ? 'bg-primary/10 border border-primary/30 text-primary hover:bg-primary hover:text-white hover:scale-105 active:scale-95 cursor-pointer'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                )}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{viewModel.status === 'OPEN' ? 'Nộp lại đơn' : 'Đã đủ'}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onViewDetail?.(group)}
                className="inline-flex items-center gap-1 rounded-full border border-border px-3.5 py-1.5 font-semibold text-foreground text-xs transition-all hover:border-primary hover:text-primary cursor-pointer"
              >
                <Eye className="h-3.5 w-3.5" />
                Chi tiết
              </button>
              <button
                type="button"
                disabled={viewModel.status !== 'OPEN'}
                onClick={() => onJoinGroup?.(group)}
                className={cn(
                  'rounded-full px-3.5 py-1.5 text-xs font-bold transition-all shadow-sm',
                  viewModel.status === 'OPEN'
                    ? 'bg-primary text-white hover:bg-primary/90 hover:scale-105 active:scale-95 cursor-pointer'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                )}
              >
                {viewModel.status === 'OPEN' ? 'Xin tham gia' : 'Đã đủ'}
              </button>
            </div>
          )}
        </div>
      </article>
    );
  }

  // Grid layout
  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-border transition-all hover:shadow-md',
        isMemberOrLeader && 'ring-primary/40'
      )}
    >
      {/* Cover image */}
      {viewModel.coverImageUrl && (
        <Link to={detailPath} className="block aspect-video w-full overflow-hidden bg-muted">
          <img
            src={viewModel.coverImageUrl}
            alt={viewModel.groupName}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
      )}

      {/* Card header strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-muted/40 px-4 pt-4 pb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <MatchingGroupStatusBadge status={viewModel.status} />
          {isLeader ? (
            <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 ring-1 ring-amber-500/20">
              Nhóm của bạn
            </span>
          ) : isMember ? (
            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-500/20">
              Đã tham gia
            </span>
          ) : isPending ? (
            <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400 ring-1 ring-amber-500/20">
              Đang chờ duyệt
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-1.5">
          <MatchingGroupOwnerAvatar
            name={viewModel.ownerName}
            avatarUrl={viewModel.ownerAvatarUrl}
          />
          <span className="text-xs font-semibold text-foreground truncate max-w-[100px]">
            {viewModel.ownerName}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <Link to={detailPath}>
          <h3 className="line-clamp-2 text-base font-bold text-primary transition-colors group-hover:text-primary/80 min-h-[2.75rem]">
            {viewModel.groupName}
          </h3>
        </Link>

        {viewModel.journeyName && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/70" />
            <span className="truncate">{viewModel.journeyName}</span>
          </div>
        )}

        <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-primary/70" />
            Khởi hành: {formatDate(viewModel.targetDate)}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-primary/70" />
            Cần {neededMembers} người (Đã có {viewModel.currentSize}/{viewModel.maxSize})
          </span>
          {viewModel.matchingDeadline && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary/70" />
              Hạn ghép: {new Date(viewModel.matchingDeadline).toLocaleDateString('vi-VN')}
            </span>
          )}
        </div>
      </div>

      {/* Card footer */}
      <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-3">
        {isMemberOrLeader ? (
          <Link
            to={detailPath}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2 font-bold text-white text-xs shadow-sm transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-98"
          >
            <span>Vào nhóm</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : isPending ? (
          <>
            <button
              type="button"
              onClick={() => onViewDetail?.(group)}
              className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-all hover:border-primary hover:text-primary cursor-pointer"
            >
              <Eye className="h-3.5 w-3.5" />
              Chi tiết
            </button>
            <button
              type="button"
              onClick={() => onViewDetail?.(group)}
              className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 transition-all cursor-pointer"
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Đang chờ duyệt</span>
            </button>
          </>
        ) : isRejectedOrWithdrawn ? (
          <>
            <button
              type="button"
              onClick={() => onViewDetail?.(group)}
              className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-all hover:border-primary hover:text-primary cursor-pointer"
            >
              <Eye className="h-3.5 w-3.5" />
              Chi tiết
            </button>
            <button
              type="button"
              disabled={viewModel.status !== 'OPEN'}
              onClick={() => onJoinGroup?.(group)}
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all shadow-sm',
                viewModel.status === 'OPEN'
                  ? 'bg-primary/10 border border-primary/30 text-primary hover:bg-primary hover:text-white hover:scale-105 active:scale-95 cursor-pointer'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              )}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{viewModel.status === 'OPEN' ? 'Nộp lại đơn' : 'Đã đủ'}</span>
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onViewDetail?.(group)}
              className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-all hover:border-primary hover:text-primary cursor-pointer"
            >
              <Eye className="h-3.5 w-3.5" />
              Chi tiết
            </button>

            <button
              type="button"
              disabled={viewModel.status !== 'OPEN'}
              onClick={() => onJoinGroup?.(group)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-xs font-bold transition-all shadow-sm',
                viewModel.status === 'OPEN'
                  ? 'bg-primary text-white hover:bg-primary/90 hover:scale-105 active:scale-95 cursor-pointer'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              )}
            >
              {viewModel.status === 'OPEN' ? 'Xin tham gia' : 'Đã đủ'}
            </button>
          </>
        )}
      </div>
    </article>
  );
}
