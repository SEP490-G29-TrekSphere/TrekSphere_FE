import {
  Camera,
  Compass,
  Grid,
  Image as ImageIcon,
  ImagePlus,
  Layers,
  Loader2,
  Navigation,
  Plus,
  Upload,
  X,
} from 'lucide-react';
import type React from 'react';
import { useRef, useState } from 'react';
import { GroupMomentsMapPanel } from '@/features/companion-groups/components/workspace/moments/GroupMomentsMapPanel';
import { MomentPostCard } from '@/features/companion-groups/components/workspace/moments/MomentPostCard';
import type {
  MomentItem,
  MomentMapMarker,
  MomentMediaItem,
} from '@/features/companion-groups/services/momentService';
import { cn } from '@/lib/utils';
import { AppButton, AppInput, AppModalShell, AppSpinner } from '@/shared/ui';
import { toast } from '@/store/useToastStore';
import { getSafeImageUrl } from '@/utils/sanitize';
import {
  useCreatePersonalMoment,
  useDeletePersonalMoment,
  useUpdatePersonalMomentVisibility,
  useUserMoments,
  useUserMomentsMap,
} from '../../hooks/useUserMoments';
import { profileService } from '../../services/profileService';

interface ProfileMomentsPanelProps {
  userId?: string;
  isOwnProfile: boolean;
  currentUserId?: string;
}

type ViewMode = 'timeline' | 'album' | 'map';

