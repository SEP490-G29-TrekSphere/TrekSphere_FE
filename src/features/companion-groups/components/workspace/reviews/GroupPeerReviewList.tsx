import { MessageSquare, ShieldCheck } from 'lucide-react';
import type { PeerReviewItem } from '../../../services/peerReviewService';
import { PeerReviewCard } from './PeerReviewCard';

interface GroupPeerReviewListProps {
  reviews: PeerReviewItem[];
  isLoading: boolean;
}

export function GroupPeerReviewList({ reviews, isLoading }: GroupPeerReviewListProps) {
  return (
    <section className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-xs">
      <div className="flex items-center justify-between gap-3 border-border border-b pb-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-base text-foreground">Đánh giá đã gửi trong chuyến đi</h3>
          </div>
          <p className="text-muted-foreground text-xs">
            Toàn bộ đánh giá được chia sẻ dưới dạng ẩn danh 100% người gửi.
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 font-bold text-primary text-xs">
          {reviews.length} lượt đánh giá
        </span>
      </div>

      {isLoading ? (
        <p className="py-8 text-center text-muted-foreground text-xs">
          Đang tải dữ liệu đánh giá...
        </p>
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center space-y-3 py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div className="max-w-xs space-y-1">
            <p className="font-semibold text-foreground text-xs">Chưa có đánh giá nào</p>
            <p className="text-[11px] text-muted-foreground">
              Các đánh giá ẩn danh sẽ xuất hiện tại đây ngay khi thành viên trong đoàn gửi nhận xét.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {reviews.map((review) => (
            <PeerReviewCard key={review.groupPeerReviewId} review={review} showReviewee />
          ))}
        </div>
      )}
    </section>
  );
}
