import { CheckCircle2, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AppAvatar } from '@/shared/ui';
import type { PeerReviewCandidate } from '../../../services/peerReviewService';

interface PeerReviewCandidateNavProps {
  candidates: PeerReviewCandidate[];
  activeCandidateId: string;
  onSelect: (candidate: PeerReviewCandidate) => void;
}

export function PeerReviewCandidateNav({
  candidates,
  activeCandidateId,
  onSelect,
}: PeerReviewCandidateNavProps) {
  if (candidates.length <= 1) return null;

  const reviewedCount = candidates.filter((candidate) => candidate.isReviewed).length;

  return (
    <div className="space-y-2 rounded-xl border border-border/80 bg-muted/30 p-3">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 font-bold text-foreground">
          <UserCheck className="h-3.5 w-3.5 text-primary" />
          Danh sách đánh giá thành viên
        </span>
        <span className="rounded-full border border-border bg-background px-2 py-0.5 font-medium text-[11px] text-muted-foreground">
          Đã hoàn thành {reviewedCount}/{candidates.length}
        </span>
      </div>

      <div className="scrollbar-thin flex items-center gap-2 overflow-x-auto pb-1">
        {candidates.map((candidate) => {
          const isCurrent = candidate.matchingMemberId === activeCandidateId;
          return (
            <button
              key={candidate.matchingMemberId}
              type="button"
              onClick={() => onSelect(candidate)}
              className={cn(
                'flex shrink-0 cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs transition',
                isCurrent
                  ? 'border-primary bg-primary/10 font-bold text-primary shadow-2xs'
                  : candidate.isReviewed
                    ? 'border-border bg-muted font-medium text-foreground'
                    : 'border-border bg-background text-muted-foreground hover:bg-muted'
              )}
            >
              <AppAvatar name={candidate.fullName} src={candidate.avatarUrl} size="xs" />
              <span>{candidate.fullName}</span>
              {candidate.isReviewed && (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
