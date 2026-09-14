import { Camera, Plus, Upload } from 'lucide-react';
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
import { HideMomentModal } from './HideMomentModal';

interface GroupMomentsTabProps {
  groupId: string;
  isLeader: boolean;
  currentUserId?: string;
}

/** Tab "Khoảnh khắc & Album" trong workspace nhóm ghép. */
export function GroupMomentsTab({ groupId, isLeader, currentUserId }: GroupMomentsTabProps) {
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

  const handleCreateMoment = (payload: MomentCreatePayload) =>
    createMutation
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
      <MomentsPanelHeader
        title="Khoảnh khắc & Kỷ niệm Chuyến đi"
        description="Lưu giữ dòng thời gian, thư viện ảnh check-in và tọa độ hành trình cùng đồng đội"
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        albumCount={albumItems.length}
        action={
          <AppButton
            size="sm"
            onClick={() => setIsComposerOpen(true)}
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
              description="Hãy là người đầu tiên đăng tải những bức ảnh săn mây, vượt suối tuyệt đẹp cùng đồng đội!"
              action={
                <AppButton
                  variant="outline"
                  size="sm"
                  onClick={() => setIsComposerOpen(true)}
                  className="rounded-xl"
                >
                  <Upload className="mr-1 h-3.5 w-3.5" /> Đăng khoảnh khắc đầu tiên
                </AppButton>
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
