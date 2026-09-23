import { Camera, Info, Plus, Upload } from 'lucide-react';
import { useState } from 'react';
import {
  GROUP_MOMENT_VISIBILITY_OPTIONS,
  getMomentImageUrls,
  getMomentMediaUrl,
  MomentAlbumGrid,
  MomentComposerModal,
  type MomentCreatePayload,
  MomentDetailModal,
  MomentEmptyState,
  type MomentItem,
  MomentLightbox,
  MomentsLoading,
  MomentsMapPanel,
  MomentsPanelHeader,
  MomentTimeline,
  type MomentViewMode,
  type MomentVisibility,
} from '@/features/moments';
import { AppButton } from '@/shared/ui';
import { toast } from '@/store/useToastStore';
import {
  useCreateMoment,
  useDeleteMoment,
  useGroupAlbum,
  useGroupMoments,
  useGroupMomentsMap,
  useHideMoment,
  useUnhideMoment,
  useUpdateMomentVisibility,
} from '../../../hooks/useGroupMoments';
import type { MatchingGroupStatus } from '../../../types/matchingGroup';
import { HideMomentModal } from './HideMomentModal';

interface GroupMomentsTabProps {
  groupId: string;
  isLeader: boolean;
  currentUserId?: string;
  groupStatus?: MatchingGroupStatus;
}

