import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorTourService } from '../services/vendorTourService';
import type { CheckpointSubmitItem, CreateTourPayload, UpdateTourPayload } from '../types';
import { vendorTourCheckpointsKeys } from './useVendorTourCheckpoints';
import { vendorTourDetailKeys } from './useVendorTourDetail';
import { vendorTourKeys } from './useVendorTourList';
import { vendorTourStatsKeys } from './useVendorTourStats';

export function useVendorTourMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: vendorTourKeys.all });
    queryClient.invalidateQueries({ queryKey: vendorTourStatsKeys.all });
  };

  const createTourWithCheckpoints = useMutation({
    mutationFn: async ({
      tour,
      checkpoints,
    }: {
      tour: CreateTourPayload;
      checkpoints: CheckpointSubmitItem[];
    }) => {
      const created = await vendorTourService.createTour(tour);

      for (const checkpoint of checkpoints) {
        await vendorTourService.createCheckpoint(created.id, checkpoint.payload);
      }
      return created;
    },
    onSuccess: invalidate,
  });

  const updateTour = useMutation({
    mutationFn: ({ tourId, tour }: { tourId: string; tour: UpdateTourPayload }) =>
      vendorTourService.updateTour(tourId, tour),
    onSuccess: (_data, variables) => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: vendorTourDetailKeys.detail(variables.tourId) });
    },
  });

  const updateTourWithCheckpoints = useMutation({
    mutationFn: async ({
      tourId,
      tour,
      checkpoints,
      deletedCheckpointIds,
    }: {
      tourId: string;
      tour: UpdateTourPayload;
      checkpoints: CheckpointSubmitItem[];
      deletedCheckpointIds: string[];
    }) => {
      // Sync checkpoints to their final state BEFORE updating the tour itself.
      // A PUBLISHED tour's structural validation (>=2 checkpoints, etc.) runs
      // as part of the tour-update call and reads whatever is already
      // persisted — if that call ran first, adding checkpoints to fix a
      // previously-deficient tour would still fail against the stale count.
      for (const checkpoint of checkpoints) {
        if (checkpoint.checkpointId) {
          await vendorTourService.updateCheckpoint(checkpoint.checkpointId, checkpoint.payload);
        } else {
          await vendorTourService.createCheckpoint(tourId, checkpoint.payload);
        }
      }

      for (const checkpointId of deletedCheckpointIds) {
        await vendorTourService.deleteCheckpoint(checkpointId);
      }

      return await vendorTourService.updateTour(tourId, tour);
    },
    onSuccess: (_data, variables) => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: vendorTourDetailKeys.detail(variables.tourId) });
      queryClient.invalidateQueries({ queryKey: vendorTourCheckpointsKeys.list(variables.tourId) });
    },
  });

  const deleteTour = useMutation({
    mutationFn: (tourId: string) => vendorTourService.deleteTour(tourId),
    onSuccess: invalidate,
  });

  const publishTour = useMutation({
    mutationFn: (tourId: string) => vendorTourService.publishTour(tourId),
    onSuccess: (_data, tourId) => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: vendorTourDetailKeys.detail(tourId) });
    },
  });

  const unpublishTour = useMutation({
    mutationFn: (tourId: string) => vendorTourService.unpublishTour(tourId),
    onSuccess: (_data, tourId) => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: vendorTourDetailKeys.detail(tourId) });
    },
  });

  const restoreTour = useMutation({
    mutationFn: (tourId: string) => vendorTourService.restoreTour(tourId),
    onSuccess: (_data, tourId) => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: vendorTourDetailKeys.detail(tourId) });
    },
  });

  return {
    createTourWithCheckpoints,
    updateTour,
    updateTourWithCheckpoints,
    deleteTour,
    publishTour,
    unpublishTour,
    restoreTour,
  };
}
