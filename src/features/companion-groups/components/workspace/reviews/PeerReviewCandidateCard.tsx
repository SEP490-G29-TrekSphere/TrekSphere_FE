import { CheckCircle2 } from 'lucide-react';
import { AppAvatar, AppButton } from '@/shared/ui';
import type { PeerReviewCandidate } from '../../../services/peerReviewService';

interface PeerReviewCandidateCardProps {
  candidate: PeerReviewCandidate;
  onReview: (candidate: PeerReviewCandidate) => void;
}

export function PeerReviewCandidateCard({ candidate, onReview }: PeerReviewCandidateCardProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-muted/20 p-3.5 transition hover:bg-muted/40">
      <div className="flex min-w-0 items-center gap-3">
        <AppAvatar name={candidate.fullName} src={candidate.avatarUrl} size="sm" />
        <div className="min-w-0">
          <p className="truncate font-bold text-foreground text-xs">{candidate.fullName}</p>
          <p className="text-[10px] text-muted-foreground">{candidate.roleLabel}</p>
        </div>
      </div>

      {candidate.isReviewed ? (
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 font-bold text-[11px] text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-3.5 w-3.5" /> Đã chấm
        </span>
      ) : (
        <AppButton
          size="sm"
          variant="outline"
          onClick={() => onReview(candidate)}
          className="h-7 shrink-0 px-3 text-[11px]"
        >
          Đánh giá
        </AppButton>
      )}
    </div>
  );
}
