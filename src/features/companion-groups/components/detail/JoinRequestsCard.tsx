import { AlertTriangle, ChevronLeft, ChevronRight, Eye, Loader2, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getUserProfilePath } from '@/constants';
import { AppEmptyState } from '@/shared/ui';
import type { MatchingMemberItem } from '../../services/companionGroupService';
import { ApplicantProfileModal } from '../modals/ApplicantProfileModal';
import { MemberAvatar } from './MemberAvatar';

export interface JoinRequestAction {
  id: string;
  userId?: string;
  userName: string;
  avatarUrl?: string;
  trustScore?: number | null;
}

/** Ứng viên đang được leader mở xem hồ sơ nâng cao. */
interface ViewingApplicant {
  userId: string;
  fullName: string;
  avatarUrl?: string;
}

interface JoinRequestsCardProps {
  requests: MatchingMemberItem[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onApprove: (req: JoinRequestAction) => void;
  onReject: (req: JoinRequestAction) => void;
  page: number;
  totalPages: number;
  totalElements: number;
  isLast: boolean;
  onPrevPage: () => void;
  onNextPage: () => void;
}

export function JoinRequestsCard({
  requests,
  isLoading,
  isError,
  onRetry,
  onApprove,
  onReject,
  page,
  totalPages,
  totalElements,
  isLast,
  onPrevPage,
  onNextPage,
}: JoinRequestsCardProps) {
  const [viewingApplicant, setViewingApplicant] = useState<ViewingApplicant | null>(null);

  return (
    <div className="rounded-2xl bg-card p-6 md:p-8 border border-border space-y-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Duyệt thành viên xin vào nhóm</h2>
        <span className="text-xs font-semibold text-destructive">
          {totalElements} yêu cầu chờ xử lý
        </span>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-xs font-medium">Đang tải danh sách yêu cầu...</span>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-4 flex items-center justify-between gap-3">
          <p className="text-xs text-destructive font-medium">Không thể tải danh sách yêu cầu.</p>
          <button
            type="button"
            onClick={onRetry}
            className="text-xs font-bold text-destructive underline"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && requests.length === 0 && (
        <AppEmptyState
          title="Không có yêu cầu nào"
          description="Chưa có yêu cầu tham gia mới nào."
        />
      )}

      {/* Join requests list */}
      {!isLoading &&
        !isError &&
        requests.map((req) => (
          <div
            key={req.applicationId ?? req.userId}
            className="rounded-xl border border-border bg-background p-5 space-y-3"
          >
            <div className="flex items-center justify-between gap-4">
              <Link
                to={getUserProfilePath(req.userId)}
                className="group flex min-w-0 flex-1 items-center gap-3 hover:opacity-85 transition-opacity"
                title={`Xem trang cá nhân của ${req.fullName}`}
              >
                <MemberAvatar fullName={req.fullName} avatarUrl={req.avatarUrl ?? undefined} />
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                      {req.fullName}
                    </h3>
                    {typeof req.trustScore === 'number' &&
                      (req.trustScore < 80 ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400 border border-amber-500/30">
                          <AlertTriangle className="h-3 w-3 text-amber-600" />
                          Điểm uy tín: {req.trustScore}/100
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                          <ShieldCheck className="h-3 w-3 text-emerald-600" />
                          {req.trustScore}/100
                        </span>
                      ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Yêu cầu gia nhập{' '}
                    <span className="text-muted-foreground/60">
                      {new Date(req.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </p>
                </div>
              </Link>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    setViewingApplicant({
                      userId: req.userId,
                      fullName: req.fullName,
                      avatarUrl: req.avatarUrl ?? undefined,
                    })
                  }
                  title="Xem thông tin nâng cao"
                  aria-label={`Xem thông tin nâng cao của ${req.fullName}`}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onApprove({
                      id: req.applicationId ?? '',
                      userId: req.userId,
                      userName: req.fullName,
                      avatarUrl: req.avatarUrl ?? undefined,
                      trustScore: req.trustScore,
                    })
                  }
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold text-white transition-colors cursor-pointer ${
                    typeof req.trustScore === 'number' && req.trustScore < 80
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-primary hover:bg-primary-hover'
                  }`}
                >
                  Duyệt
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onReject({
                      id: req.applicationId ?? '',
                      userId: req.userId,
                      userName: req.fullName,
                      avatarUrl: req.avatarUrl ?? undefined,
                      trustScore: req.trustScore,
                    })
                  }
                  className="rounded-full border border-border bg-background px-4 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  Từ chối
                </button>
              </div>
            </div>

            {req.message && (
              <div className="rounded-lg bg-muted/40 p-2.5 text-xs text-muted-foreground italic">
                "{req.message}"
              </div>
            )}
          </div>
        ))}

      {/* Pagination */}
      {!isLoading && !isError && totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground">
            Trang {page} / {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={onPrevPage}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={isLast}
              onClick={onNextPage}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <ApplicantProfileModal
        userId={viewingApplicant?.userId ?? null}
        fallbackName={viewingApplicant?.fullName ?? ''}
        fallbackAvatarUrl={viewingApplicant?.avatarUrl}
        onClose={() => setViewingApplicant(null)}
      />
    </div>
  );
}
