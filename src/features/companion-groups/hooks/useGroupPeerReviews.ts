import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profileKeys } from '@/features/profile/hooks/useProfile';
import { toast } from '@/store/useToastStore';
import {
  type PeerReviewCandidate,
  type PeerReviewItem,
  type PeerReviewPayload,
  peerReviewService,
} from '../services/peerReviewService';

export const peerReviewKeys = {
  all: ['group-peer-reviews'] as const,
  candidates: (groupId: string) => [...peerReviewKeys.all, 'candidates', groupId] as const,
  list: (groupId: string) => [...peerReviewKeys.all, 'list', groupId] as const,
  userReviews: (userId: string) => [...peerReviewKeys.all, 'user', userId] as const,
};

export function usePeerReviewCandidates(groupId: string, enabled = true) {
  return useQuery<PeerReviewCandidate[], Error>({
    queryKey: peerReviewKeys.candidates(groupId),
    queryFn: () => peerReviewService.getPeerReviewCandidates(groupId),
    enabled: Boolean(groupId) && enabled,
    staleTime: 30 * 1000,
  });
}

export function useGroupPeerReviews(groupId: string, enabled = true) {
  return useQuery<PeerReviewItem[], Error>({
    queryKey: peerReviewKeys.list(groupId),
    queryFn: () => peerReviewService.getGroupPeerReviews(groupId),
    enabled: Boolean(groupId) && enabled,
    staleTime: 60 * 1000,
  });
}

export function useUserPeerReviews(userId?: string, enabled = true) {
  return useQuery<PeerReviewItem[], Error>({
    queryKey: peerReviewKeys.userReviews(userId || ''),
    queryFn: () => (userId ? peerReviewService.getUserPeerReviews(userId) : Promise.resolve([])),
    enabled: Boolean(userId) && enabled,
    staleTime: 30 * 1000,
  });
}

function isSubmittedCandidate(candidate: PeerReviewCandidate, payload: PeerReviewPayload): boolean {
  if (payload.revieweeMemberId) return candidate.matchingMemberId === payload.revieweeMemberId;
  return Boolean(payload.revieweeUserId) && candidate.userId === payload.revieweeUserId;
}

export function useSubmitPeerReview(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PeerReviewPayload) =>
      peerReviewService.submitPeerReview(groupId, payload),
    onSuccess: (_review, payload) => {
      toast.success('Đã lưu đánh giá bạn đồng hành thành công!');

      queryClient.setQueryData<PeerReviewCandidate[]>(
        peerReviewKeys.candidates(groupId),
        (candidates) =>
          candidates?.map((candidate) =>
            isSubmittedCandidate(candidate, payload)
              ? { ...candidate, isReviewed: true }
              : candidate
          )
      );

      queryClient.invalidateQueries({ queryKey: peerReviewKeys.candidates(groupId) });
      queryClient.invalidateQueries({ queryKey: peerReviewKeys.list(groupId) });

      if (payload.revieweeUserId) {
        queryClient.invalidateQueries({
          queryKey: peerReviewKeys.userReviews(payload.revieweeUserId),
        });

        queryClient.invalidateQueries({ queryKey: profileKeys.detail(payload.revieweeUserId) });
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Gửi đánh giá thất bại. Vui lòng thử lại.');
    },
  });
}
