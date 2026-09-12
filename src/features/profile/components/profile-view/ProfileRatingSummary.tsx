import { Coins, Flame, MessageSquare, ShieldCheck, Sparkles, Star, UserCheck } from 'lucide-react';
import { useUserPeerReviews } from '@/features/companion-groups/hooks/useGroupPeerReviews';
import type { PeerReviewItem } from '@/features/companion-groups/services/peerReviewService';
import { AppSpinner } from '@/shared/ui';
import { formatDate } from '@/utils/format';

const STARS = [5, 4, 3, 2, 1];

interface ProfileRatingSummaryProps {
  userId?: string;
}

/**
 * Tab "Đánh giá" — Tổng hợp điểm uy tín và danh sách nhận xét ẩn danh từ bạn đồng hành
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

  const totalReviews = reviews.length;

  // Tính điểm trung bình tổng và histogram
  const starCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let sumTotal = 0;
  let sumEndurance = 0;
  let sumPunctuality = 0;
  let sumFinance = 0;

  for (const r of reviews) {
    const avg = Number(r.averageRating) || 5;
    sumTotal += avg;
    const rounded = Math.min(5, Math.max(1, Math.round(avg)));
    starCounts[rounded] = (starCounts[rounded] || 0) + 1;

    sumEndurance += r.actualEnduranceRating || 5;
    sumPunctuality += r.punctualityResponsibilityRating || 5;
    sumFinance += r.financialFairnessRating || 5;
  }

  const overallAvg = totalReviews > 0 ? (sumTotal / totalReviews).toFixed(1) : '5.0';
  const avgEndurance = totalReviews > 0 ? (sumEndurance / totalReviews).toFixed(1) : '5.0';
  const avgPunctuality = totalReviews > 0 ? (sumPunctuality / totalReviews).toFixed(1) : '5.0';
  const avgFinance = totalReviews > 0 ? (sumFinance / totalReviews).toFixed(1) : '5.0';

  return (
    <div className="space-y-6">
      {/* SUMMARY STATS & HISTOGRAM CARD */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Đánh giá từ bạn đồng hành
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tổng hợp điểm số và nhận xét ẩn danh từ các thành viên đã cùng tham gia chuyến đi.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Điểm tin cậy
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Histogram */}
          <ul className="md:col-span-7 space-y-2">
            {STARS.map((star) => {
              const count = starCounts[star] || 0;
              const percent = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
              return (
                <li key={star} className="flex items-center gap-2.5">
                  <span className="w-3 text-right text-xs font-semibold text-muted-foreground">
                    {star}
                  </span>
                  <Star className="size-3.5 shrink-0 fill-amber-500 text-amber-500" />
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs text-muted-foreground font-medium">
                    {count}
                  </span>
                </li>
              );
            })}
          </ul>

          {/* Điểm trung bình lớn */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-4 rounded-2xl bg-muted/40 border border-border/60 text-center">
            <p className="text-5xl font-extrabold tracking-tight text-foreground">{overallAvg}</p>
            <div className="mt-2 flex items-center justify-center gap-1">
              {STARS.map((star) => {
                const numericAvg = Number(overallAvg);
                return (
                  <Star
                    key={star}
                    className={`size-4 ${
                      star <= Math.round(numericAvg)
                        ? 'fill-amber-500 text-amber-500'
                        : 'fill-muted-foreground/20 text-muted-foreground/20'
                    }`}
                  />
                );
              })}
            </div>
            <p className="mt-1.5 text-xs font-medium text-muted-foreground">
              Dựa trên {totalReviews} lượt đánh giá
            </p>
          </div>
        </div>

        {/* 3 TIÊU CHÍ TRUNG BÌNH */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-border">
          <div className="rounded-2xl border border-border/60 bg-background/60 p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Flame className="h-3.5 w-3.5 text-orange-500" />
                Thể lực thực tế
              </span>
              <span className="text-xs font-bold text-foreground">{avgEndurance} / 5</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full"
                style={{ width: `${(Number(avgEndurance) / 5) * 100}%` }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/60 p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <UserCheck className="h-3.5 w-3.5 text-blue-500" />
                Đúng giờ & Trách nhiệm
              </span>
              <span className="text-xs font-bold text-foreground">{avgPunctuality} / 5</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${(Number(avgPunctuality) / 5) * 100}%` }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/60 p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Coins className="h-3.5 w-3.5 text-emerald-500" />
                Minh bạch tài chính
              </span>
              <span className="text-xs font-bold text-foreground">{avgFinance} / 5</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${(Number(avgFinance) / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* REVIEWS LIST */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2 px-1">
          <MessageSquare className="h-4 w-4 text-primary" />
          Chi tiết nhận xét ({totalReviews})
        </h3>

        {totalReviews === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card/60 p-10 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground mx-auto">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">Chưa có đánh giá nào</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Khi hoàn thành các chuyến đi ghép nhóm, bạn đồng hành sẽ gửi đánh giá và lời nhận
                xét ẩn danh tại đây.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review: PeerReviewItem) => (
              <div
                key={review.groupPeerReviewId}
                className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3 transition hover:border-primary/30"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-foreground block">
                        Bạn đồng hành ẩn danh
                      </span>
                      <span className="text-[11px] text-muted-foreground block">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                    <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    <span>{review.averageRating} / 5</span>
                  </div>
                </div>

                {/* Sub-ratings chips */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="inline-flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1 text-[11px] font-medium text-foreground">
                    <Flame className="h-3 w-3 text-orange-500" />
                    Thể lực: <b className="text-primary">{review.actualEnduranceRating}⭐</b>
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1 text-[11px] font-medium text-foreground">
                    <UserCheck className="h-3 w-3 text-blue-500" />
                    Đúng giờ:{' '}
                    <b className="text-primary">{review.punctualityResponsibilityRating}⭐</b>
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1 text-[11px] font-medium text-foreground">
                    <Coins className="h-3 w-3 text-emerald-500" />
                    Tài chính: <b className="text-primary">{review.financialFairnessRating}⭐</b>
                  </span>
                </div>

                {/* Comment */}
                {review.comment ? (
                  <div className="rounded-xl bg-muted/40 p-3 text-xs text-foreground/90 leading-relaxed italic border-l-2 border-primary">
                    "{review.comment}"
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
