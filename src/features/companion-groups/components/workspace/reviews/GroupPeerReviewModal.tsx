import { CheckCircle2, ChevronRight, Lock, ShieldCheck, X } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { AppAvatar, AppButton, AppModalShell } from '@/shared/ui';
import type { PeerReviewCandidate, PeerReviewPayload } from '../../../services/peerReviewService';
import { PeerReviewCandidateNav } from './PeerReviewCandidateNav';
import { PeerReviewStarInput } from './PeerReviewStarInput';

interface GroupPeerReviewModalProps {
  open: boolean;
  onClose: () => void;
  candidate: PeerReviewCandidate;
  allCandidates: PeerReviewCandidate[];
  isSubmitting: boolean;
  onSelectCandidate: (candidate: PeerReviewCandidate) => void;
  /** Trả về Promise để modal chỉ đóng / chuyển người khi lưu thành công. */
  onSubmit: (payload: PeerReviewPayload) => Promise<unknown>;
}

/**
 * Form chấm điểm ẩn danh cho một bạn đồng hành.
 *
 * Mỗi thành viên chỉ được chấm MỘT lần: khi `candidate.isReviewed` thì modal hiển thị
 * trạng thái "đã đánh giá" thay vì form, tránh gửi trùng (BE sẽ trả lỗi).
 * Component được remount theo `key = matchingMemberId` nên state sao/nhận xét tự reset khi đổi người.
 */
export function GroupPeerReviewModal({
  open,
  onClose,
  candidate,
  allCandidates,
  isSubmitting,
  onSelectCandidate,
  onSubmit,
}: GroupPeerReviewModalProps) {
  const [endurance, setEndurance] = useState(5);
  const [punctuality, setPunctuality] = useState(5);
  const [finance, setFinance] = useState(5);
  const [comment, setComment] = useState('');

  const nextUnreviewed = allCandidates.find(
    (item) => item.matchingMemberId !== candidate.matchingMemberId && !item.isReviewed
  );

  const buildPayload = (): PeerReviewPayload => ({
    revieweeMemberId: candidate.matchingMemberId,
    revieweeUserId: candidate.userId,
    actualEnduranceRating: endurance,
    punctualityResponsibilityRating: punctuality,
    financialFairnessRating: finance,
    comment: comment.trim() || undefined,
  });

  const submit = async (goNext: boolean) => {
    try {
      await onSubmit(buildPayload());
      if (goNext && nextUnreviewed) {
        onSelectCandidate(nextUnreviewed);
        return;
      }
      onClose();
    } catch {
      // Lỗi đã hiển thị qua toast — giữ form để người dùng thử lại.
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void submit(false);
  };

  const header = (
    <div className="flex items-start justify-between gap-3 border-border border-b pb-3">
      <div className="flex min-w-0 items-center gap-3">
        <AppAvatar name={candidate.fullName} src={candidate.avatarUrl} size="md" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-base text-foreground">
              Đánh giá thành viên: {candidate.fullName}
            </h3>
            <span className="rounded-md border border-border bg-muted px-2 py-0.5 font-semibold text-[11px] text-muted-foreground">
              {candidate.roleLabel}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-bold text-[10px] text-emerald-600 dark:text-emerald-400">
              <Lock className="h-2.5 w-2.5" /> Ẩn danh 100%
            </span>
          </div>
          <p className="mt-0.5 text-muted-foreground text-xs">
            Đánh giá được ẩn danh hoàn toàn để đảm bảo tính khách quan và bảo vệ quyền riêng tư.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Đóng cửa sổ"
        className="cursor-pointer rounded-lg border-0 bg-transparent p-1.5 text-muted-foreground transition hover:bg-muted"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );

  return (
    <AppModalShell
      open={open}
      onClose={onClose}
      className="max-w-xl"
      aria-label={`Đánh giá bạn đồng hành: ${candidate.fullName}`}
    >
      <div className="space-y-5">
        <PeerReviewCandidateNav
          candidates={allCandidates}
          activeCandidateId={candidate.matchingMemberId}
          onSelect={onSelectCandidate}
        />

        {header}

        {candidate.isReviewed ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              <p className="font-bold text-foreground text-sm">
                Bạn đã đánh giá {candidate.fullName}
              </p>
              <p className="max-w-sm text-muted-foreground text-xs">
                Mỗi bạn đồng hành chỉ được chấm điểm một lần trong chuyến đi để đảm bảo Điểm uy tín
                khách quan.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 border-border border-t pt-3">
              <AppButton variant="outline" size="sm" type="button" onClick={onClose}>
                Đóng
              </AppButton>
              {nextUnreviewed && (
                <AppButton
                  size="sm"
                  type="button"
                  onClick={() => onSelectCandidate(nextUnreviewed)}
                  className="flex items-center gap-1"
                >
                  <span>Chấm tiếp {nextUnreviewed.fullName}</span>
                  <ChevronRight className="h-4 w-4" />
                </AppButton>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <fieldset className="space-y-4 rounded-xl border border-border/80 bg-muted/20 p-4">
              <legend className="font-bold text-muted-foreground text-xs uppercase tracking-wider">
                Tiêu chí đánh giá bắt buộc (1 - 5 sao)
              </legend>

              <PeerReviewStarInput
                label="1. Thể lực thực tế"
                hint="Theo kịp tốc độ đoàn & khả năng tự tải đồ / hỗ trợ"
                value={endurance}
                onChange={setEndurance}
              />
              <div className="border-border/40 border-t pt-3">
                <PeerReviewStarInput
                  label="2. Đúng giờ & Trách nhiệm"
                  hint="Tuân thủ thời gian tập trung & lịch trình chung"
                  value={punctuality}
                  onChange={setPunctuality}
                />
              </div>
              <div className="border-border/40 border-t pt-3">
                <PeerReviewStarInput
                  label="3. Minh bạch tài chính"
                  hint="Sòng phẳng chi phí cá nhân & đóng góp tiền quỹ"
                  value={finance}
                  onChange={setFinance}
                />
              </div>
            </fieldset>

            <label className="block space-y-1.5">
              <span className="block font-bold text-foreground text-xs">
                Nhận xét chi tiết (tùy chọn)
              </span>
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Chia sẻ trải nghiệm đồng hành cùng thành viên này trong chuyến đi..."
                rows={3}
                className="w-full rounded-xl border border-border bg-background p-3 text-foreground text-xs leading-relaxed placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
              />
            </label>

            <div className="flex items-center gap-2.5 rounded-xl border border-primary/30 bg-primary/5 p-3">
              <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
              <p className="text-[11px] text-muted-foreground">
                Điểm bạn chấm sẽ cập nhật vào Điểm uy tín (Trust Score) của {candidate.fullName} và
                <span className="font-semibold text-foreground"> không thể sửa lại</span> sau khi
                lưu.
              </p>
            </div>

            <div className="flex items-center justify-between gap-2 border-border border-t pt-3">
              <AppButton
                variant="outline"
                size="sm"
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Hủy
              </AppButton>

              <div className="flex items-center gap-2">
                <AppButton variant="outline" size="sm" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Đang lưu...' : 'Lưu đánh giá này'}
                </AppButton>

                {nextUnreviewed && (
                  <AppButton
                    size="sm"
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => void submit(true)}
                    className="flex items-center gap-1"
                  >
                    <span>Lưu & chấm tiếp</span>
                    <ChevronRight className="h-4 w-4" />
                  </AppButton>
                )}
              </div>
            </div>
          </form>
        )}
      </div>
    </AppModalShell>
  );
}
