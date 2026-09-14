import { Lock, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import {
  useGroupPeerReviews,
  usePeerReviewCandidates,
  useSubmitPeerReview,
} from '../../../hooks/useGroupPeerReviews';
import type { PeerReviewCandidate } from '../../../services/peerReviewService';
import { GroupPeerReviewList } from './GroupPeerReviewList';
import { GroupPeerReviewModal } from './GroupPeerReviewModal';
import { PeerReviewProgressCard } from './PeerReviewProgressCard';
import { PeerReviewTrustInfoCard } from './PeerReviewTrustInfoCard';

interface GroupPeerReviewsTabProps {
  groupId: string;
  isTripEnded: boolean;
}

/** Tab "Đánh giá" trong workspace nhóm ghép — chỉ mở sau khi chuyến đi hoàn thành. */
export function GroupPeerReviewsTab({ groupId, isTripEnded }: GroupPeerReviewsTabProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<PeerReviewCandidate | null>(null);

  const { data: candidates = [], isLoading: isLoadingCandidates } = usePeerReviewCandidates(
    groupId,
    isTripEnded
  );
  const { data: reviews = [], isLoading: isLoadingReviews } = useGroupPeerReviews(
    groupId,
    isTripEnded
  );
  const submitReviewMutation = useSubmitPeerReview(groupId);

  // Ứng viên trong modal phải lấy lại từ cache mới nhất, nếu giữ bản chụp lúc mở modal
  // thì sau khi chấm xong trạng thái "đã đánh giá" không được phản ánh.
  const activeCandidate = selectedCandidate
    ? (candidates.find(
        (candidate) => candidate.matchingMemberId === selectedCandidate.matchingMemberId
      ) ?? selectedCandidate)
    : null;

  if (!isTripEnded) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 rounded-3xl border border-border border-dashed bg-card/60 p-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-500/10 text-amber-500">
          <Lock className="h-8 w-8" />
        </div>
        <div className="max-w-md space-y-2">
          <h3 className="font-bold text-foreground text-lg">
            Đánh giá bạn đồng hành (Peer Review)
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Tính năng đánh giá sẽ tự động mở sau khi chuyến đi được chuyển sang trạng thái{' '}
            <span className="font-bold text-emerald-600 dark:text-emerald-400">Đã hoàn thành</span>.
          </p>
          <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-muted px-4 py-1.5 text-muted-foreground text-xs">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Đánh giá hoàn toàn ẩn danh nhằm xây dựng Điểm uy tín (Trust Score)
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PeerReviewProgressCard
        candidates={candidates}
        isLoading={isLoadingCandidates}
        onReview={setSelectedCandidate}
      />

      <GroupPeerReviewList reviews={reviews} isLoading={isLoadingReviews} />

      <PeerReviewTrustInfoCard />

      {activeCandidate && (
        <GroupPeerReviewModal
          key={activeCandidate.matchingMemberId}
          open
          candidate={activeCandidate}
          allCandidates={candidates}
          isSubmitting={submitReviewMutation.isPending}
          onClose={() => setSelectedCandidate(null)}
          onSelectCandidate={setSelectedCandidate}
          onSubmit={(payload) => submitReviewMutation.mutateAsync(payload)}
        />
      )}
    </div>
  );
}
