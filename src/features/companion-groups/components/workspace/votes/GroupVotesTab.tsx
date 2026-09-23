import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  Vote as VoteIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { AppButton } from '@/shared/ui';
import { useCancelVote } from '../../../hooks/vote/useCancelVote';
import { useCastBallot } from '../../../hooks/vote/useCastBallot';
import { useCloseVote } from '../../../hooks/vote/useCloseVote';
import { useGroupVotes } from '../../../hooks/vote/useGroupVotes';
import type { MatchingGroupStatus, MatchingMemberItem } from '../../../types/matchingGroup';
import type { GroupVoteResponse, GroupVoteType } from '../../../types/vote';
import { CreateGeneralPollModal } from './CreateGeneralPollModal';

interface GroupVotesTabProps {
  groupId: string;
  currentUserId?: string;
  isLeader: boolean;
  members: MatchingMemberItem[];
  targetVoteId?: string | null;
  groupStatus?: MatchingGroupStatus;
}

const VOTE_TYPE_LABELS: Record<GroupVoteType, string> = {
  LEADER_ELECTION: 'Bầu Trưởng nhóm',
  GROUP_DISSOLUTION: 'Biểu quyết giải tán nhóm',
  OTHER: 'Bình chọn',
};

const HISTORY_PAGE_SIZE = 10;