export function ProfileMomentsPanel({
  userId,
  isOwnProfile,
  currentUserId,
}: ProfileMomentsPanelProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedMoment, setSelectedMoment] = useState<MomentItem | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // Form State for creating moment
  const [caption, setCaption] = useState('');
  const [locationName, setLocationName] = useState('');
  const [altitude, setAltitude] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [visibility, setVisibility] = useState<'PUBLIC_PROFILE' | 'ONLY_ME'>('PUBLIC_PROFILE');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const newlyUploadedUrlsRef = useRef<string[]>([]);

  // Queries & Mutations
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
  const mapMarkers: MomentMapMarker[] = mapData ?? [];

  // Extract all photos from moments for Album grid view
  const allMediaItems: MomentMediaItem[] = moments.flatMap((m) => m.mediaList ?? []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`Ảnh "${file.name}" vượt quá kích thước 10MB.`);
        return;
      }
    }

    setIsUploadingImage(true);
    try {
      for (const file of files) {
        const res = await profileService.uploadFile(file, 'moments');
        if (res.data) {
          const uploadedUrl = res.data;
          newlyUploadedUrlsRef.current.push(uploadedUrl);
          setMediaUrls((prev) => [...prev, uploadedUrl]);
        }
      }
      toast.success('Đã tải ảnh lên thành công!');
    } catch {
      toast.error('Có lỗi xảy ra khi tải ảnh lên.');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveMediaUrl = (index: number) => {
    const urlToRemove = mediaUrls[index];
    if (urlToRemove && newlyUploadedUrlsRef.current.includes(urlToRemove)) {
      profileService.deleteFile(urlToRemove).catch(() => {});
      newlyUploadedUrlsRef.current = newlyUploadedUrlsRef.current.filter((u) => u !== urlToRemove);
    }
    setMediaUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCloseUploadModal = () => {
    if (newlyUploadedUrlsRef.current.length > 0) {
      for (const url of newlyUploadedUrlsRef.current) {
        profileService.deleteFile(url).catch(() => {});
      }
      newlyUploadedUrlsRef.current = [];
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsUploadOpen(false);
    setCaption('');
    setLocationName('');
    setAltitude('');
    setLatitude('');
    setLongitude('');
    setMediaUrls([]);
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Trình duyệt của bạn không hỗ trợ định vị GPS.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLatitude(lat.toFixed(6));
        setLongitude(lng.toFixed(6));

        if (pos.coords.altitude !== null && pos.coords.altitude !== undefined) {
          setAltitude(`${Math.round(pos.coords.altitude)}m`);
        }

        toast.success('Đã lấy tọa độ GPS hiện tại thành công!');
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          toast.error('Bạn đã từ chối quyền truy cập vị trí GPS của trình duyệt.');
        } else {
          toast.error('Không thể xác định vị trí GPS hiện tại.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleCreateMoment = (e: React.FormEvent) => {
    e.preventDefault();
    const validUrls = mediaUrls.filter((u) => Boolean(u.trim()));
    if (validUrls.length === 0) {
      toast.error('Vui lòng tải lên ít nhất 1 hình ảnh khoảnh khắc!');
      return;
    }

    createMutation.mutate(
      {
        caption: caption.trim() || undefined,
        locationName: locationName.trim() || undefined,
        altitude: altitude.trim() || undefined,
        latitude: latitude ? Number.parseFloat(latitude) : undefined,
        longitude: longitude ? Number.parseFloat(longitude) : undefined,
        visibility,
        mediaUrls: validUrls,
      },
      {
        onSuccess: () => {
          newlyUploadedUrlsRef.current = [];
          if (fileInputRef.current) fileInputRef.current.value = '';
          setIsUploadOpen(false);
          setCaption('');
          setLocationName('');
          setAltitude('');
          setLatitude('');
          setLongitude('');
          setMediaUrls([]);
          toast.success('Đã tạo khoảnh khắc mới thành công!');
        },
        onError: (err: unknown) => {
          const msg =
            err instanceof Error ? err.message : 'Không thể đăng khoảnh khắc. Vui lòng thử lại!';
          toast.error(msg);
        },
      }
    );
  };

  const handleToggleVisibility = (
    momentId: string,
    newVisibility: 'GROUP_ONLY' | 'PUBLIC_PROFILE'
  ) => {
    updateVisibilityMutation.mutate(
      { momentId, visibility: newVisibility },
      {
        onSuccess: () => {
          toast.success(
            newVisibility === 'PUBLIC_PROFILE'
              ? 'Đã công khai khoảnh khắc lên trang cá nhân!'
              : 'Đã ẩn khoảnh khắc khỏi trang cá nhân.'
          );
        },
        onError: (err: unknown) => {
          const msg = err instanceof Error ? err.message : 'Không thể cập nhật quyền hiển thị.';
          toast.error(msg);
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header controls: Switchers & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Nhật ký Khoảnh khắc & Kỷ niệm Trekking
          </h3>
          <p className="text-xs text-muted-foreground">
            {isOwnProfile
              ? 'Lưu trữ các hình ảnh check-in, tọa độ hành trình và các mốc đỉnh núi đã chinh phục'
              : 'Những bức ảnh check-in và khoảnh khắc ấn tượng được chia sẻ công khai'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/40 p-1">
            <button
              type="button"
              onClick={() => setViewMode('timeline')}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer',
                viewMode === 'timeline'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Layers className="h-3.5 w-3.5" /> Dòng thời gian
            </button>
            <button
              type="button"
              onClick={() => setViewMode('album')}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer',
                viewMode === 'album'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Grid className="h-3.5 w-3.5" /> Album ảnh ({allMediaItems.length})
            </button>
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer',
                viewMode === 'map'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Compass className="h-3.5 w-3.5" /> Bản đồ
            </button>
          </div>

          {/* Create Button (Only for own profile) */}
          {isOwnProfile && (
            <AppButton
              variant="default"
              size="sm"
              onClick={() => setIsUploadOpen(true)}
              className="rounded-xl flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" /> Đăng khoảnh khắc
            </AppButton>
          )}
        </div>
      </div>

      {/* VIEW 1: TIMELINE (SOCIAL NEWSFEED) */}
      {viewMode === 'timeline' && (
        <div className="max-w-2xl mx-auto space-y-6">
          {isMomentsLoading ? (
            <div className="flex min-h-48 items-center justify-center">
              <AppSpinner size="default" className="text-primary" />
            </div>
          ) : moments.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card/40 p-12 text-center">
              <Camera className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
              <h4 className="text-sm font-bold text-foreground">Chưa có khoảnh khắc nào</h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                {isOwnProfile
                  ? 'Hãy ghi lại những hình ảnh tuyệt đẹp trên các cung đường leo núi của bạn!'
                  : 'Người dùng này chưa chia sẻ khoảnh khắc nào ra trang cá nhân.'}
              </p>
              {isOwnProfile && (
                <AppButton
                  variant="outline"
                  size="sm"
                  onClick={() => setIsUploadOpen(true)}
                  className="mt-4 rounded-xl"
                >
                  <Upload className="h-3.5 w-3.5 mr-1" /> Đăng khoảnh khắc đầu tiên
                </AppButton>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {moments.map((moment: MomentItem) => (
                <MomentPostCard
                  key={moment.momentId}
                  moment={moment}
                  currentUserId={currentUserId}
                  isLeader={false}
                  onSelectMoment={(m) => setSelectedMoment(m)}
                  onPreviewImage={(url) => setPreviewImageUrl(url)}
                  onHide={() => {}}
                  onUnhide={() => {}}
                  onDelete={(momentId) => deleteMutation.mutate(momentId)}
                  onToggleVisibility={handleToggleVisibility}
                  onViewOnMap={() => setViewMode('map')}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: ALBUM GRID */}
      {viewMode === 'album' && (
        <div>
          {isMomentsLoading ? (
            <div className="flex min-h-48 items-center justify-center">
              <AppSpinner size="default" className="text-primary" />
            </div>
          ) : allMediaItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center">
              <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
              <h4 className="text-sm font-bold text-foreground">Album ảnh trống</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Các bức ảnh check-in trong khoảnh khắc sẽ tự động gom về đây.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {allMediaItems.map((media, idx) => {
                const imgUrl = media.imageUrl || media.mediaUrl;
                const mediaKey = media.momentMediaId || media.mediaId || `user-album-img-${idx}`;
                if (!imgUrl) return null;
                return (
                  <button
                    type="button"
                    key={mediaKey}
                    onClick={() => setPreviewImageUrl(imgUrl)}
                    className="relative aspect-square rounded-xl overflow-hidden bg-black/10 border border-border cursor-pointer group shadow-2xs hover:shadow-md transition text-left p-0"
                  >
                    <img
                      src={imgUrl}
                      alt="Album item"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition p-2.5 flex flex-col justify-end text-white">
                      {media.createdAt && (
                        <p className="text-[10px] text-white/90">
                          {new Date(media.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: GPS MAP OF MOMENTS */}
      {viewMode === 'map' && (
        <div>
          {isMapLoading ? (
            <div className="flex min-h-48 items-center justify-center">
              <AppSpinner size="default" className="text-primary" />
            </div>
          ) : (
            <GroupMomentsMapPanel
              markers={mapMarkers}
              moments={moments}
              onPreviewImage={(url) => setPreviewImageUrl(url)}
              onSelectMoment={(m) => setSelectedMoment(m)}
            />
          )}
        </div>
      )}

      {/* MODAL: CREATE NEW PERSONAL MOMENT */}
      {isOwnProfile && (
        <AppModalShell
          open={isUploadOpen}
          onClose={handleCloseUploadModal}
          className="max-w-xl"
          aria-label="Đăng Khoảnh Khắc Cá Nhân"
        >
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-foreground">Đăng Khoảnh Khắc Mới</h3>
              <p className="text-xs text-muted-foreground">
                Tải ảnh check-in và lưu lại tọa độ hành trình cá nhân của bạn
              </p>
            </div>

            <form onSubmit={handleCreateMoment} className="space-y-4">
              {/* Image Upload Area */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground block">
                  Hình ảnh khoảnh khắc <span className="text-destructive">*</span>
                </label>

                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={isUploadingImage}
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-primary/50 bg-primary/5 px-4 py-2.5 text-xs font-bold text-primary transition hover:bg-primary/10 disabled:opacity-50 cursor-pointer"
                  >
                    {isUploadingImage ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Đang tải ảnh lên...</span>
                      </>
                    ) : (
                      <>
                        <ImagePlus className="h-4 w-4" />
                        <span>Chọn ảnh từ thiết bị</span>
                      </>
                    )}
                  </button>
                  <span className="text-[11px] text-muted-foreground">(Tối đa 10MB/ảnh)</span>
                </div>

                {mediaUrls.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                    {mediaUrls.map((url, idx) => {
                      const itemKey = `user-moment-img-${url}-${idx}`;
                      return (
                        <div
                          key={itemKey}
                          className="relative aspect-video rounded-xl overflow-hidden border border-border bg-muted/30 group"
                        >
                          <img
                            src={url}
                            alt={`Uploaded preview ${idx + 1}`}
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveMediaUrl(idx)}
                            className="absolute right-1.5 top-1.5 rounded-lg bg-black/70 p-1 text-white backdrop-blur-xs transition hover:bg-rose-600 cursor-pointer"
                            title="Gỡ ảnh"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Row: Địa điểm & Độ cao */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground mb-1 block">
                    Địa điểm check-in
                  </label>
                  <AppInput
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="VD: Đỉnh Fansipan, Rừng trúc Y Tý..."
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground mb-1 block">
                    Độ cao ngọn núi (Tùy chọn)
                  </label>
                  <AppInput
                    value={altitude}
                    onChange={(e) => setAltitude(e.target.value)}
                    placeholder="VD: 3.143m, 2.860m..."
                  />
                </div>
              </div>

              {/* Mô tả / Cảm nghĩ */}
              <div>
                <label className="text-xs font-bold text-foreground mb-1 block">
                  Mô tả / Cảm nghĩ khoảnh khắc
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Chia sẻ cảm xúc, câu chuyện trên đường leo núi..."
                  rows={3}
                  className="w-full rounded-xl border border-input bg-background p-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Row: Tọa độ GPS */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground block">
                    Tọa độ GPS (Tùy chọn)
                  </label>
                  <button
                    type="button"
                    disabled={isLocating}
                    onClick={handleGetCurrentLocation}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline disabled:opacity-50 cursor-pointer"
                  >
                    {isLocating ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Đang lấy tọa độ GPS...</span>
                      </>
                    ) : (
                      <>
                        <Navigation className="h-3.5 w-3.5" />
                        <span>Lấy vị trí hiện tại</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <AppInput
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="Vĩ độ (VD: 22.3033)"
                  />
                  <AppInput
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="Kinh độ (VD: 103.7750)"
                  />
                </div>
              </div>

              {/* Quyền hiển thị */}
              <div>
                <label className="text-xs font-bold text-foreground mb-1 block">
                  Quyền hiển thị
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 rounded-xl border border-border p-2.5 text-xs font-medium cursor-pointer hover:bg-muted/40">
                    <input
                      type="radio"
                      name="userMomentVisibility"
                      value="PUBLIC_PROFILE"
                      checked={visibility === 'PUBLIC_PROFILE'}
                      onChange={() => setVisibility('PUBLIC_PROFILE')}
                      className="text-primary"
                    />
                    <div>
                      <p className="font-bold text-foreground">🌐 Công khai Profile</p>
                      <p className="text-[10px] text-muted-foreground">Mọi người đều xem được</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 rounded-xl border border-border p-2.5 text-xs font-medium cursor-pointer hover:bg-muted/40">
                    <input
                      type="radio"
                      name="userMomentVisibility"
                      value="ONLY_ME"
                      checked={visibility === 'ONLY_ME'}
                      onChange={() => setVisibility('ONLY_ME')}
                      className="text-primary"
                    />
                    <div>
                      <p className="font-bold text-foreground">🔒 Chỉ mình tôi</p>
                      <p className="text-[10px] text-muted-foreground">Riêng tư trên tài khoản</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <AppButton
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCloseUploadModal}
                  disabled={createMutation.isPending || isUploadingImage}
                >
                  Hủy
                </AppButton>
                <AppButton
                  type="submit"
                  variant="default"
                  size="sm"
                  disabled={createMutation.isPending || isUploadingImage || mediaUrls.length === 0}
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    'Đăng khoảnh khắc'
                  )}
                </AppButton>
              </div>
            </form>
          </div>
        </AppModalShell>
      )}

      {/* LIGHTBOX PREVIEW MODAL */}
      {previewImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-xs animate-in fade-in">
          <button
            type="button"
            aria-label="Đóng xem ảnh nền"
            className="absolute inset-0 h-full w-full bg-transparent border-0 cursor-default"
            onClick={() => setPreviewImageUrl(null)}
          />
          <button
            type="button"
            onClick={() => setPreviewImageUrl(null)}
            className="absolute top-4 right-4 z-10 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20 transition cursor-pointer"
            title="Đóng xem ảnh"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={getSafeImageUrl(previewImageUrl) || ''}
            alt="Chi tiết khoảnh khắc"
            className="relative z-10 max-h-[85vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
          />
        </div>
      )}

      {/* MOMENT DETAIL MODAL */}
      {selectedMoment && (
        <AppModalShell
          open={Boolean(selectedMoment)}
          onClose={() => setSelectedMoment(null)}
          className="max-w-2xl"
          aria-label="Chi tiết khoảnh khắc"
        >
          <div className="space-y-4">
            <div>
              <h4 className="text-base font-extrabold text-foreground">
                {selectedMoment.locationName || selectedMoment.placeName || 'Chi tiết khoảnh khắc'}
              </h4>
              <p className="text-xs text-muted-foreground">
                Đăng bởi {selectedMoment.authorName} •{' '}
                {new Date(selectedMoment.createdAt).toLocaleDateString('vi-VN')}
              </p>
            </div>

            {selectedMoment.mediaList && selectedMoment.mediaList.length > 0 && (
              <div className="grid grid-cols-2 gap-2 max-h-[380px] overflow-y-auto">
                {selectedMoment.mediaList.map((med, idx) => {
                  const url = med.imageUrl || med.mediaUrl;
                  if (!url) return null;
                  return (
                    <button
                      type="button"
                      key={med.mediaId || med.momentMediaId || `med-${idx}`}
                      className="relative aspect-video rounded-xl overflow-hidden bg-black/10 cursor-pointer border-0 p-0"
                      onClick={() => setPreviewImageUrl(url)}
                    >
                      <img
                        src={url}
                        alt={`Ảnh ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            )}

            {selectedMoment.caption && (
              <p className="text-xs text-foreground leading-relaxed bg-muted/30 p-3 rounded-xl">
                "{selectedMoment.caption}"
              </p>
            )}

            <div className="flex justify-end pt-2">
              <AppButton variant="outline" size="sm" onClick={() => setSelectedMoment(null)}>
                Đóng
              </AppButton>
            </div>
          </div>
        </AppModalShell>
      )}
    </div>
  );
}
