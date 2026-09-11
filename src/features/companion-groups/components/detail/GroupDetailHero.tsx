import {
  Bookmark,
  Calendar,
  CircleDollarSign,
  Clock,
  HeartPulse,
  MapPin,
  Share2,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { AppBadge } from '@/shared/ui';
import { toast } from '@/store/useToastStore';
import { formatDate } from '@/utils/format';
import type { MatchingGroupStatus } from '../../services/companionGroupService';
import type { JourneyDifficulty } from '../../types/matchingGroup';

interface GroupDetailHeroProps {
  groupName: string;
  tourName?: string | null;
  tourImageUrl?: string | null;
  location?: string | null;
  description?: string | null;
  status: MatchingGroupStatus;
  targetDate: string;
  matchingDeadline?: string | null;
  difficulty?: JourneyDifficulty | null;
  estimatedCost?: number | null;
  currentMembers?: number;
  maxMembers?: number;
}

const statusConfig: Record<
  MatchingGroupStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  OPEN: { label: 'Đang tuyển', variant: 'secondary' },
  FULL: { label: 'Đã đủ', variant: 'outline' },
  CLOSED: { label: 'Đã đóng', variant: 'destructive' },
  HIDDEN: { label: 'Ẩn', variant: 'outline' },
  IN_PROGRESS: { label: 'Đang diễn ra', variant: 'default' },
  COMPLETED: { label: 'Đã hoàn thành', variant: 'secondary' },
  CANCELLED: { label: 'Đã hủy', variant: 'destructive' },
};

const difficultyLabels: Record<JourneyDifficulty, string> = {
  EASY: 'Dễ',
  MODERATE: 'Vừa phải',
  HARD: 'Thử thách',
  EXTREME: 'Khắc nghiệt',
};

export function GroupDetailHero({
  groupName,
  tourName,
  tourImageUrl,
  location,
  description,
  status,
  targetDate,
  matchingDeadline,
  difficulty,
  estimatedCost,
  currentMembers,
  maxMembers,
}: GroupDetailHeroProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { label, variant } = statusConfig[status] ?? statusConfig.OPEN;

  function handleShare() {
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(window.location.href);
      toast.success('Đã sao chép liên kết nhóm ghép vào bộ nhớ tạm!');
    }
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-lg">
      <div className="relative h-64 sm:h-80 lg:h-96 w-full overflow-hidden bg-slate-900">
        {tourImageUrl ? (
          <img
            src={tourImageUrl}
            alt={tourName ?? groupName}
            className="h-full w-full object-cover opacity-85 transition-transform duration-700 hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary to-primary/60" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        {/* Top Floating Action Buttons */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setIsBookmarked(!isBookmarked);
              toast.success(
                isBookmarked ? 'Đã bỏ lưu nhóm' : 'Đã lưu nhóm vào danh sách yêu thích!'
              );
            }}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md border border-white/20 transition cursor-pointer ${
              isBookmarked
                ? 'bg-amber-500 text-white'
                : 'bg-slate-950/70 text-white hover:bg-slate-900'
            }`}
            title="Lưu chuyến đi"
          >
            <Bookmark className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-950/70 backdrop-blur-md text-white border border-white/20 hover:bg-slate-900 transition cursor-pointer"
            title="Chia sẻ"
          >
            <Share2 className="h-4 w-4 text-emerald-400" />
          </button>
        </div>

        {/* Bottom Hero Info */}
        <div className="absolute right-6 bottom-6 left-6 z-10 space-y-3 text-white">
          <div className="flex flex-wrap items-center gap-2">
            <AppBadge variant={variant} className="font-bold text-xs">
              {label}
            </AppBadge>
            {currentMembers !== undefined && maxMembers !== undefined && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-950/70 px-3 py-1 font-semibold text-white text-xs backdrop-blur-xs">
                <Users className="h-3.5 w-3.5" />
                {currentMembers}/{maxMembers} thành viên
              </span>
            )}
            {difficulty && (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/80 px-2.5 py-0.5 text-xs font-bold text-white backdrop-blur-xs">
                <HeartPulse className="h-3 w-3" />
                {difficultyLabels[difficulty] ?? difficulty}
              </span>
            )}
          </div>

          <h1 className="font-black text-2xl tracking-tight drop-shadow-md sm:text-3xl lg:text-4xl">
            {groupName}
          </h1>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 font-semibold text-white/90 text-xs sm:text-sm">
            {location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-emerald-400" />
                {location}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-amber-400" />
              Khởi hành: {formatDate(targetDate)}
            </span>
            {estimatedCost !== undefined && estimatedCost !== null && estimatedCost > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <CircleDollarSign className="h-4 w-4 text-emerald-400" />~
                {estimatedCost.toLocaleString('vi-VN')} đ/người
              </span>
            )}
            {matchingDeadline && (
              <span className="inline-flex items-center gap-1.5 text-white/80">
                <Clock className="h-4 w-4 text-sky-400" />
                Hạn đăng ký: {formatDate(matchingDeadline)}
              </span>
            )}
          </div>
        </div>
      </div>

      {(description || tourName) && (
        <div className="space-y-2 p-5 sm:p-6">
          {tourName && (
            <p className="font-semibold text-primary text-xs sm:text-sm">Tour: {tourName}</p>
          )}
          {description && (
            <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
