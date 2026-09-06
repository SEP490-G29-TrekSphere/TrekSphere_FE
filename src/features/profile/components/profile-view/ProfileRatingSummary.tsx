import { Star } from 'lucide-react';

const STARS = [5, 4, 3, 2, 1];

/**
 * Tab "Đánh giá" — khối tổng hợp điểm theo reference AllTrails
 * (histogram 5 mức + điểm trung bình lớn bên phải).
 *
 * BE chưa có API đánh giá người dùng, nên khối này dựng đúng bố cục nhưng
 * hiển thị trạng thái rỗng: điểm là `—`, các thanh ở mức 0. Không đặt số giả.
 */
export function ProfileRatingSummary() {
  return (
    <div className="rounded-2xl bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        {/* Histogram */}
        <ul className="flex-1 space-y-1.5">
          {STARS.map((star) => (
            <li key={star} className="flex items-center gap-2">
              <span className="w-3 text-right text-xs text-muted-foreground">{star}</span>
              <Star className="size-3.5 shrink-0 fill-muted-foreground/40 text-muted-foreground/40" />
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-0 rounded-full bg-primary" />
              </div>
            </li>
          ))}
        </ul>

        {/* Điểm trung bình */}
        <div className="shrink-0 text-center sm:w-40">
          <p className="text-5xl font-bold leading-none text-primary">—</p>
          <div className="mt-2 flex items-center justify-center gap-0.5">
            {STARS.map((star) => (
              <Star
                key={star}
                className="size-4 fill-muted-foreground/30 text-muted-foreground/30"
              />
            ))}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">0 đánh giá</p>
        </div>
      </div>

      <p className="mt-6 border-t border-border pt-4 text-center text-sm text-muted-foreground">
        Tính năng đánh giá người dùng đang được phát triển.
      </p>
    </div>
  );
}
