import { CheckCircle2, Star } from 'lucide-react';
import type { PeerReviewCandidate } from '../../../services/peerReviewService';
import { PeerReviewCandidateCard } from './PeerReviewCandidateCard';

interface PeerReviewProgressCardProps {
  candidates: PeerReviewCandidate[];
  isLoading: boolean;
  onReview: (candidate: PeerReviewCandidate) => void;
}

/** Tiến độ chấm điểm của người dùng hiện tại + danh sách bạn đồng hành. */
export function PeerReviewProgressCard({
  candidates,
  isLoading,
  onReview,
}: PeerReviewProgressCardProps) {
  const unreviewedCount = candidates.filter((candidate) => !candidate.isReviewed).length;
  const completedCount = candidates.length - unreviewedCount;
  const progressPercent =
    candidates.length > 0 ? Math.round((completedCount / candidates.length) * 100) : 0;
  const isAllReviewed = candidates.length > 0 && unreviewedCount === 0;

  return (
    <section className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-xs">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <Star className="h-4 w-4 fill-amber-500" />
            </div>
            <h3 className="font-bold text-foreground text-lg">Đánh giá bạn đồng hành</h3>
          </div>
          <p className="text-muted-foreground text-xs">
            Chấm điểm và nhận xét ẩn danh cho các thành viên đã cùng bạn đồng hành trong chuyến đi.
            Mỗi người chỉ chấm được một lần.
          </p>
        </div>

        {isAllReviewed && (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 font-bold text-emerald-600 text-xs dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" /> Bạn đã chấm đủ cả đoàn
          </span>
        )}
      </div>

      {candidates.length > 0 && (
        <div className="space-y-2 rounded-2xl border border-border/50 bg-muted/30 p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground">Tiến độ đánh giá của bạn</span>
            <span className="font-bold text-primary">
              {completedCount}/{candidates.length} người ({progressPercent}%)
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h4 className="font-bold text-muted-foreground text-xs uppercase tracking-wider">
          Danh sách bạn đồng hành trong chuyến đi
        </h4>

        {isLoading ? (
          <p className="py-8 text-center text-muted-foreground text-xs">
            Đang tải danh sách thành viên...
          </p>
        ) : candidates.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground text-xs">
            Không tìm thấy thành viên nào khác trong đoàn.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {candidates.map((candidate) => (
              <PeerReviewCandidateCard
                key={candidate.matchingMemberId}
                candidate={candidate}
                onReview={onReview}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
