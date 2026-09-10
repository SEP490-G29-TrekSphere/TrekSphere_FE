import { Calendar, CheckCircle2, Lock, MapPin, Pencil, Unlock } from 'lucide-react';
import type { CustomJourneyDetailResponse } from '../../../types/workspace';

interface JourneyHeaderCardProps {
  journey: CustomJourneyDetailResponse | null | undefined;
  checkpointCount: number;
  isLeader: boolean;
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
  onEditJourney,
}: JourneyHeaderCardProps) {
  if (!journey) return null;

  const isLocked = Boolean(journey.isLocked);
  const normalizedDiff = (journey.difficulty || '').toUpperCase().trim();
  const diffConfig = DIFFICULTY_CONFIG[normalizedDiff] || {
    label: journey.difficulty ? `Độ khó: ${journey.difficulty}` : 'Độ khó: Trung bình',
    badgeClass: 'bg-muted text-muted-foreground border-border',
  };

  const canEdit = isLeader && !isLocked;

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

            {isLocked ? (
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
                {journey.startDate} → {journey.endDate}
              </span>
            </div>
            {isLocked && journey.lockedAt && (
              <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Đã chốt lúc: {new Date(journey.lockedAt).toLocaleDateString('vi-VN')}</span>
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

      {journey.description && (
        <div className="mt-4 border-t border-border/60 pt-3.5 text-xs leading-relaxed text-muted-foreground">
          {journey.description}
        </div>
      )}
    </div>
  );
}
