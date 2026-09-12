import {
  Camera,
  Compass,
  Grid,
  Heart,
  Image as ImageIcon,
  ImagePlus,
  Layers,
  Loader2,
  MessageCircle,
  Navigation,
  Plus,
  Upload,
  X,
} from 'lucide-react';
import type React from 'react';
import { useRef, useState } from 'react';
import { profileService } from '@/features/profile/services/profileService';
import { cn } from '@/lib/utils';
import { AppButton, AppInput, AppModalShell, AppSpinner } from '@/shared/ui';
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
import type { MomentItem, MomentMapMarker, MomentMediaItem } from '../../../services/momentService';
import { GroupMomentsMapPanel } from './GroupMomentsMapPanel';
import { MomentPostCard } from './MomentPostCard';

interface GroupMomentsTabProps {
  groupId: string;
  isLeader: boolean;
  currentUserId?: string;
}

type ViewMode = 'timeline' | 'album' | 'map';

export function GroupMomentsTab({ groupId, isLeader, currentUserId }: GroupMomentsTabProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedMoment, setSelectedMoment] = useState<MomentItem | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [hideReasonModal, setHideReasonModal] = useState<{
    open: boolean;
    momentId: string;
    reason: string;
  }>({
    open: false,
    momentId: '',
    reason: '',
  });

  // Form State
  const [caption, setCaption] = useState('');
  const [locationName, setLocationName] = useState('');
  const [altitude, setAltitude] = useState('');
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [visibility, setVisibility] = useState<'GROUP_ONLY' | 'PUBLIC_PROFILE'>('GROUP_ONLY');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // File Upload Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const newlyUploadedUrlsRef = useRef<string[]>([]);

  // React Query Hooks
  const { data: momentsData, isLoading: isMomentsLoading } = useGroupMoments(groupId);
  const { data: albumData, isLoading: isAlbumLoading } = useGroupAlbum(groupId);
  const { data: mapData, isLoading: isMapLoading } = useGroupMomentsMap(groupId);

  const createMutation = useCreateMoment(groupId);
  const hideMutation = useHideMoment(groupId);
  const unhideMutation = useUnhideMoment(groupId);
  const deleteMutation = useDeleteMoment(groupId);
  const updateVisibilityMutation = useUpdateMomentVisibility(groupId);

  const moments: MomentItem[] = momentsData?.items ?? [];
  const albumItems: MomentMediaItem[] = albumData?.items ?? [];
  const mapMarkers: MomentMapMarker[] = mapData ?? [];

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
      if (files.length === 1) {
        const res = await profileService.uploadFile(files[0], 'moments');
        if (res.data) {
          const uploadedUrl = res.data;
          newlyUploadedUrlsRef.current.push(uploadedUrl);
          setMediaUrls((prev) => [...prev, uploadedUrl]);
          toast.success('Đã tải ảnh lên thành công!');
        } else {
          toast.error(res.error || 'Không thể tải ảnh lên. Vui lòng thử lại!');
        }
      } else {
        const res = await profileService.uploadFiles(files, 'moments');
        if (res.data && Array.isArray(res.data)) {
          const uploadedUrls = res.data;
          newlyUploadedUrlsRef.current.push(...uploadedUrls);
          setMediaUrls((prev) => [...prev, ...uploadedUrls]);
          toast.success(`Đã tải lên ${uploadedUrls.length} ảnh thành công!`);
        } else {
          toast.error(res.error || 'Không thể tải ảnh lên. Vui lòng thử lại!');
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải ảnh lên.';
      toast.error(msg);
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
        } else if (err.code === err.TIMEOUT) {
          toast.error('Quá thời gian lấy vị trí GPS. Vui lòng thử lại!');
        } else {
          toast.error('Không thể lấy vị trí hiện tại. Vui lòng kiểm tra GPS thiết bị.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleCreateMoment = (e: React.FormEvent) => {
    e.preventDefault();
    const validUrls = mediaUrls.filter((url) => url.trim().length > 0);
    if (validUrls.length === 0) {
      toast.error('Vui lòng tải lên ít nhất 1 hình ảnh hoặc video cho khoảnh khắc!');
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
          toast.success('Đã đăng khoảnh khắc mới thành công!');
        },
        onError: (err: unknown) => {
          const msg =
            err instanceof Error ? err.message : 'Không thể đăng khoảnh khắc. Vui lòng thử lại!';
          toast.error(msg);
        },
      }
    );
  };

  const handleConfirmHide = () => {
    if (!hideReasonModal.reason.trim()) {
      toast.error('Vui lòng nhập lý do ẩn bài viết vi phạm!');
      return;
    }
    hideMutation.mutate(
      { momentId: hideReasonModal.momentId, reason: hideReasonModal.reason.trim() },
      {
        onSuccess: () => {
          setHideReasonModal({ open: false, momentId: '', reason: '' });
          toast.success('Đã ẩn khoảnh khắc vi phạm thành công.');
        },
        onError: (err: unknown) => {
          const msg = err instanceof Error ? err.message : 'Không thể ẩn khoảnh khắc.';
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
              ? 'Đã chia sẻ khoảnh khắc lên Trang cá nhân thành công!'
              : 'Đã chuyển khoảnh khắc về chế độ Chỉ trong nhóm.'
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
      {/* HEADER CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Khoảnh khắc & Kỷ niệm Chuyến đi
          </h3>
          <p className="text-xs text-muted-foreground">
            Lưu giữ dòng thời gian, thư viện ảnh check-in và tọa độ hành trình cùng đồng đội
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
              <Grid className="h-3.5 w-3.5" /> Album ảnh
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

          {/* Upload Button */}
          <AppButton
            variant="default"
            size="sm"
            onClick={() => setIsUploadOpen(true)}
            className="rounded-xl flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> Đăng ảnh mới
          </AppButton>
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
              <h4 className="text-sm font-bold text-foreground">
                Chưa có bài viết nào trên bảng tin
              </h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Hãy là người đầu tiên đăng tải những bức ảnh săn mây, vượt suối tuyệt đẹp cùng đồng
                đội!
              </p>
              <AppButton
                variant="outline"
                size="sm"
                onClick={() => setIsUploadOpen(true)}
                className="mt-4 rounded-xl"
              >
                <Upload className="h-3.5 w-3.5 mr-1" /> Đăng khoảnh khắc đầu tiên
              </AppButton>
            </div>
          ) : (
            <div className="space-y-6">
              {moments.map((moment: MomentItem) => (
                <MomentPostCard
                  key={moment.momentId}
                  moment={moment}
                  currentUserId={currentUserId}
                  isLeader={isLeader}
                  onSelectMoment={(m) => setSelectedMoment(m)}
                  onPreviewImage={(url) => setPreviewImageUrl(url)}
                  onHide={(momentId) =>
                    setHideReasonModal({
                      open: true,
                      momentId,
                      reason: '',
                    })
                  }
                  onUnhide={(momentId) => unhideMutation.mutate(momentId)}
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
          {isAlbumLoading ? (
            <div className="flex min-h-48 items-center justify-center">
              <AppSpinner size="default" className="text-primary" />
            </div>
          ) : albumItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center">
              <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
              <h4 className="text-sm font-bold text-foreground">Album ảnh trống</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Các bức ảnh được tải lên trong mục Khoảnh khắc sẽ tự động gom về đây.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {albumItems.map((media, idx) => {
                const imgUrl = media.imageUrl || media.mediaUrl;
                const mediaKey = media.momentMediaId || media.mediaId || `album-img-${idx}`;
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

      {/* MODAL: UPLOAD NEW MOMENT */}
      <AppModalShell
        open={isUploadOpen}
        onClose={handleCloseUploadModal}
        className="max-w-xl"
        aria-label="Đăng Khoảnh Khắc Mới"
      >
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-foreground">Đăng Khoảnh Khắc Mới</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Chia sẻ hình ảnh, vị trí check-in và cảm nghĩ về chuyến đi cùng đồng đội
            </p>
          </div>

          <form onSubmit={handleCreateMoment} className="space-y-4">
            {/* Ảnh khoảnh khắc: Upload trực tiếp từ thiết bị */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground block">
                Hình ảnh khoảnh khắc <span className="text-destructive">*</span>
              </label>

              {/* Upload Trigger Button */}
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
                      <span>Đang tải ảnh lên Cloudinary...</span>
                    </>
                  ) : (
                    <>
                      <ImagePlus className="h-4 w-4" />
                      <span>Chọn ảnh từ thiết bị</span>
                    </>
                  )}
                </button>
                <span className="text-[11px] text-muted-foreground">
                  (Hỗ trợ chọn nhiều ảnh JPG, PNG; tối đa 10MB/ảnh)
                </span>
              </div>

              {/* Uploaded Photos Preview Grid */}
              {mediaUrls.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                  {mediaUrls.map((url, idx) => {
                    const itemKey = `moment-img-${url}-${idx}`;
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
                        <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded backdrop-blur-xs">
                          {idx === 0 ? 'Ảnh bìa' : `#${idx + 1}`}
                        </span>
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

            {/* Mô tả / Cảm nghĩ khoảnh khắc */}
            <div>
              <label className="text-xs font-bold text-foreground mb-1 block">
                Mô tả / Cảm nghĩ khoảnh khắc
              </label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Chia sẻ khoảnh khắc đáng nhớ cùng nhóm..."
                rows={3}
                className="w-full rounded-xl border border-input bg-background p-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Row: Tọa độ GPS */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground block">
                  Tọa độ vị trí GPS (Tùy chọn)
                </label>
                <button
                  type="button"
                  disabled={isLocating}
                  onClick={handleGetCurrentLocation}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline disabled:opacity-50 cursor-pointer"
                  title="Lấy tọa độ vị trí hiện tại bằng GPS thiết bị"
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
                <div>
                  <AppInput
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="Vĩ độ (VD: 22.3033)"
                  />
                </div>
                <div>
                  <AppInput
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="Kinh độ (VD: 103.7753)"
                  />
                </div>
              </div>
            </div>

            {/* Visibility Option */}
            <div>
              <label className="text-xs font-bold text-foreground mb-1 block">
                Chế độ hiển thị
              </label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="GROUP_ONLY"
                    checked={visibility === 'GROUP_ONLY'}
                    onChange={() => setVisibility('GROUP_ONLY')}
                    className="text-primary"
                  />
                  <span>Chỉ trong nhóm ghép (Nội bộ)</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="PUBLIC_PROFILE"
                    checked={visibility === 'PUBLIC_PROFILE'}
                    onChange={() => setVisibility('PUBLIC_PROFILE')}
                    className="text-primary"
                  />
                  <span>Chia sẻ lên Trang cá nhân (Public)</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
              <AppButton type="button" variant="outline" onClick={handleCloseUploadModal}>
                Hủy
              </AppButton>
              <AppButton
                type="submit"
                variant="default"
                disabled={createMutation.isPending || isUploadingImage || mediaUrls.length === 0}
              >
                {createMutation.isPending ? 'Đang đăng tải...' : 'Đăng khoảnh khắc'}
              </AppButton>
            </div>
          </form>
        </div>
      </AppModalShell>

      {/* MODAL: HIDE MOMENT REASON */}
      <AppModalShell
        open={hideReasonModal.open}
        onClose={() => setHideReasonModal((prev) => ({ ...prev, open: false }))}
        className="max-w-lg"
        aria-label="Kiểm duyệt Ẩn Khoảnh Khắc Vi Phạm"
      >
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-foreground">
              Kiểm duyệt Ẩn Khoảnh Khắc Vi Phạm
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Nhập lý do ẩn khoảnh khắc này khỏi bảng tin nhóm. Bài viết sẽ chỉ hiển thị với Trưởng
              nhóm và Tác giả.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-foreground mb-1 block">
                Lý do ẩn bài viết *
              </label>
              <textarea
                value={hideReasonModal.reason}
                onChange={(e) =>
                  setHideReasonModal((prev) => ({ ...prev, reason: e.target.value }))
                }
                placeholder="VD: Hình ảnh không đúng chủ đề dã ngoại, nội dung phản cảm hoặc vi phạm quy định..."
                rows={3}
                className="w-full rounded-xl border border-input bg-background p-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <AppButton
                type="button"
                variant="outline"
                onClick={() => setHideReasonModal({ open: false, momentId: '', reason: '' })}
              >
                Hủy
              </AppButton>
              <AppButton
                type="button"
                variant="destructive"
                onClick={handleConfirmHide}
                disabled={hideMutation.isPending}
              >
                {hideMutation.isPending ? 'Đang xử lý...' : 'Xác nhận Ẩn'}
              </AppButton>
            </div>
          </div>
        </div>
      </AppModalShell>

      {/* MODAL: MOMENT DETAIL / PHOTO INSPECTOR */}
      {selectedMoment && (
        <AppModalShell
          open={Boolean(selectedMoment)}
          onClose={() => setSelectedMoment(null)}
          className="max-w-2xl"
          aria-label={selectedMoment.locationName || 'Chi tiết Khoảnh khắc'}
        >
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-foreground">
                {selectedMoment.locationName || 'Chi tiết Khoảnh khắc'}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Đăng bởi {selectedMoment.authorName} •{' '}
                {new Date(selectedMoment.createdAt).toLocaleDateString('vi-VN')}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 max-h-[60vh] overflow-y-auto pr-1">
              {selectedMoment.mediaList.map((m, idx) => (
                <div
                  key={m.momentMediaId || m.mediaId || `modal-media-${idx}`}
                  className="rounded-xl overflow-hidden bg-black/5"
                >
                  <img
                    src={m.imageUrl || m.mediaUrl}
                    alt="Moment full"
                    className="w-full h-auto object-contain max-h-96 mx-auto rounded-lg"
                  />
                </div>
              ))}
            </div>

            {selectedMoment.caption && (
              <p className="text-xs text-foreground leading-relaxed whitespace-pre-line p-3 bg-muted/20 rounded-xl border border-border/50">
                {selectedMoment.caption}
              </p>
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 font-bold text-rose-500">
                  <Heart className="h-4 w-4" /> {selectedMoment.likesCount} yêu thích
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" /> {selectedMoment.commentsCount} bình luận
                </span>
              </div>
              {selectedMoment.altitude && (
                <span className="font-mono text-primary font-bold">{selectedMoment.altitude}</span>
              )}
            </div>
          </div>
        </AppModalShell>
      )}

      {/* MODAL: SINGLE PHOTO PREVIEW */}
      {previewImageUrl && (
        <AppModalShell
          open={Boolean(previewImageUrl)}
          onClose={() => setPreviewImageUrl(null)}
          className="max-w-3xl p-2 bg-black/90 border-zinc-800"
          aria-label="Xem ảnh kích thước lớn"
        >
          <div className="relative flex flex-col items-center justify-center p-2">
            <img
              src={previewImageUrl}
              alt="Preview full"
              className="max-h-[80vh] w-auto object-contain rounded-lg"
            />
          </div>
        </AppModalShell>
      )}
    </div>
  );
}
