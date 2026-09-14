import { CheckCircle2, ChevronRight, Lock, ShieldCheck, Star, UserCheck, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { AppButton, AppModalShell } from '@/shared/ui';
import type { PeerReviewCandidate, PeerReviewPayload } from '../../../services/peerReviewService';

interface GroupPeerReviewModalProps {
  open: boolean;
  onClose: () => void;
  candidate: PeerReviewCandidate;
  allCandidates: PeerReviewCandidate[];
  onSubmit: (payload: PeerReviewPayload) => void;
  isSubmitting: boolean;
  onSelectCandidate: (candidate: PeerReviewCandidate) => void;
}

const SCORE_LABELS: Record<number, string> = {
  5: 'Xuất sắc',
  4: 'Tốt',
  3: 'Đạt yêu cầu',
  2: 'Cần cải thiện',
  1: 'Kém',
};

export function GroupPeerReviewModal({
  open,
  onClose,
  candidate,
  allCandidates,
  onSubmit,
  isSubmitting,
  onSelectCandidate,
}: GroupPeerReviewModalProps) {
  const [endurance, setEndurance] = useState(5);
  const [punctuality, setPunctuality] = useState(5);
  const [finance, setFinance] = useState(5);
  const [comment, setComment] = useState('');

  const reviewedCount = allCandidates.filter((c) => c.isReviewed).length;
  const nextUnreviewed = allCandidates.find(
    (c) => c.matchingMemberId !== candidate.matchingMemberId && !c.isReviewed
  );

  const calculateTrustBonus = () => {
    const avg = (endurance + punctuality + finance) / 3;
    if (avg >= 4.5) return '+2.5 điểm';
    if (avg >= 3.5) return '+1.5 điểm';
    if (avg >= 2.5) return '+0.5 điểm';
    return '0 điểm';
  };

  const buildPayload = (): PeerReviewPayload => {
    return {
      revieweeMemberId: candidate.matchingMemberId,
      revieweeUserId: candidate.userId,
      actualEnduranceRating: endurance,
      punctualityResponsibilityRating: punctuality,
      financialFairnessRating: finance,
      comment: comment.trim() || undefined,
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(buildPayload());
    onClose();
  };

  const handleSubmitAndNext = (e: React.MouseEvent) => {
    e.preventDefault();
    onSubmit(buildPayload());
    if (nextUnreviewed) {
      onSelectCandidate(nextUnreviewed);
      // Reset form for next candidate
      setEndurance(5);
      setPunctuality(5);
      setFinance(5);
      setComment('');
    } else {
      onClose();
    }
  };

  const renderStarRating = (score: number, setScore: (val: number) => void) => {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setScore(star)}
              className="p-0.5 transition hover:scale-110 cursor-pointer border-0 bg-transparent"
              aria-label={`${star} sao`}
            >
              <Star
                className={cn(
                  'h-5 w-5 transition-colors',
                  star <= score ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/30'
                )}
              />
            </button>
          ))}
        </div>
        <span className="text-xs font-semibold text-primary min-w-[75px] text-right">
          {SCORE_LABELS[score]}
        </span>
      </div>
    );
  };

  return (
    <AppModalShell
      open={open}
      onClose={onClose}
      className="max-w-xl"
      aria-label={`Đánh giá bạn đồng hành: ${candidate.fullName}`}
    >
      <div className="space-y-5">
        {/* CANDIDATE NAVIGATOR BAR */}
        {allCandidates.length > 1 && (
          <div className="rounded-xl border border-border/80 bg-muted/30 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <UserCheck className="h-3.5 w-3.5 text-primary" />
                Danh sách đánh giá thành viên
              </span>
              <span className="text-[11px] font-medium text-muted-foreground bg-background px-2 py-0.5 rounded-full border border-border">
                Đã hoàn thành {reviewedCount}/{allCandidates.length}
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {allCandidates.map((c) => {
                const isCurrent = c.matchingMemberId === candidate.matchingMemberId;
                return (
                  <button
                    key={c.matchingMemberId}
                    type="button"
                    onClick={() => {
                      onSelectCandidate(c);
                      setEndurance(5);
                      setPunctuality(5);
                      setFinance(5);
                      setComment('');
                    }}
                    className={cn(
                      'flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition cursor-pointer shrink-0 border',
                      isCurrent
                        ? 'border-primary bg-primary/10 text-primary font-bold shadow-2xs'
                        : c.isReviewed
                          ? 'border-border bg-muted text-foreground font-medium'
                          : 'border-border bg-background text-muted-foreground hover:bg-muted'
                    )}
                  >
                    {c.avatarUrl ? (
                      <img
                        src={c.avatarUrl}
                        alt={c.fullName}
                        className="h-5 w-5 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold bg-secondary text-secondary-foreground">
                        {c.fullName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span>{c.fullName}</span>
                    {c.isReviewed && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-3">
            {candidate.avatarUrl ? (
              <img
                src={candidate.avatarUrl}
                alt={candidate.fullName}
                className="h-11 w-11 rounded-xl object-cover shadow-sm"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-xl font-bold text-base shadow-sm bg-secondary text-secondary-foreground">
                {candidate.fullName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-foreground">
                  Đánh giá thành viên: {candidate.fullName}
                </h3>
                <span className="text-[11px] font-semibold bg-muted px-2 py-0.5 rounded-md text-muted-foreground border border-border">
                  {candidate.roleLabel}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <Lock className="h-2.5 w-2.5" /> Ẩn danh 100%
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Đánh giá được ẩn danh hoàn toàn để đảm bảo tính khách quan và bảo vệ quyền riêng tư.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition cursor-pointer border-0 bg-transparent"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 3 CRITERIA SECTION */}
          <div className="space-y-4 rounded-xl border border-border/80 bg-muted/20 p-4">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider text-muted-foreground">
              Tiêu chí đánh giá bắt buộc (1 - 5 sao)
            </h4>

            {/* 1. Endurance */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-foreground block">1. Thể lực thực tế</span>
                <span className="text-[11px] text-muted-foreground block">
                  Theo kịp tốc độ đoàn & khả năng tự tải đồ / hỗ trợ
                </span>
              </div>
              {renderStarRating(endurance, setEndurance)}
            </div>

            {/* 2. Punctuality & Responsibility */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-border/40 pt-3">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-foreground block">
                  2. Đúng giờ & Trách nhiệm
                </span>
                <span className="text-[11px] text-muted-foreground block">
                  Tuân thủ thời gian tập trung & lịch trình chung
                </span>
              </div>
              {renderStarRating(punctuality, setPunctuality)}
            </div>

            {/* 3. Financial Fairness */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-border/40 pt-3">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-foreground block">
                  3. Minh bạch tài chính
                </span>
                <span className="text-[11px] text-muted-foreground block">
                  Sòng phẳng chi phí cá nhân & đóng góp tiền quỹ
                </span>
              </div>
              {renderStarRating(finance, setFinance)}
            </div>
          </div>

          {/* COMMENT TEXTAREA */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">
              Nhận xét chi tiết (tùy chọn)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm đồng hành cùng thành viên này trong chuyến đi..."
              rows={3}
              className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary leading-relaxed"
            />
          </div>

          {/* TRUST SCORE IMPACT PREVIEW BOX */}
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
              <div>
                <span className="text-xs font-bold text-primary block">
                  Dự kiến tác động Trust Score: {calculateTrustBonus()}
                </span>
                <span className="text-[11px] text-muted-foreground block">
                  Đánh giá từ bạn góp phần cập nhật chỉ số uy tín cộng đồng cho {candidate.fullName}
                </span>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center justify-between pt-3 border-t border-border gap-2">
            <AppButton variant="outline" size="sm" type="button" onClick={onClose}>
              Hủy
            </AppButton>

            <div className="flex items-center gap-2">
              <AppButton variant="outline" size="sm" type="submit" disabled={isSubmitting}>
                Lưu đánh giá này
              </AppButton>

              {nextUnreviewed && (
                <AppButton
                  size="sm"
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmitAndNext}
                  className="flex items-center gap-1"
                >
                  <span>Chấm tiếp {nextUnreviewed.fullName}</span>
                  <ChevronRight className="h-4 w-4" />
                </AppButton>
              )}
            </div>
          </div>
        </form>
      </div>
    </AppModalShell>
  );
}
