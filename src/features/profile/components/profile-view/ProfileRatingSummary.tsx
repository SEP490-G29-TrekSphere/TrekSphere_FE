import { MessageSquare } from 'lucide-react';
import { PeerReviewCard } from '@/features/companion-groups/components/workspace/reviews/PeerReviewCard';
import { useUserPeerReviews } from '@/features/companion-groups/hooks/useGroupPeerReviews';
import { AppSpinner } from '@/shared/ui';
import { summarizePeerReviews } from '../../utils/ratingSummary';
import { ProfileRatingOverview } from './ProfileRatingOverview';

interface ProfileRatingSummaryProps {
  userId?: string;
}

/**
 * Tab "Đánh giá" — tổng hợp điểm uy tín và danh sách nhận xét ẩn danh từ bạn đồng hành
 * nhận được sau các chuyến đi ghép nhóm.
 */
export function ProfileRatingSummary({ userId }: ProfileRatingSummaryProps) {
  const { data: reviews = [], isLoading } = useUserPeerReviews(userId);

  if (isLoading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center rounded-2xl bg-card p-10 shadow-sm">
        <AppSpinner size="default" className="text-primary" />
      </div>
    );
  }

  const summary = summarizePeerReviews(reviews);

  return (
    <div className="space-y-6">
      <ProfileRatingOverview summary={summary} />

      <div className="space-y-4">
        <h3 className="flex items-center gap-2 px-1 font-bold text-foreground text-sm">
          <MessageSquare className="h-4 w-4 text-primary" />
          Chi tiết nhận xét ({summary.totalReviews})
        </h3>

        {summary.totalReviews === 0 ? (
          <div className="space-y-3 rounded-3xl border border-border border-dashed bg-card/60 p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-foreground text-sm">Chưa có đánh giá nào</p>
              <p className="mx-auto max-w-sm text-muted-foreground text-xs">
                Khi hoàn thành các chuyến đi ghép nhóm, bạn đồng hành sẽ gửi đánh giá và lời nhận
                xét ẩn danh tại đây.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {reviews.map((review) => (
              <PeerReviewCard key={review.groupPeerReviewId} review={review} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
