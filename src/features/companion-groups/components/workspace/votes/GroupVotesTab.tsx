import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  Vote as VoteIcon,
} from 'lucide-react';
import { useState } from 'react';
import { AppButton } from '@/shared/ui';
import { useCancelVote } from '../../../hooks/vote/useCancelVote';
import { useCastBallot } from '../../../hooks/vote/useCastBallot';
import { useCloseVote } from '../../../hooks/vote/useCloseVote';
import { useGroupVotes } from '../../../hooks/vote/useGroupVotes';
import type { MatchingMemberItem } from '../../../types/matchingGroup';
import type { GroupVoteResponse, GroupVoteType } from '../../../types/vote';
import { CreateGeneralPollModal } from './CreateGeneralPollModal';

interface GroupVotesTabProps {
  groupId: string;
  currentUserId?: string;
  isLeader: boolean;
  members: MatchingMemberItem[];
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
  emphasized = false,
}: {
  vote: GroupVoteResponse;
  canManage: boolean;
  onCast: (voteId: string, optionId: string) => void;
  castingOptionId: string | null;
  onClose: (voteId: string) => void;
  onCancel: (voteId: string) => void;
  isClosing: boolean;
  isCancelling: boolean;
  emphasized?: boolean;
}) {
  const totalBallots = vote.options.reduce((sum, o) => sum + o.ballotCount, 0);
  const isOpen = vote.status === 'OPEN';
  const winningOption = vote.options.find((o) => o.groupVoteOptionId === vote.winningOptionId);

  return (
    <div
      className={`rounded-2xl border p-4 space-y-3 ${
        emphasized ? 'border-2 border-amber-500/50 bg-amber-500/5' : 'border-border bg-background'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-extrabold text-sm text-foreground">{vote.title}</span>
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
              {isOpen && vote.myBallotOptionId == null && (
                <button
                  type="button"
                  onClick={() => onCast(vote.groupVoteId, option.groupVoteOptionId)}
                  disabled={isCastingThis}
                  className="mt-1 inline-flex items-center gap-1 rounded-full border border-primary/30 px-2.5 py-1 text-[11px] font-bold text-primary hover:bg-primary/10 transition disabled:opacity-50 cursor-pointer"
                >
                  {isCastingThis && <Loader2 className="h-3 w-3 animate-spin" />}
                  Bỏ phiếu
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

export function GroupVotesTab({ groupId, currentUserId, isLeader, members }: GroupVotesTabProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [historyPage, setHistoryPage] = useState(0);

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
    return isLeader || (currentMemberId != null && vote.createdByMemberId === currentMemberId);
  }

  const openVotes = openVotesQuery.data?.content ?? [];
  const governanceVotes = openVotes.filter((v) => v.voteType !== 'OTHER');
  const openPolls = openVotes.filter((v) => v.voteType === 'OTHER');
  const closedVotes = historyQuery.data?.content ?? [];

  const cardHandlers = {
    onCast: (voteId: string, optionId: string) => castBallot.mutate({ voteId, optionId }),
    onClose: (voteId: string) => closeVote.mutate(voteId),
    onCancel: (voteId: string) => cancelVote.mutate(voteId),
    castingOptionId: castBallot.isPending ? (castBallot.variables?.optionId ?? null) : null,
    isClosing: closeVote.isPending,
    isCancelling: cancelVote.isPending,
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
          <AppButton size="sm" onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            Tạo bình chọn
          </AppButton>
        </div>

        {(castBallot.isError || closeVote.isError || cancelVote.isError) && (
          <p className="text-xs font-semibold text-destructive">
            {[castBallot.error, closeVote.error, cancelVote.error]
              .filter((e): e is Error => e instanceof Error)
              .map((e) => e.message)[0] ?? 'Thao tác thất bại, vui lòng thử lại.'}
          </p>
        )}

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
              <VoteCard key={vote.groupVoteId} vote={vote} canManage={false} {...cardHandlers} />
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