function VoteCard({
  vote,
  canManage,
  onCast,
  castingOptionId,
  onClose,
  onCancel,
  isClosing,
  isCancelling,
  cardError,
  emphasized = false,
  isTarget = false,
  isCancelled = false,
}: {
  vote: GroupVoteResponse;
  canManage: boolean;
  onCast: (voteId: string, optionId: string) => void;
  castingOptionId: string | null;
  onClose: (voteId: string) => void;
  onCancel: (voteId: string) => void;
  isClosing: boolean;
  isCancelling: boolean;
  cardError?: string | null;
  emphasized?: boolean;
  isTarget?: boolean;
  isCancelled?: boolean;
}) {
  const totalBallots = vote.options.reduce((sum, o) => sum + o.ballotCount, 0);
  const isOpen = vote.status === 'OPEN' && !isCancelled;
  const winningOption = vote.options.find((o) => o.groupVoteOptionId === vote.winningOptionId);

  return (
    <div
      id={`vote-${vote.groupVoteId}`}
      className={`rounded-2xl border p-4 space-y-3 transition-all scroll-mt-24 ${
        isTarget
          ? 'border-2 border-primary ring-4 ring-primary/20 bg-primary/5 shadow-md'
          : emphasized
            ? 'border-2 border-amber-500/50 bg-amber-500/5'
            : 'border-border bg-background'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-extrabold text-sm text-foreground">{vote.title}</span>
            {isTarget && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground animate-pulse">
                Đang xem từ thông báo
              </span>
            )}
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
              {VOTE_TYPE_LABELS[vote.voteType]}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                isOpen
                  ? 'bg-primary/15 text-primary'
                  : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
              }`}
            >
              {isOpen ? 'Đang mở' : 'Đã đóng'}
            </span>
          </div>
          {vote.reason && (
            <p className="text-xs text-foreground mt-1.5 leading-relaxed">{vote.reason}</p>
          )}
          <p className="text-[11px] text-muted-foreground mt-1">
            {vote.createdByName} • {isOpen ? 'Hạn' : 'Đóng lúc'}{' '}
            {new Date(isOpen ? vote.closesAt : (vote.closedAt ?? vote.closesAt)).toLocaleString(
              'vi-VN'
            )}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {vote.options.map((option) => {
          const pct = totalBallots > 0 ? Math.round((option.ballotCount / totalBallots) * 100) : 0;
          const isMine = vote.myBallotOptionId === option.groupVoteOptionId;
          const isWinner = !isOpen && vote.winningOptionId === option.groupVoteOptionId;
          const isCastingThis = castingOptionId === option.groupVoteOptionId;

          return (
            <div key={option.groupVoteOptionId} className="space-y-1">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span
                  className={`font-semibold ${isWinner ? 'text-emerald-700 dark:text-emerald-400' : 'text-foreground'}`}
                >
                  {option.optionLabel}
                  {isMine && (
                    <span className="ml-1.5 text-[10px] font-bold text-primary">(Bạn đã chọn)</span>
                  )}
                  {isWinner && (
                    <CheckCircle2 className="ml-1.5 inline h-3.5 w-3.5 text-emerald-600" />
                  )}
                </span>
                <span className="shrink-0 text-[11px] text-muted-foreground">
                  {option.ballotCount} phiếu ({pct}%)
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${isWinner ? 'bg-emerald-500' : 'bg-primary'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              {isOpen && !isMine && (
                <button
                  type="button"
                  onClick={() => onCast(vote.groupVoteId, option.groupVoteOptionId)}
                  disabled={isCastingThis}
                  className="mt-1 inline-flex items-center gap-1 rounded-full border border-primary/30 px-2.5 py-1 text-[11px] font-bold text-primary hover:bg-primary/10 transition disabled:opacity-50 cursor-pointer"
                >
                  {isCastingThis && <Loader2 className="h-3 w-3 animate-spin" />}
                  {vote.myBallotOptionId == null ? 'Bỏ phiếu' : 'Đổi phiếu'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {!isOpen && (
        <p className="text-[11px] text-muted-foreground">
          {winningOption
            ? `Kết quả: "${winningOption.optionLabel}" thắng`
            : 'Không có kết quả rõ ràng (hoà phiếu hoặc chưa đủ phiếu).'}
        </p>
      )}

      {/* Card error message */}
      {cardError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-2.5 flex items-start gap-2 text-destructive text-xs">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span className="font-semibold leading-relaxed">{cardError}</span>
        </div>
      )}

      {isOpen && canManage && (
        <div className="flex flex-wrap gap-2 border-border border-t pt-3">
          <button
            type="button"
            onClick={() => onClose(vote.groupVoteId)}
            disabled={isClosing}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[11px] font-bold text-primary-foreground hover:bg-primary-hover transition disabled:opacity-50 cursor-pointer"
          >
            {isClosing && <Loader2 className="h-3 w-3 animate-spin" />}
            Đóng bình chọn
          </button>
          <button
            type="button"
            onClick={() => onCancel(vote.groupVoteId)}
            disabled={isCancelling}
            className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 px-3 py-1.5 text-[11px] font-bold text-destructive hover:bg-destructive/10 transition disabled:opacity-50 cursor-pointer"
          >
            {isCancelling && <Loader2 className="h-3 w-3 animate-spin" />}
            Huỷ bình chọn
          </button>
        </div>
      )}
    </div>
  );
}

export function GroupVotesTab({
  groupId,
  currentUserId,
  isLeader,
  members,
  targetVoteId,
  groupStatus,
}: GroupVotesTabProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [historyPage, setHistoryPage] = useState(0);

  const isCancelled = groupStatus === 'CANCELLED';
  const openVotesQuery = useGroupVotes(groupId, { status: 'OPEN', size: 50 });
  const historyQuery = useGroupVotes(groupId, {
    status: 'CLOSED',
    page: historyPage,
    size: HISTORY_PAGE_SIZE,
  });

  const castBallot = useCastBallot(groupId);
  const closeVote = useCloseVote(groupId);
  const cancelVote = useCancelVote(groupId);

  const currentMemberId = members.find((m) => m.userId === currentUserId)?.matchingMemberId ?? null;

  function canManage(vote: GroupVoteResponse) {
    if (isCancelled) return false;
    return isLeader || (currentMemberId != null && vote.createdByMemberId === currentMemberId);
  }

  function getCardError(voteId: string) {
    if (closeVote.isError && closeVote.variables === voteId) {
      return closeVote.error instanceof Error
        ? closeVote.error.message
        : 'Không thể đóng bình chọn';
    }
    if (cancelVote.isError && cancelVote.variables === voteId) {
      return cancelVote.error instanceof Error
        ? cancelVote.error.message
        : 'Không thể huỷ bình chọn';
    }
    if (castBallot.isError && castBallot.variables?.voteId === voteId) {
      return castBallot.error instanceof Error ? castBallot.error.message : 'Không thể bỏ phiếu';
    }
    return null;
  }

  const openVotes = openVotesQuery.data?.content ?? [];
  const governanceVotes = openVotes.filter((v) => v.voteType !== 'OTHER');
  const openPolls = openVotes.filter((v) => v.voteType === 'OTHER');
  const closedVotes = historyQuery.data?.content ?? [];

  useEffect(() => {
    if (!targetVoteId) return;

    const timer = setTimeout(() => {
      const el = document.getElementById(`vote-${targetVoteId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [targetVoteId]);

  const cardHandlers = {
    onCast: (voteId: string, optionId: string) => {
      if (isCancelled) return;
      closeVote.reset();
      cancelVote.reset();
      castBallot.mutate({ voteId, optionId });
    },
    onClose: (voteId: string) => {
      if (isCancelled) return;
      castBallot.reset();
      cancelVote.reset();
      closeVote.mutate(voteId);
    },
    onCancel: (voteId: string) => {
      if (isCancelled) return;
      castBallot.reset();
      closeVote.reset();
      cancelVote.mutate(voteId);
    },
    castingOptionId: castBallot.isPending ? (castBallot.variables?.optionId ?? null) : null,
  };

  return (
    <div className="space-y-6">
      {governanceVotes.length > 0 && (
        <div className="rounded-2xl border-2 border-amber-500/60 bg-amber-500/5 p-4 space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-extrabold text-xs uppercase">
            <AlertTriangle className="h-4 w-4" />
            <span>{governanceVotes.length} biểu quyết quan trọng đang mở — cần bạn bỏ phiếu</span>
          </div>
          <div className="space-y-3">
            {governanceVotes.map((vote) => (
              <VoteCard
                key={vote.groupVoteId}
                vote={vote}
                canManage={canManage(vote)}
                emphasized
                isTarget={vote.groupVoteId === targetVoteId}
                isCancelled={isCancelled}
                isClosing={closeVote.isPending && closeVote.variables === vote.groupVoteId}
                isCancelling={cancelVote.isPending && cancelVote.variables === vote.groupVoteId}
                cardError={getCardError(vote.groupVoteId)}
                {...cardHandlers}
              />
            ))}
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <VoteIcon className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Bình chọn trong nhóm</h3>
          </div>
          {!isCancelled && (
            <AppButton size="sm" onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-1 h-3.5 w-3.5" />
              Tạo bình chọn
            </AppButton>
          )}
        </div>

        {openVotesQuery.isLoading ? (
          <p className="text-xs text-muted-foreground">Đang tải...</p>
        ) : openPolls.length === 0 ? (
          <p className="text-xs text-muted-foreground">Chưa có bình chọn nào đang mở trong nhóm.</p>
        ) : (
          <div className="space-y-3">
            {openPolls.map((vote) => (
              <VoteCard
                key={vote.groupVoteId}
                vote={vote}
                canManage={canManage(vote)}
                isTarget={vote.groupVoteId === targetVoteId}
                isCancelled={isCancelled}
                isClosing={closeVote.isPending && closeVote.variables === vote.groupVoteId}
                isCancelling={cancelVote.isPending && cancelVote.variables === vote.groupVoteId}
                cardError={getCardError(vote.groupVoteId)}
                {...cardHandlers}
              />
            ))}
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-foreground">Lịch sử bình chọn</h3>

        {historyQuery.isLoading ? (
          <p className="text-xs text-muted-foreground">Đang tải...</p>
        ) : closedVotes.length === 0 ? (
          <p className="text-xs text-muted-foreground">Chưa có bình chọn nào đã đóng.</p>
        ) : (
          <div className="space-y-3">
            {closedVotes.map((vote) => (
              <VoteCard
                key={vote.groupVoteId}
                vote={vote}
                canManage={false}
                isTarget={vote.groupVoteId === targetVoteId}
                isCancelled={isCancelled}
                isClosing={closeVote.isPending && closeVote.variables === vote.groupVoteId}
                isCancelling={cancelVote.isPending && cancelVote.variables === vote.groupVoteId}
                cardError={getCardError(vote.groupVoteId)}
                {...cardHandlers}
              />
            ))}
          </div>
        )}

        {historyQuery.data && historyQuery.data.totalPages > 1 && (
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setHistoryPage((p) => Math.max(0, p - 1))}
              disabled={historyPage === 0}
              className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-[11px] font-bold text-foreground disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Trước
            </button>
            <span className="text-[11px] text-muted-foreground">
              Trang {historyPage + 1}/{historyQuery.data.totalPages}
            </span>
            <button
              type="button"
              onClick={() => setHistoryPage((p) => p + 1)}
              disabled={historyQuery.data.last}
              className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-[11px] font-bold text-foreground disabled:opacity-40 cursor-pointer"
            >
              Sau <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      <CreateGeneralPollModal
        groupId={groupId}
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => setIsCreateOpen(false)}
      />
    </div>
  );
}
