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

/** Hook đọc thông tin Custom Journey của nhóm */
export function useGroupJourney(groupId: string) {
  return useQuery({
    queryKey: groupWorkspaceKeys.journey(groupId),
    queryFn: () => groupWorkspaceService.getJourney(groupId),
    enabled: Boolean(groupId),
    staleTime: 60 * 1000,
  });
}

/** Hook đọc danh sách Checkpoints của nhóm */
export function useGroupCheckpoints(groupId: string) {
  return useQuery({
    queryKey: groupWorkspaceKeys.checkpoints(groupId),
    queryFn: () => groupWorkspaceService.getCheckpoints(groupId),
    enabled: Boolean(groupId),
    staleTime: 30 * 1000,
  });
}

/** Hook đọc danh sách Activities trong thời khóa biểu của nhóm */
export function useGroupJourneyActivities(groupId: string) {
  return useQuery({
    queryKey: groupWorkspaceKeys.activities(groupId),
    queryFn: () => groupWorkspaceService.getJourneyActivities(groupId),
    enabled: Boolean(groupId),
    staleTime: 30 * 1000,
  });
}

/** Hook cập nhật Custom Journey tổng thể (Title, Itinerary Days, Description, Budget...) */
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

/** Hook tạo mới Checkpoint */
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

/** Hook cập nhật Checkpoint */
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

/** Hook xóa Checkpoint */
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

/** Hook tạo mới Hoạt động trong thời khóa biểu */
export function useCreateGroupJourneyActivity(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateActivityPayload) =>
      groupWorkspaceService.createJourneyActivity(groupId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.activities(groupId) });
    },
  });
}

/** Hook cập nhật Hoạt động trong thời khóa biểu */
export function useUpdateGroupJourneyActivity(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ activityId, payload }: { activityId: string; payload: UpdateActivityPayload }) =>
      groupWorkspaceService.updateJourneyActivity(groupId, activityId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.activities(groupId) });
    },
  });
}

/** Hook xóa Hoạt động trong thời khóa biểu */
export function useDeleteGroupJourneyActivity(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (activityId: string) =>
      groupWorkspaceService.deleteJourneyActivity(groupId, activityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.activities(groupId) });
    },
  });
}
