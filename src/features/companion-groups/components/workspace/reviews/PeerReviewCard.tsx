import { Clock, Coins, Flame, Lock, Star } from 'lucide-react';
import { AppAvatar } from '@/shared/ui';
import { formatDate } from '@/utils/format';
import type { PeerReviewItem } from '../../../services/peerReviewService';

interface PeerReviewCardProps {
  review: PeerReviewItem;

  showReviewee?: boolean;
}

const CRITERIA = [
  { key: 'endurance', label: 'Thể lực', icon: Flame, iconClass: 'text-rose-500' },
  { key: 'punctuality', label: 'Đúng giờ', icon: Clock, iconClass: 'text-blue-500' },
  { key: 'finance', label: 'Tài chính', icon: Coins, iconClass: 'text-emerald-500' },
] as const;

export function PeerReviewCard({ review, showReviewee = false }: PeerReviewCardProps) {
  const scores: Record<(typeof CRITERIA)[number]['key'], number> = {
    endurance: review.actualEnduranceRating,
    punctuality: review.punctualityResponsibilityRating,
    finance: review.financialFairnessRating,
  };

  return (
    <article className="space-y-3.5 rounded-2xl border border-border bg-muted/15 p-4 shadow-2xs transition hover:border-border/80">
      <header className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          {showReviewee ? (
            <AppAvatar name={review.revieweeFullName} src={review.revieweeAvatarUrl} size="sm" />
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Lock className="h-4 w-4" />
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate font-bold text-foreground text-xs">
              {showReviewee ? `Đánh giá cho: ${review.revieweeFullName}` : 'Bạn đồng hành ẩn danh'}
            </p>
            <span className="text-[10px] text-muted-foreground">
              {formatDate(review.createdAt)}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {showReviewee && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 font-medium text-[10px] text-muted-foreground">
              <Lock className="h-2.5 w-2.5" /> Ẩn danh
            </span>
          )}
          <div className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 font-bold text-amber-600 text-xs dark:text-amber-400">
            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            <span>{(review.averageRating ?? 0).toFixed(1)} / 5</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-2 rounded-xl border border-border/40 bg-background/80 p-2.5 text-center">
        {CRITERIA.map((criterion, index) => {
          const Icon = criterion.icon;
          return (
            <div
              key={criterion.key}
              className={index === 1 ? 'space-y-0.5 border-border/40 border-x' : 'space-y-0.5'}
            >
              <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
                <Icon className={`h-3 w-3 ${criterion.iconClass}`} />
                <span>{criterion.label}</span>
              </div>
              <div className="flex items-center justify-center gap-0.5 font-bold text-amber-500 text-xs">
                <Star className="h-3 w-3 fill-amber-500" />
                <span>{scores[criterion.key]}</span>
              </div>
            </div>
          );
        })}
      </div>

      {review.comment ? (
        <p className="rounded-xl bg-muted/40 p-2.5 text-foreground/90 text-xs italic leading-relaxed">
          "{review.comment}"
        </p>
      ) : (
        <p className="text-[11px] text-muted-foreground italic">Không có nhận xét thêm</p>
      )}
    </article>
  );
}
