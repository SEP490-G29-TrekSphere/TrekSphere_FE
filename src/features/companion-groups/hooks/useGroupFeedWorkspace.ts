import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { groupWorkspaceService } from '../services/groupWorkspaceService';
import type {
  CreateGroupPostCommentPayload,
  CreateGroupPostPayload,
  GroupPostFilterParams,
  UpdateGroupPostCommentPayload,
  UpdateGroupPostPayload,
} from '../types/workspace';
import { groupWorkspaceKeys } from './groupWorkspaceKeys';

export function useGroupPosts(groupId: string, filter?: GroupPostFilterParams) {
  return useQuery({
    queryKey: [...groupWorkspaceKeys.posts(groupId), filter],
    queryFn: () => groupWorkspaceService.getGroupPosts(groupId, filter),
    enabled: Boolean(groupId),
    staleTime: 5 * 1000,
    refetchInterval: 10 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: 'always',
  });
}

export function useGroupPostDetail(groupId: string, postId: string) {
  return useQuery({
    queryKey: groupWorkspaceKeys.postDetail(groupId, postId),
    queryFn: () => groupWorkspaceService.getGroupPostDetail(groupId, postId),
    enabled: Boolean(groupId) && Boolean(postId),
    staleTime: 5 * 1000,
    refetchInterval: 10 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: 'always',
  });
}

export function useCreateGroupPost(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateGroupPostPayload) =>
      groupWorkspaceService.createGroupPost(groupId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.posts(groupId) });
    },
  });
}

export function useUpdateGroupPost(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, payload }: { postId: string; payload: UpdateGroupPostPayload }) =>
      groupWorkspaceService.updateGroupPost(groupId, postId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.posts(groupId) });
      queryClient.invalidateQueries({
        queryKey: groupWorkspaceKeys.postDetail(groupId, variables.postId),
      });
    },
  });
}

export function useTogglePinGroupPost(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => groupWorkspaceService.togglePinGroupPost(groupId, postId),
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.posts(groupId) });
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.postDetail(groupId, postId) });
    },
  });
}

export function useDeleteGroupPost(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => groupWorkspaceService.deleteGroupPost(groupId, postId),
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.posts(groupId) });
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.postDetail(groupId, postId) });
    },
  });
}

export function useToggleHideGroupPost(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => groupWorkspaceService.toggleHideGroupPost(groupId, postId),
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.posts(groupId) });
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.postDetail(groupId, postId) });
    },
  });
}

export function useCreateGroupComment(groupId: string, postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateGroupPostCommentPayload) =>
      groupWorkspaceService.createComment(groupId, postId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.postDetail(groupId, postId) });
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.posts(groupId) });
    },
  });
}

export function useUpdateGroupComment(groupId: string, postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      payload,
    }: {
      commentId: string;
      payload: UpdateGroupPostCommentPayload;
    }) => groupWorkspaceService.updateComment(groupId, postId, commentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.postDetail(groupId, postId) });
    },
  });
}

export function useDeleteGroupComment(groupId: string, postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) =>
      groupWorkspaceService.deleteComment(groupId, postId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.postDetail(groupId, postId) });
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.posts(groupId) });
    },
  });
}

export function useToggleHideGroupComment(groupId: string, postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) =>
      groupWorkspaceService.toggleHideComment(groupId, postId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.postDetail(groupId, postId) });
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.posts(groupId) });
    },
  });
}
