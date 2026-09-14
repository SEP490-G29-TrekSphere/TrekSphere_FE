import { Coins, Flame, ShieldCheck, Sparkles, Star, UserCheck } from 'lucide-react';
import { formatRatingValue, type PeerReviewSummary } from '../../utils/ratingSummary';

interface ProfileRatingOverviewProps {
  summary: PeerReviewSummary;
}

const STARS = [5, 4, 3, 2, 1];

const CRITERIA = [
  {
    key: 'endurance',
    label: 'Thể lực thực tế',
    icon: Flame,
    color: 'bg-orange-500',
    iconClass: 'text-orange-500',
  },
  {
    key: 'punctuality',
    label: 'Đúng giờ & Trách nhiệm',
    icon: UserCheck,
    color: 'bg-blue-500',
    iconClass: 'text-blue-500',
  },
  {
    key: 'finance',
    label: 'Minh bạch tài chính',
    icon: Coins,
    color: 'bg-emerald-500',
    iconClass: 'text-emerald-500',
  },
] as const;

/** Tổng quan điểm uy tín: histogram, điểm trung bình và 3 tiêu chí. */
export function ProfileRatingOverview({ summary }: ProfileRatingOverviewProps) {
  const { totalReviews, overallAverage, starCounts } = summary;
  const criteriaValues: Record<(typeof CRITERIA)[number]['key'], number | null> = {
    endurance: summary.enduranceAverage,
    punctuality: summary.punctualityAverage,
    finance: summary.financeAverage,
  };

  return (
    <section className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-xs">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 font-bold text-foreground text-lg">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Đánh giá từ bạn đồng hành
          </h2>
          <p className="mt-0.5 text-muted-foreground text-xs">
            Tổng hợp điểm số và nhận xét ẩn danh từ các thành viên đã cùng tham gia chuyến đi.
          </p>
        </div>
        <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary text-xs">
          <Sparkles className="h-3.5 w-3.5" />
          Điểm tin cậy
        </div>
      </div>

      <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-12">
        <ul className="space-y-2 md:col-span-7">
          {STARS.map((star) => {
            const count = starCounts[star] ?? 0;
            const percent = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
            return (
              <li key={star} className="flex items-center gap-2.5">
                <span className="w-3 text-right font-semibold text-muted-foreground text-xs">
                  {star}
                </span>
                <Star className="size-3.5 shrink-0 fill-amber-500 text-amber-500" />
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="w-8 text-right font-medium text-muted-foreground text-xs">
                  {count}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-muted/40 p-4 text-center md:col-span-5">
          <p className="font-extrabold text-5xl text-foreground tracking-tight">
            {formatRatingValue(overallAverage)}
          </p>
          <div className="mt-2 flex items-center justify-center gap-1">
            {STARS.map((star) => (
              <Star
                key={star}
                className={`size-4 ${
                  overallAverage !== null && star <= Math.round(overallAverage)
                    ? 'fill-amber-500 text-amber-500'
                    : 'fill-muted-foreground/20 text-muted-foreground/20'
                }`}
              />
            ))}
          </div>
          <p className="mt-1.5 font-medium text-muted-foreground text-xs">
            {totalReviews > 0
              ? `Dựa trên ${totalReviews} lượt đánh giá`
              : 'Chưa có lượt đánh giá nào'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 border-border border-t pt-4 sm:grid-cols-3">
        {CRITERIA.map((criterion) => {
          const Icon = criterion.icon;
          const value = criteriaValues[criterion.key];
          return (
            <div
              key={criterion.key}
              className="space-y-1 rounded-2xl border border-border/60 bg-background/60 p-3.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 font-medium text-muted-foreground text-xs">
                  <Icon className={`h-3.5 w-3.5 ${criterion.iconClass}`} />
                  {criterion.label}
                </span>
                <span className="font-bold text-foreground text-xs">
                  {formatRatingValue(value)}
                  {value === null ? '' : ' / 5'}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${criterion.color}`}
                  style={{ width: `${value === null ? 0 : (value / 5) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
