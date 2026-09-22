import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { groupWorkspaceService } from '../services/groupWorkspaceService';
import type {
  CreateActivityPayload,
  CreateCheckpointPayload,
  UpdateActivityPayload,
  UpdateCheckpointPayload,
  UpdateCustomJourneyPayload,
} from '../types/workspace';
import { groupWorkspaceKeys } from './groupWorkspaceKeys';

export function useGroupJourney(groupId: string) {
  return useQuery({
    queryKey: groupWorkspaceKeys.journey(groupId),
    queryFn: () => groupWorkspaceService.getJourney(groupId),
    enabled: Boolean(groupId),
    staleTime: 60 * 1000,
  });
}

export function useGroupCheckpoints(groupId: string) {
  return useQuery({
    queryKey: groupWorkspaceKeys.checkpoints(groupId),
    queryFn: () => groupWorkspaceService.getCheckpoints(groupId),
    enabled: Boolean(groupId),
    staleTime: 30 * 1000,
  });
}

export function useGroupJourneyActivities(groupId: string) {
  return useQuery({
    queryKey: groupWorkspaceKeys.activities(groupId),
    queryFn: () => groupWorkspaceService.getJourneyActivities(groupId),
    enabled: Boolean(groupId),
    staleTime: 30 * 1000,
  });
}

export function useUpdateGroupJourney(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateCustomJourneyPayload) =>
      groupWorkspaceService.updateJourney(groupId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.journey(groupId) });
    },
  });
}

export function useCreateGroupCheckpoint(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCheckpointPayload) =>
      groupWorkspaceService.createCheckpoint(groupId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.checkpoints(groupId) });
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.journey(groupId) });
    },
  });
}

export function useUpdateGroupCheckpoint(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      checkpointId,
      payload,
    }: {
      checkpointId: string;
      payload: UpdateCheckpointPayload;
    }) => groupWorkspaceService.updateCheckpoint(groupId, checkpointId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.checkpoints(groupId) });
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.journey(groupId) });
    },
  });
}

export function useDeleteGroupCheckpoint(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (checkpointId: string) =>
      groupWorkspaceService.deleteCheckpoint(groupId, checkpointId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.checkpoints(groupId) });
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.journey(groupId) });
    },
  });
}

export function useSwapGroupCheckpoints(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      checkpointId,
      targetCheckpointId,
    }: {
      checkpointId: string;
      targetCheckpointId: string;
    }) => groupWorkspaceService.swapCheckpoints(groupId, checkpointId, targetCheckpointId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.checkpoints(groupId) });
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.journey(groupId) });
    },
  });
}

export function useUpdateCheckpointProgress(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      checkpointId,
      status,
    }: {
      checkpointId: string;
      status: 'CHECKED_IN' | 'SKIPPED';
    }) => groupWorkspaceService.updateCheckpointProgress(groupId, checkpointId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.checkpoints(groupId) });
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.journey(groupId) });
    },
  });
}

export function useResetCheckpointProgress(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (checkpointId: string) =>
      groupWorkspaceService.resetCheckpointProgress(groupId, checkpointId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.checkpoints(groupId) });
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.journey(groupId) });
    },
  });
}

export function useCreateGroupJourneyActivity(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateActivityPayload) =>
      groupWorkspaceService.createJourneyActivity(groupId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.activities(groupId) });
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.journey(groupId) });
    },
  });
}

export function useUpdateGroupJourneyActivity(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ activityId, payload }: { activityId: string; payload: UpdateActivityPayload }) =>
      groupWorkspaceService.updateJourneyActivity(groupId, activityId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.activities(groupId) });
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.journey(groupId) });
    },
  });
}

export function useDeleteGroupJourneyActivity(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (activityId: string) =>
      groupWorkspaceService.deleteJourneyActivity(groupId, activityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.activities(groupId) });
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.journey(groupId) });
    },
  });
}