export function GroupMomentsTab({
  groupId,
  isLeader,
  currentUserId,
  groupStatus,
}: GroupMomentsTabProps) {
  const canPostMoments = groupStatus === 'IN_PROGRESS' || groupStatus === 'COMPLETED';
  const [viewMode, setViewMode] = useState<MomentViewMode>('timeline');
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [selectedMoment, setSelectedMoment] = useState<MomentItem | null>(null);
  const [lightbox, setLightbox] = useState<{ urls: string[]; index: number } | null>(null);
  const [hidingMomentId, setHidingMomentId] = useState<string | null>(null);

  const { data: momentsData, isLoading: isMomentsLoading } = useGroupMoments(groupId);
  const { data: albumData, isLoading: isAlbumLoading } = useGroupAlbum(groupId);
  const { data: mapData, isLoading: isMapLoading } = useGroupMomentsMap(groupId);

  const createMutation = useCreateMoment(groupId);
  const hideMutation = useHideMoment(groupId);
  const unhideMutation = useUnhideMoment(groupId);
  const deleteMutation = useDeleteMoment(groupId);
  const updateVisibilityMutation = useUpdateMomentVisibility(groupId);

  const moments: MomentItem[] = momentsData?.items ?? [];
  const albumItems = albumData?.items ?? [];
  const mapMarkers = mapData ?? [];

  const openMomentImage = (moment: MomentItem, index: number) => {
    setLightbox({ urls: getMomentImageUrls(moment), index });
  };

  const handleCreateMoment = (payload: MomentCreatePayload) => {
    if (!canPostMoments) {
      toast.info('Chuyến đi chưa bắt đầu nên chưa thể đăng khoảnh khắc!');
      return Promise.reject(new Error('Chuyến đi chưa bắt đầu.'));
    }
    return createMutation
      .mutateAsync(payload)
      .then((created) => {
        toast.success('Đã đăng khoảnh khắc mới thành công!');
        return created;
      })
      .catch((err: unknown) => {
        toast.error(
          err instanceof Error ? err.message : 'Không thể đăng khoảnh khắc. Vui lòng thử lại!'
        );
        throw err;
      });
  };

  const handleToggleVisibility = (momentId: string, visibility: MomentVisibility) => {
    updateVisibilityMutation.mutate(
      { momentId, visibility },
      {
        onSuccess: () => {
          toast.success(
            visibility === 'PUBLIC_PROFILE'
              ? 'Đã chia sẻ khoảnh khắc lên Trang cá nhân thành công!'
              : 'Đã chuyển khoảnh khắc về chế độ Chỉ trong nhóm.'
          );
        },
        onError: (err: unknown) => {
          toast.error(err instanceof Error ? err.message : 'Không thể cập nhật quyền hiển thị.');
        },
      }
    );
  };

  const handleConfirmHide = (reason: string) => {
    if (!hidingMomentId) return;
    hideMutation.mutate(
      { momentId: hidingMomentId, reason },
      {
        onSuccess: () => {
          setHidingMomentId(null);
          toast.success('Đã ẩn khoảnh khắc vi phạm thành công.');
        },
        onError: (err: unknown) => {
          toast.error(err instanceof Error ? err.message : 'Không thể ẩn khoảnh khắc.');
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      {!canPostMoments && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-900 text-sm dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="space-y-0.5">
            <p className="font-semibold text-sm">Chuyến đi chưa khởi hành</p>
            <p className="text-xs opacity-90 leading-relaxed">
              Các thành viên chỉ có thể đăng bài viết, tọa độ check-in và tải ảnh khoảnh khắc sau
              khi chuyến đi chính thức bắt đầu hoặc đã kết thúc.
            </p>
          </div>
        </div>
      )}

      <MomentsPanelHeader
        title="Khoảnh khắc & Kỷ niệm Chuyến đi"
        description="Lưu giữ dòng thời gian, thư viện ảnh check-in và tọa độ hành trình cùng đồng đội"
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        albumCount={albumItems.length}
        action={
          <AppButton
            size="sm"
            onClick={() => {
              if (!canPostMoments) {
                toast.info('Chuyến đi chưa bắt đầu nên chưa thể đăng khoảnh khắc!');
                return;
              }
              setIsComposerOpen(true);
            }}
            disabled={!canPostMoments}
            title={
              !canPostMoments ? 'Chuyến đi chưa khởi hành nên chưa thể đăng khoảnh khắc' : undefined
            }
            className="flex items-center gap-1.5 rounded-xl"
          >
            <Plus className="h-4 w-4" /> Đăng khoảnh khắc
          </AppButton>
        }
      />

      {viewMode === 'timeline' && (
        <MomentTimeline
          moments={moments}
          isLoading={isMomentsLoading}
          empty={
            <MomentEmptyState
              icon={Camera}
              title="Chưa có bài viết nào trên bảng tin"
              description={
                canPostMoments
                  ? 'Hãy là người đầu tiên đăng tải những bức ảnh săn mây, vượt suối tuyệt đẹp cùng đồng đội!'
                  : 'Bảng tin khoảnh khắc sẽ mở khi chuyến đi bắt đầu. Hãy chuẩn bị những khung hình thật đẹp nhé!'
              }
              action={
                canPostMoments ? (
                  <AppButton
                    variant="outline"
                    size="sm"
                    onClick={() => setIsComposerOpen(true)}
                    className="rounded-xl"
                  >
                    <Upload className="mr-1 h-3.5 w-3.5" /> Đăng khoảnh khắc đầu tiên
                  </AppButton>
                ) : undefined
              }
            />
          }
          cardProps={{
            currentUserId,
            scope: 'group',
            canModerate: isLeader,
            onSelectMoment: setSelectedMoment,
            onSelectImage: openMomentImage,
            onHide: setHidingMomentId,
            onUnhide: (momentId) => unhideMutation.mutate(momentId),
            onDelete: (momentId) => deleteMutation.mutate(momentId),
            onToggleVisibility: handleToggleVisibility,
            onViewOnMap: () => setViewMode('map'),
          }}
        />
      )}

      {viewMode === 'album' && (
        <MomentAlbumGrid
          media={albumItems}
          isLoading={isAlbumLoading}
          emptyDescription="Các bức ảnh được tải lên trong mục Khoảnh khắc sẽ tự động gom về đây."
          onSelectImage={(index) =>
            setLightbox({
              urls: albumItems
                .map((item) => getMomentMediaUrl(item))
                .filter((url): url is string => Boolean(url)),
              index,
            })
          }
        />
      )}

      {viewMode === 'map' &&
        (isMapLoading ? (
          <MomentsLoading />
        ) : (
          <MomentsMapPanel
            markers={mapMarkers}
            moments={moments}
            onPreviewImage={(url) => setLightbox({ urls: [url], index: 0 })}
            onSelectMoment={setSelectedMoment}
          />
        ))}

      <MomentComposerModal
        open={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        description="Chia sẻ hình ảnh, vị trí check-in và cảm nghĩ về chuyến đi cùng đồng đội"
        visibilityOptions={GROUP_MOMENT_VISIBILITY_OPTIONS}
        defaultVisibility="GROUP_ONLY"
        isSubmitting={createMutation.isPending}
        onSubmit={handleCreateMoment}
      />

      <HideMomentModal
        open={Boolean(hidingMomentId)}
        isPending={hideMutation.isPending}
        onClose={() => setHidingMomentId(null)}
        onConfirm={handleConfirmHide}
      />

      {selectedMoment && (
        <MomentDetailModal
          moment={selectedMoment}
          onClose={() => setSelectedMoment(null)}
          onSelectImage={(index) => openMomentImage(selectedMoment, index)}
        />
      )}

      {lightbox && (
        <MomentLightbox
          urls={lightbox.urls}
          index={lightbox.index}
          onIndexChange={(index) => setLightbox((prev) => (prev ? { ...prev, index } : prev))}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}
