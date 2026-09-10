import { AlertCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from '@/store/useToastStore';
import {
  useDeleteGroupCheckpoint,
  useDeleteGroupJourneyActivity,
  useGroupCheckpoints,
  useGroupJourney,
  useGroupJourneyActivities,
} from '../../../hooks/useGroupJourneyWorkspace';
import type {
  CustomJourneyActivityResponse,
  CustomJourneyCheckpointResponse,
  TimeSlot,
} from '../../../types/workspace';
import { ActivityTimetableSection } from './ActivityTimetableSection';
import { AddActivityModal } from './AddActivityModal';
import { AddCheckpointModal } from './AddCheckpointModal';
import { CheckpointListSection } from './CheckpointListSection';
import { DeleteActivityConfirmModal } from './DeleteActivityConfirmModal';
import { DeleteCheckpointConfirmModal } from './DeleteCheckpointConfirmModal';
import { EditActivityModal } from './EditActivityModal';
import { EditCheckpointModal } from './EditCheckpointModal';
import { EditJourneyModal } from './EditJourneyModal';
import { JourneyHeaderCard } from './JourneyHeaderCard';
import { ViewCheckpointModal } from './ViewCheckpointModal';

interface GroupJourneyTabProps {
  groupId: string;
  isLeader: boolean;
}

function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function GroupJourneyTab({ groupId, isLeader }: GroupJourneyTabProps) {
  const {
    data: journey,
    isLoading: isJourneyLoading,
    error: journeyError,
  } = useGroupJourney(groupId);

  const {
    data: checkpoints = [],
    isLoading: isCheckpointsLoading,
    error: checkpointsError,
  } = useGroupCheckpoints(groupId);

  const {
    data: activities = [],
    isLoading: isActivitiesLoading,
    error: activitiesError,
  } = useGroupJourneyActivities(groupId);

  const deleteCheckpointMutation = useDeleteGroupCheckpoint(groupId);
  const deleteActivityMutation = useDeleteGroupJourneyActivity(groupId);

  // Checkpoint Modal States
  const [isAddCheckpointModalOpen, setIsAddCheckpointModalOpen] = useState(false);
  const [isEditJourneyModalOpen, setIsEditJourneyModalOpen] = useState(false);
  const [editingCheckpoint, setEditingCheckpoint] =
    useState<CustomJourneyCheckpointResponse | null>(null);
  const [deletingCheckpoint, setDeletingCheckpoint] =
    useState<CustomJourneyCheckpointResponse | null>(null);
  const [viewingCheckpoint, setViewingCheckpoint] =
    useState<CustomJourneyCheckpointResponse | null>(null);

  // Activity Modal States
  const [isAddActivityModalOpen, setIsAddActivityModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot>('MORNING');
  const [editingActivity, setEditingActivity] = useState<CustomJourneyActivityResponse | null>(
    null
  );
  const [deletingActivity, setDeletingActivity] = useState<CustomJourneyActivityResponse | null>(
    null
  );

  const isLocked = Boolean(journey?.isLocked);
  const canEdit = isLeader && !isLocked;

  // Sắp xếp checkpoints theo thứ tự chặng
  const sortedCheckpoints = useMemo(() => {
    return [...checkpoints].sort((a, b) => (a.checkpointOrder ?? 0) - (b.checkpointOrder ?? 0));
  }, [checkpoints]);

  // Tổng số ngày của hành trình tính từ startDate -> endDate
  const totalJourneyDays = useMemo(() => {
    if (journey?.startDate && journey?.endDate) {
      const start = parseLocalDate(journey.startDate);
      const end = parseLocalDate(journey.endDate);
      const diffTime = end.getTime() - start.getTime();
      return Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1);
    }
    return 1;
  }, [journey?.startDate, journey?.endDate]);

  // Danh sách các cột ngày theo thời gian của hành trình
  const days = useMemo(() => {
    const result: number[] = [];
    for (let i = 1; i <= totalJourneyDays; i++) {
      result.push(i);
    }
    return result;
  }, [totalJourneyDays]);

  const handleOpenAddActivity = (dayNo?: number, slot?: TimeSlot) => {
    const safeDay = Math.min(Math.max(1, dayNo ?? 1), totalJourneyDays);
    setSelectedDay(safeDay);
    setSelectedSlot(slot ?? 'MORNING');
    setIsAddActivityModalOpen(true);
  };

  // Xóa checkpoint an toàn
  function handleConfirmDelete(checkpointId: string) {
    deleteCheckpointMutation.mutate(checkpointId, {
      onSuccess: () => {
        toast.success('Đã xóa điểm dừng khỏi hành trình!');
        setDeletingCheckpoint(null);
      },
      onError: (err: Error) => {
        toast.error(err.message || 'Không thể xóa điểm dừng. Vui lòng thử lại!');
      },
    });
  }

  // Xóa activity an toàn
  function handleConfirmDeleteActivity() {
    if (!deletingActivity) return;
    const actId = deletingActivity.customJourneyActivityId || deletingActivity.id || '';
    deleteActivityMutation.mutate(actId, {
      onSuccess: () => {
        toast.success('Đã xóa hoạt động khỏi thời khóa biểu!');
        setDeletingActivity(null);
      },
      onError: (err: Error) => {
        toast.error(err.message || 'Không thể xóa hoạt động. Vui lòng thử lại!');
      },
    });
  }

  // Loading state
  if (isJourneyLoading || isCheckpointsLoading || isActivitiesLoading) {
    return (
      <div className="space-y-6">
        <div className="h-48 w-full animate-pulse rounded-2xl bg-muted/60" />
        <div className="h-64 w-full animate-pulse rounded-2xl bg-muted/60" />
      </div>
    );
  }

  // Error state
  if (journeyError || checkpointsError || activitiesError) {
    const errorMessage =
      journeyError?.message ||
      checkpointsError?.message ||
      activitiesError?.message ||
      'Đã xảy ra sự cố khi kết nối đến máy chủ.';
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <h3 className="text-sm font-bold text-foreground">Không thể tải thông tin lộ trình</h3>
        <p className="text-xs text-muted-foreground">{errorMessage}</p>
      </div>
    );
  }

  const nextOrder = (checkpoints.length ?? 0) + 1;

  return (
    <div className="space-y-8">
      {/* 1. THÔNG TIN CHUNG VỀ HÀNH TRÌNH (HEADER BANNER) */}
      <JourneyHeaderCard
        journey={journey}
        checkpointCount={checkpoints.length}
        isLeader={isLeader}
        onEditJourney={() => setIsEditJourneyModalOpen(true)}
      />

      {/* 2. CHECKPOINT DỰ KIẾN (WAYPOINTS GRID) */}
      <CheckpointListSection
        checkpoints={sortedCheckpoints}
        canEdit={canEdit}
        onAddCheckpoint={() => setIsAddCheckpointModalOpen(true)}
        onViewCheckpoint={setViewingCheckpoint}
        onEditCheckpoint={setEditingCheckpoint}
        onDeleteCheckpoint={setDeletingCheckpoint}
      />

      {/* 3. THỜI KHÓA BIỂU LỘ TRÌNH (TIMETABLE MATRIX) */}
      <ActivityTimetableSection
        activities={activities}
        days={days}
        canEdit={canEdit}
        onOpenAddActivity={handleOpenAddActivity}
        onEditActivity={setEditingActivity}
        onDeleteActivity={setDeletingActivity}
      />

      {/* 4. MODALS */}
      <AddCheckpointModal
        isOpen={isAddCheckpointModalOpen}
        onClose={() => setIsAddCheckpointModalOpen(false)}
        groupId={groupId}
        nextOrder={nextOrder}
      />

      <EditCheckpointModal
        isOpen={Boolean(editingCheckpoint)}
        onClose={() => setEditingCheckpoint(null)}
        groupId={groupId}
        checkpoint={editingCheckpoint}
      />

      <DeleteCheckpointConfirmModal
        isOpen={Boolean(deletingCheckpoint)}
        onClose={() => setDeletingCheckpoint(null)}
        checkpoint={deletingCheckpoint}
        isPending={deleteCheckpointMutation.isPending}
        onConfirmDelete={handleConfirmDelete}
      />

      <AddActivityModal
        isOpen={isAddActivityModalOpen}
        onClose={() => setIsAddActivityModalOpen(false)}
        groupId={groupId}
        checkpoints={checkpoints}
        suggestedDayNo={selectedDay}
        suggestedTimeSlot={selectedSlot}
        existingActivitiesCount={activities.length}
        maxDays={totalJourneyDays}
      />

      <EditActivityModal
        isOpen={Boolean(editingActivity)}
        onClose={() => setEditingActivity(null)}
        groupId={groupId}
        activity={editingActivity}
        checkpoints={checkpoints}
        maxDays={totalJourneyDays}
      />

      <DeleteActivityConfirmModal
        isOpen={Boolean(deletingActivity)}
        onClose={() => setDeletingActivity(null)}
        activity={deletingActivity}
        isDeleting={deleteActivityMutation.isPending}
        onConfirm={handleConfirmDeleteActivity}
      />

      <EditJourneyModal
        isOpen={isEditJourneyModalOpen}
        onClose={() => setIsEditJourneyModalOpen(false)}
        groupId={groupId}
        journey={journey}
      />

      <ViewCheckpointModal
        checkpoint={viewingCheckpoint}
        onClose={() => setViewingCheckpoint(null)}
      />
    </div>
  );
}
