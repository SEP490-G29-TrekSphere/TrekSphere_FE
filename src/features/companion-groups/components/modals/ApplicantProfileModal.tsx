import { AlertTriangle, ExternalLink, Loader2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getUserProfilePath } from '@/constants';
import {
  GENDER_API_LABELS,
  type PublicHikingSummary,
  usePublicHikingSummary,
} from '@/features/profile';
import { AppEmptyState, AppModalShell } from '@/shared/ui';
import { ApplicantHikingSummary } from '../detail/ApplicantHikingSummary';
import { MemberAvatar } from '../detail/MemberAvatar';

interface ApplicantProfileModalProps {
  /** Target applicant user id. When `null`, modal will not render. */
  userId: string | null;
  /** Fallback applicant name displayed while summary query is in flight. */
  fallbackName: string;
  fallbackAvatarUrl?: string;
  onClose: () => void;
}

/** Check if the public hiking summary has meaningful custom fields. */
function hasAdvancedInfo(
  summary: PublicHikingSummary | null | undefined
): summary is PublicHikingSummary {
  if (!summary) return false;
  return Boolean(
    summary.bio ||
      summary.experienceLevel ||
      summary.preferredDifficulty ||
      summary.preferredAreas?.length ||
      summary.skills?.length ||
      (summary.trustReviewCount ?? 0) > 0
  );
}

/**
 * Modal to preview applicant's public hiking profile and experience.
 * Read-only view for group leaders before accepting/rejecting join requests.
 */
export function ApplicantProfileModal({
  userId,
  fallbackName,
  fallbackAvatarUrl,
  onClose,
}: ApplicantProfileModalProps) {
  const {
    data: summary,
    isLoading,
    isError,
    refetch,
  } = usePublicHikingSummary(userId ?? undefined);

  if (!userId) return null;

  return (
    <AppModalShell
      open
      onClose={onClose}
      aria-label="Hồ sơ nâng cao của ứng viên"
      className="flex max-w-md flex-col overflow-hidden border border-border p-0"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
        aria-label="Đóng"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Header */}
      <div className="border-b border-border bg-primary/5 px-6 py-5">
        <Link
          to={getUserProfilePath(userId)}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 hover:opacity-85 transition-opacity"
          title="Xem trang cá nhân đầy đủ (mở trong tab mới)"
        >
          <MemberAvatar
            fullName={summary?.fullName || fallbackName}
            avatarUrl={summary?.avatarUrl || fallbackAvatarUrl}
            size="lg"
          />
          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-1.5">
              <h2 className="truncate text-base font-bold text-foreground group-hover:text-primary transition-colors">
                {summary?.fullName || fallbackName}
              </h2>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Hồ sơ leo núi công khai
              {summary?.gender ? ` • ${GENDER_API_LABELS[summary.gender]}` : ''}
            </p>
          </div>
        </Link>
      </div>

      {/* Body */}
      <div className="max-h-[65vh] space-y-4 overflow-y-auto px-6 py-5 text-xs">
        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="font-medium">Đang tải hồ sơ nâng cao...</span>
          </div>
        )}

        {isError && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4">
            <p className="flex items-center gap-1.5 font-medium text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              Không thể tải hồ sơ của ứng viên.
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="font-bold text-destructive underline cursor-pointer"
            >
              Thử lại
            </button>
          </div>
        )}

        {!isLoading &&
          !isError &&
          (hasAdvancedInfo(summary) ? (
            <ApplicantHikingSummary summary={summary} />
          ) : (
            <AppEmptyState
              title="Chưa có thông tin nâng cao"
              description="Ứng viên chưa cập nhật kinh nghiệm, kỹ năng hay khu vực ưa thích trong hồ sơ."
            />
          ))}
      </div>

      {/* Footer */}
      <div className="flex justify-end border-t border-border bg-muted/10 px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted cursor-pointer"
        >
          Đóng
        </button>
      </div>
    </AppModalShell>
  );
}
