import {
  CheckCircle2,
  Clock,
  Coins,
  Flame,
  Lock,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Star,
} from 'lucide-react';
import { useState } from 'react';
import { AppButton } from '@/shared/ui';
import { formatDate } from '@/utils/format';
import {
  useGroupPeerReviews,
  usePeerReviewCandidates,
  useSubmitPeerReview,
} from '../../../hooks/useGroupPeerReviews';
import type {
  PeerReviewCandidate,
  PeerReviewItem,
  PeerReviewPayload,
} from '../../../services/peerReviewService';
import { GroupPeerReviewModal } from './GroupPeerReviewModal';

interface GroupPeerReviewsTabProps {
  groupId: string;
  isTripEnded: boolean;
}

export function GroupPeerReviewsTab({ groupId, isTripEnded }: GroupPeerReviewsTabProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<PeerReviewCandidate | null>(null);

  const { data: candidates = [], isLoading: isLoadingCandidates } = usePeerReviewCandidates(
    groupId,
    isTripEnded
  );
  const { data: myReceivedReviews = [], isLoading: isLoadingReviews } = useGroupPeerReviews(
    groupId,
    isTripEnded
  );
  const submitReviewMutation = useSubmitPeerReview(groupId);

  const unreviewedCount = candidates.filter((c: PeerReviewCandidate) => !c.isReviewed).length;
  const completedCount = candidates.length - unreviewedCount;
  const progressPercent =
    candidates.length > 0 ? Math.round((completedCount / candidates.length) * 100) : 0;

  const handleOpenReviewModal = (candidate?: PeerReviewCandidate) => {
    if (candidate) {
      setSelectedCandidate(candidate);
    } else {
      const firstUnreviewed =
        candidates.find((c: PeerReviewCandidate) => !c.isReviewed) || candidates[0];
      if (firstUnreviewed) {
        setSelectedCandidate(firstUnreviewed);
      }
    }
  };

  if (!isTripEnded) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/60 p-12 text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-500/10 text-amber-500">
          <Lock className="h-8 w-8" />
        </div>
        <div className="max-w-md space-y-2">
          <h3 className="text-lg font-bold text-foreground">
            Đánh giá bạn đồng hành (Peer Review)
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Tính năng đánh giá sẽ tự động mở sau khi chuyến đi được chuyển sang trạng thái{' '}
            <span className="font-bold text-emerald-600 dark:text-emerald-400">Đã hoàn thành</span>.
          </p>
          <div className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-1.5 text-xs text-muted-foreground mt-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Đánh giá hoàn toàn ẩn danh nhằm xây dựng Điểm uy tín (Trust Score)
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* HEADER & PROGRESS CARD */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                <Star className="h-4 w-4 fill-amber-500" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Đánh giá bạn đồng hành</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Chấm điểm và nhận xét ẩn danh cho các thành viên đã cùng bạn đồng hành trong chuyến
              đi.
            </p>
          </div>

          {unreviewedCount > 0 && (
            <AppButton
              size="sm"
              onClick={() => handleOpenReviewModal()}
              className="flex items-center gap-2 shadow-xs shrink-0"
            >
              <Sparkles className="h-4 w-4" />
              <span>Chấm điểm ngay ({unreviewedCount} người)</span>
            </AppButton>
          )}
        </div>

        {/* PROGRESS BAR */}
        {candidates.length > 0 && (
          <div className="space-y-2 rounded-2xl bg-muted/30 p-4 border border-border/50">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">Tiến độ đánh giá của bạn</span>
              <span className="font-bold text-primary">
                {completedCount}/{candidates.length} người ({progressPercent}%)
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* CANDIDATES LIST */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Danh sách bạn đồng hành trong chuyến đi
          </h4>

          {isLoadingCandidates ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              Đang tải danh sách thành viên...
            </div>
          ) : candidates.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              Không tìm thấy thành viên nào khác trong đoàn.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {candidates.map((c: PeerReviewCandidate) => (
                <div
                  key={c.matchingMemberId}
                  className="flex items-center justify-between gap-3 p-3.5 rounded-2xl border border-border bg-muted/20 hover:bg-muted/40 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {c.avatarUrl ? (
                      <img
                        src={c.avatarUrl}
                        alt={c.fullName}
                        className="h-10 w-10 rounded-full object-cover shrink-0 ring-2 ring-background"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                        {c.fullName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{c.fullName}</p>
                      <p className="text-[10px] text-muted-foreground">{c.roleLabel}</p>
                    </div>
                  </div>

                  {c.isReviewed ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Đã chấm
                    </span>
                  ) : (
                    <AppButton
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenReviewModal(c)}
                      className="text-[11px] h-7 px-3 shrink-0"
                    >
                      Đánh giá
                    </AppButton>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MY RECEIVED REVIEWS (ANONYMOUS) */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h3 className="text-base font-bold text-foreground">
                Đánh giá bạn nhận được trong chuyến đi
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Các phản hồi và nhận xét ẩn danh mà các thành viên trong đoàn đã gửi cho bạn.
            </p>
          </div>

          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            {myReceivedReviews.length} lượt đánh giá
          </span>
        </div>

        {isLoadingReviews ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            Đang tải dữ liệu đánh giá...
          </div>
        ) : myReceivedReviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div className="max-w-xs space-y-1">
              <p className="text-xs font-semibold text-foreground">Chưa có đánh giá nào cho bạn</p>
              <p className="text-[11px] text-muted-foreground">
                Các đánh giá ẩn danh từ bạn đồng hành sẽ xuất hiện tại đây sau khi họ gửi nhận xét.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myReceivedReviews.map((review: PeerReviewItem) => (
              <div
                key={review.groupPeerReviewId}
                className="rounded-2xl border border-border bg-muted/15 p-4 space-y-3.5 hover:border-border/80 transition shadow-2xs"
              >
                {/* Header: Anonymous Reviewer Badge & Average Score */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs shrink-0">
                      <Lock className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground">Bạn đồng hành ẩn danh</p>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 shrink-0">
                    <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    <span>{review.averageRating?.toFixed(1) ?? '5.0'} / 5</span>
                  </div>
                </div>

                {/* 3 Criteria Ratings */}
                <div className="grid grid-cols-3 gap-2 rounded-xl bg-background/80 p-2.5 border border-border/40 text-center">
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
                      <Flame className="h-3 w-3 text-rose-500" />
                      <span>Thể lực</span>
                    </div>
                    <div className="flex items-center justify-center gap-0.5 text-xs font-bold text-amber-500">
                      <Star className="h-3 w-3 fill-amber-500" />
                      <span>{review.actualEnduranceRating}</span>
                    </div>
                  </div>

                  <div className="space-y-0.5 border-x border-border/40">
                    <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3 text-blue-500" />
                      <span>Đúng giờ</span>
                    </div>
                    <div className="flex items-center justify-center gap-0.5 text-xs font-bold text-amber-500">
                      <Star className="h-3 w-3 fill-amber-500" />
                      <span>{review.punctualityResponsibilityRating}</span>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
                      <Coins className="h-3 w-3 text-emerald-500" />
                      <span>Tài chính</span>
                    </div>
                    <div className="flex items-center justify-center gap-0.5 text-xs font-bold text-amber-500">
                      <Star className="h-3 w-3 fill-amber-500" />
                      <span>{review.financialFairnessRating}</span>
                    </div>
                  </div>
                </div>

                {/* Comment */}
                {review.comment ? (
                  <p className="text-xs text-foreground/90 bg-muted/40 p-2.5 rounded-xl italic leading-relaxed">
                    "{review.comment}"
                  </p>
                ) : (
                  <p className="text-[11px] text-muted-foreground italic">Không có nhận xét thêm</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TRUST SCORE & PRIVACY ASSURANCE CARD */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-2 border-b border-border pb-4">
          <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-base font-bold text-foreground">
            Cơ chế bảo mật & Điểm uy tín (Trust Score)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 space-y-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <Lock className="h-4 w-4" />
            </div>
            <h4 className="text-xs font-bold text-foreground">Ẩn danh 100%</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Người được chấm và các thành viên khác trong đoàn sẽ không bao giờ biết ai đã gửi đánh
              giá hay chấm bao nhiêu điểm.
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 space-y-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <Star className="h-4 w-4 fill-amber-500" />
            </div>
            <h4 className="text-xs font-bold text-foreground">Mặc định 100 Điểm (5.0⭐)</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Mỗi thành viên khởi tạo với 100 điểm uy tín. Đánh giá 5 sao giữ nguyên 100 điểm, đánh
              giá thấp hơn sẽ điều chỉnh điểm trung bình.
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 space-y-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <h4 className="text-xs font-bold text-foreground">3 Tiêu chí minh bạch</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Chấm điểm dựa trên 3 trụ cột: Thể lực thực tế, Đúng giờ & Trách nhiệm, và Tính minh
              bạch sòng phẳng tài chính.
            </p>
          </div>
        </div>
      </div>

      {/* REVIEW MODAL */}
      {selectedCandidate && (
        <GroupPeerReviewModal
          open={Boolean(selectedCandidate)}
          candidate={selectedCandidate}
          allCandidates={candidates}
          onClose={() => setSelectedCandidate(null)}
          onSelectCandidate={(c: PeerReviewCandidate) => setSelectedCandidate(c)}
          onSubmit={(payload: PeerReviewPayload) => {
            submitReviewMutation.mutate(payload);
          }}
          isSubmitting={submitReviewMutation.isPending}
        />
      )}
    </div>
  );
}
