import { Camera, Plus, Upload } from 'lucide-react';
import { useState } from 'react';
import {
  collectMomentMedia,
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
  PERSONAL_MOMENT_VISIBILITY_OPTIONS,
} from '@/features/moments';
import { AppButton } from '@/shared/ui';
import { toast } from '@/store/useToastStore';
import {
  useCreatePersonalMoment,
  useDeletePersonalMoment,
  useUpdatePersonalMomentVisibility,
  useUserMoments,
  useUserMomentsMap,
} from '../../hooks/useUserMoments';

interface ProfileMomentsPanelProps {
  userId?: string;
  isOwnProfile: boolean;
  currentUserId?: string;
}

/** Tab "Khoảnh khắc" của trang hồ sơ — nhật ký check-in cá nhân. */
export function ProfileMomentsPanel({
  userId,
  isOwnProfile,
  currentUserId,
}: ProfileMomentsPanelProps) {
  const [viewMode, setViewMode] = useState<MomentViewMode>('timeline');
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [selectedMoment, setSelectedMoment] = useState<MomentItem | null>(null);
  const [lightbox, setLightbox] = useState<{ urls: string[]; index: number } | null>(null);

  const { data: momentsData, isLoading: isMomentsLoading } = useUserMoments({
    userId,
    isMeMode: isOwnProfile,
  });
  const { data: mapData, isLoading: isMapLoading } = useUserMomentsMap({
    userId,
    isMeMode: isOwnProfile,
  });

  const createMutation = useCreatePersonalMoment();
  const deleteMutation = useDeletePersonalMoment();
  const updateVisibilityMutation = useUpdatePersonalMomentVisibility();

  const moments: MomentItem[] = momentsData?.items ?? [];
  const albumItems = collectMomentMedia(moments);
  const mapMarkers = mapData ?? [];

  const openMomentImage = (moment: MomentItem, index: number) => {
    setLightbox({ urls: getMomentImageUrls(moment), index });
  };

  const handleCreateMoment = (payload: MomentCreatePayload) =>
    createMutation
      .mutateAsync(payload)
      .then((created) => {
        toast.success('Đã tạo khoảnh khắc mới thành công!');
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
              ? 'Đã công khai khoảnh khắc lên trang cá nhân!'
              : 'Đã chuyển khoảnh khắc về chế độ Chỉ mình tôi.'
          );
        },
        onError: (err: unknown) => {
          toast.error(err instanceof Error ? err.message : 'Không thể cập nhật quyền hiển thị.');
        },
      }
    );
  };

  const handleDeleteMoment = (momentId: string) => {
    deleteMutation.mutate(momentId, {
      onSuccess: () => toast.success('Đã xóa khoảnh khắc.'),
      onError: (err: unknown) => {
        toast.error(err instanceof Error ? err.message : 'Không thể xóa khoảnh khắc.');
      },
    });
  };

  const composeButton = isOwnProfile ? (
    <AppButton
      size="sm"
      onClick={() => setIsComposerOpen(true)}
      className="flex items-center gap-1.5 rounded-xl"
    >
      <Plus className="h-4 w-4" /> Đăng khoảnh khắc
    </AppButton>
  ) : undefined;

  return (
    <div className="space-y-6">
      <MomentsPanelHeader
        title="Nhật ký Khoảnh khắc & Kỷ niệm Trekking"
        description={
          isOwnProfile
            ? 'Lưu trữ các hình ảnh check-in, tọa độ hành trình và các mốc đỉnh núi đã chinh phục'
            : 'Những bức ảnh check-in và khoảnh khắc ấn tượng được chia sẻ công khai'
        }
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        albumCount={albumItems.length}
        action={composeButton}
      />

      {viewMode === 'timeline' && (
        <MomentTimeline
          moments={moments}
          isLoading={isMomentsLoading}
          empty={
            <MomentEmptyState
              icon={Camera}
              title="Chưa có khoảnh khắc nào"
              description={
                isOwnProfile
                  ? 'Hãy ghi lại những hình ảnh tuyệt đẹp trên các cung đường leo núi của bạn!'
                  : 'Người dùng này chưa chia sẻ khoảnh khắc nào ra trang cá nhân.'
              }
              action={
                isOwnProfile ? (
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
            scope: 'personal',
            onSelectMoment: setSelectedMoment,
            onSelectImage: openMomentImage,
            onDelete: isOwnProfile ? handleDeleteMoment : undefined,
            onToggleVisibility: isOwnProfile ? handleToggleVisibility : undefined,
            onViewOnMap: () => setViewMode('map'),
          }}
        />
      )}

      {viewMode === 'album' && (
        <MomentAlbumGrid
          media={albumItems}
          isLoading={isMomentsLoading}
          emptyDescription="Các bức ảnh check-in trong khoảnh khắc sẽ tự động gom về đây."
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

      {isOwnProfile && (
        <MomentComposerModal
          open={isComposerOpen}
          onClose={() => setIsComposerOpen(false)}
          description="Tải ảnh check-in và lưu lại tọa độ hành trình cá nhân của bạn"
          visibilityOptions={PERSONAL_MOMENT_VISIBILITY_OPTIONS}
          defaultVisibility="PUBLIC_PROFILE"
          isSubmitting={createMutation.isPending}
          onSubmit={handleCreateMoment}
        />
      )}

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
