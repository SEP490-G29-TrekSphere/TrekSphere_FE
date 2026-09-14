import { Loader2, Users, Vote, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AppModalShell } from '@/shared/ui';
import { useOpenLeaderElection } from '../../../hooks/vote/useOpenLeaderElection';
import type { MatchingMemberItem } from '../../../services/companionGroupService';

interface OpenLeaderElectionModalProps {
  groupId: string;
  isOpen: boolean;
  onClose: () => void;
  members: MatchingMemberItem[];
  onSuccess?: () => void;
}

/** Trả về datetime-local mặc định = hiện tại + 24 giờ, theo múi giờ local của trình duyệt. */
function defaultClosesAtLocal(): string {
  const date = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function OpenLeaderElectionModal({
  groupId,
  isOpen,
  onClose,
  members,
  onSuccess,
}: OpenLeaderElectionModalProps) {
  const openElection = useOpenLeaderElection(groupId);
  const [reason, setReason] = useState('');
  const [closesAtLocal, setClosesAtLocal] = useState(defaultClosesAtLocal());
  const [candidateIds, setCandidateIds] = useState<string[]>([]);

  const candidates = members.filter(
    (m) => m.status === 'ACCEPTED' && m.role !== 'LEADER' && m.matchingMemberId
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: chỉ muốn reset form khi isOpen đổi (mở lại modal), không phải mỗi khi object mutation đổi identity giữa các render
  useEffect(() => {
    if (isOpen) {
      setReason('');
      setClosesAtLocal(defaultClosesAtLocal());
      setCandidateIds([]);
      openElection.reset();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function toggleCandidate(memberId: string) {
    setCandidateIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim() || candidateIds.length < 2) return;

    openElection.mutate(
      {
        reason: reason.trim(),
        closesAt: new Date(closesAtLocal).toISOString(),
        candidateMemberIds: candidateIds,
      },
      { onSuccess: () => onSuccess?.() }
    );
  }

  const canSubmit = reason.trim().length > 0 && candidateIds.length >= 2 && !openElection.isPending;

  return (
    <AppModalShell
      open
      onClose={onClose}
      aria-label="Mở bầu Trưởng nhóm mới"
      className="flex max-w-lg flex-col overflow-hidden border border-border p-0"
    >
      <button
        type="button"
        onClick={onClose}
        disabled={openElection.isPending}
        className="absolute top-4 right-4 z-10 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer disabled:opacity-50"
        aria-label="Đóng"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="border-border border-b bg-primary/5 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Vote className="h-6 w-6" />
          </div>
          <div className="space-y-0.5">
            <h2 className="font-extrabold text-foreground text-base sm:text-lg">
              Mở bầu Trưởng nhóm mới
            </h2>
            <p className="text-muted-foreground text-xs">
              Tất cả thành viên sẽ bỏ phiếu; người có nhiều phiếu nhất trở thành Trưởng nhóm mới.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 p-6 text-xs">
        <div className="space-y-1.5">
          <label htmlFor="election-reason" className="font-bold text-foreground text-xs">
            Lý do mở bầu cử
          </label>
          <textarea
            id="election-reason"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={openElection.isPending}
            placeholder="VD: Trưởng nhóm hiện tại bận việc đột xuất, không thể tiếp tục điều phối chuyến đi..."
            className="w-full resize-none rounded-xl border border-input bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="election-closes-at" className="font-bold text-foreground text-xs">
            Thời hạn bỏ phiếu
          </label>
          <input
            id="election-closes-at"
            type="datetime-local"
            value={closesAtLocal}
            min={defaultClosesAtLocal()}
            onChange={(e) => setClosesAtLocal(e.target.value)}
            disabled={openElection.isPending}
            className="w-full rounded-xl border border-input bg-background p-2.5 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-foreground text-xs">Chọn ứng viên (tối thiểu 2)</span>
            <span className="text-[10px] text-muted-foreground font-medium">
              Đã chọn {candidateIds.length}
            </span>
          </div>
          {candidates.length < 2 ? (
            <p className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-[11px] text-amber-700 dark:text-amber-400">
              Cần tối thiểu 2 thành viên khác (không phải Trưởng nhóm hiện tại) để mở bầu cử.
            </p>
          ) : (
            <div className="max-h-52 space-y-1.5 overflow-y-auto rounded-xl border border-border p-2">
              {candidates.map((member) => (
                <label
                  key={member.matchingMemberId}
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg p-2 hover:bg-muted select-none"
                >
                  <input
                    type="checkbox"
                    checked={candidateIds.includes(member.matchingMemberId as string)}
                    onChange={() => toggleCandidate(member.matchingMemberId as string)}
                    disabled={openElection.isPending}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                  />
                  <Users className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="text-xs font-medium text-foreground">{member.fullName}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {openElection.isError && (
          <p className="text-[11px] font-semibold text-destructive">
            {openElection.error instanceof Error
              ? openElection.error.message
              : 'Không thể mở bầu cử, vui lòng thử lại.'}
          </p>
        )}

        <div className="flex justify-end gap-2.5 border-border border-t pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={openElection.isPending}
            className="rounded-full border border-border bg-background px-4 py-2 font-semibold text-foreground text-xs hover:bg-muted cursor-pointer transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="flex items-center justify-center gap-1.5 rounded-full bg-primary px-5 py-2 font-bold text-primary-foreground text-xs hover:bg-primary-hover transition-colors shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {openElection.isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Đang mở...</span>
              </>
            ) : (
              <>
                <Vote className="h-3.5 w-3.5" />
                <span>Mở bầu cử</span>
              </>
            )}
          </button>
        </div>
      </form>
    </AppModalShell>
  );
}
