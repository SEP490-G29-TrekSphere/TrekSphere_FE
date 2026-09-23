import {
  Calendar,
  CheckCircle2,
  Compass,
  Flag,
  Lock,
  MapPin,
  Pencil,
  Unlock,
  XCircle,
} from 'lucide-react';
import { RichTextContent } from '@/shared/ui';
import { formatDate } from '@/utils/format';
import type { MatchingGroupStatus } from '../../../types/matchingGroup';
import type { CustomJourneyDetailResponse } from '../../../types/workspace';

interface JourneyHeaderCardProps {
  journey: CustomJourneyDetailResponse | null | undefined;
  checkpointCount: number;
  isLeader: boolean;
  groupStatus?: MatchingGroupStatus;
  groupDescription?: string | null;
  onEditJourney: () => void;
}

const DIFFICULTY_CONFIG: Record<string, { label: string; badgeClass: string }> = {
  EASY: {
    label: 'Độ khó: Dễ (Mọi người)',
    badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  },
  MODERATE: {
    label: 'Độ khó: Trung bình',
    badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
  },
  MEDIUM: {
    label: 'Độ khó: Trung bình',
    badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
  },
  HARD: {
    label: 'Độ khó: Thử thách / Khó',
    badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
  },
  EXTREME: {
    label: 'Độ khó: Cực kỳ khắc nghiệt',
    badgeClass: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
  },
};

export function JourneyHeaderCard({
  journey,
  checkpointCount,
  isLeader,
  groupStatus,
  groupDescription,
  onEditJourney,
}: JourneyHeaderCardProps) {
  if (!journey) return null;

  const isLocked = Boolean(journey.isLocked);
  const isTripActiveOrEnded =
    groupStatus === 'IN_PROGRESS' || groupStatus === 'COMPLETED' || groupStatus === 'CANCELLED';
  const normalizedDiff = (journey.difficulty || '').toUpperCase().trim();
  const diffConfig = DIFFICULTY_CONFIG[normalizedDiff] || {
    label: journey.difficulty ? `Độ khó: ${journey.difficulty}` : 'Độ khó: Trung bình',
    badgeClass: 'bg-muted text-muted-foreground border-border',
  };

  const canEdit = isLeader && !isLocked && !isTripActiveOrEnded;

  const formattedStartDate = journey.startDate ? formatDate(journey.startDate) : '';
  const formattedEndDate = journey.endDate ? formatDate(journey.endDate) : '';

  const hasJourneyDesc = Boolean(journey.description?.trim());
  const hasGroupDesc = Boolean(
    groupDescription?.trim() && groupDescription.trim() !== journey.description?.trim()
  );

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-xs transition sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${diffConfig.badgeClass}`}
            >
              {diffConfig.label}
            </span>

            {groupStatus === 'IN_PROGRESS' ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-0.5 text-xs font-bold text-sky-600 dark:text-sky-400">
                <Compass className="h-3 w-3" /> Đang trong chuyến đi
              </span>
            ) : groupStatus === 'COMPLETED' ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 text-xs font-bold text-purple-600 dark:text-purple-400">
                <Flag className="h-3 w-3" /> Chuyến đi đã hoàn thành
              </span>
            ) : groupStatus === 'CANCELLED' ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-0.5 text-xs font-bold text-red-600 dark:text-red-400">
                <XCircle className="h-3 w-3" /> Chuyến đi đã hủy
              </span>
            ) : isLocked ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                <Lock className="h-3 w-3" /> Đã khóa lộ trình
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <Unlock className="h-3 w-3" /> Đang mở chỉnh sửa
              </span>
            )}

            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground border border-border">
              <MapPin className="h-3 w-3 text-primary" /> {checkpointCount} điểm dừng
            </span>
          </div>

          <h2 className="text-xl font-extrabold text-foreground sm:text-2xl">{journey.title}</h2>

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              <span>
                {formattedStartDate && formattedEndDate
                  ? `${formattedStartDate} → ${formattedEndDate}`
                  : journey.startDate && journey.endDate
                    ? `${journey.startDate} → ${journey.endDate}`
                    : 'Chưa có ngày'}
              </span>
            </div>
            {isLocked && journey.lockedAt && (
              <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>
                  Đã chốt lúc:{' '}
                  {formatDate(journey.lockedAt) ||
                    new Date(journey.lockedAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
            )}
          </div>
        </div>

        {canEdit && (
          <button
            type="button"
            onClick={onEditJourney}
            className="inline-flex items-center justify-center gap-1.5 self-start rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-bold text-foreground transition hover:bg-muted hover:border-primary/50 shadow-2xs cursor-pointer shrink-0"
          >
            <Pencil className="h-3.5 w-3.5 text-primary" />
            Chỉnh sửa thông tin
          </button>
        )}
      </div>

      {(hasJourneyDesc || hasGroupDesc) && (
        <div className="mt-5 space-y-4 border-t border-border/60 pt-4">
          {hasJourneyDesc && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Mô tả lộ trình
              </h4>
              <RichTextContent content={journey.description!} />
            </div>
          )}

          {hasGroupDesc && (
            <div className="space-y-1.5 rounded-xl border border-primary/20 bg-primary/5 p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                Lưu ý & Mô tả từ Trưởng nhóm
              </h4>
              <RichTextContent content={groupDescription!} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
