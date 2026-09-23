import { Loader2, Navigation } from 'lucide-react';
import type { FormEvent } from 'react';
import { AppButton, AppImageUploadGallery, AppInput, AppModalShell } from '@/shared/ui';
import { toast } from '@/store/useToastStore';
import {
  MOMENT_MAX_IMAGE_LABEL,
  MOMENT_MAX_IMAGE_MB,
  MOMENT_UPLOAD_FOLDER,
  type MomentVisibilityOption,
} from '../constants';
import { useMomentComposer } from '../hooks/useMomentComposer';
import type { MomentCreatePayload, MomentVisibility } from '../types';

interface MomentComposerModalProps {
  open: boolean;
  onClose: () => void;
  description: string;
  visibilityOptions: MomentVisibilityOption[];
  defaultVisibility: MomentVisibility;
  isSubmitting: boolean;

  onSubmit: (payload: MomentCreatePayload) => Promise<unknown>;
}

export function MomentComposerModal({
  open,
  onClose,
  description,
  visibilityOptions,
  defaultVisibility,
  isSubmitting,
  onSubmit,
}: MomentComposerModalProps) {
  const composer = useMomentComposer({ defaultVisibility });

  const handleClose = () => {
    composer.discardUploads();
    composer.resetFields();
    onClose();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const payload = composer.buildPayload();
    if (payload.mediaUrls.length === 0) {
      toast.error('Vui lòng tải lên ít nhất 1 hình ảnh cho khoảnh khắc!');
      return;
    }

    try {
      await onSubmit(payload);
      composer.commitUploads();
      composer.resetFields();
      onClose();
    } catch {}
  };

  const isBusy = isSubmitting || composer.isUploadingImage;

  return (
    <AppModalShell
      open={open}
      onClose={handleClose}
      className="max-w-xl"
      aria-label="Đăng khoảnh khắc mới"
    >
      <div className="space-y-4">
        <div>
          <h3 className="font-extrabold text-base text-foreground">Đăng Khoảnh Khắc Mới</h3>
          <p className="mt-0.5 text-muted-foreground text-xs">{description}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AppImageUploadGallery
            label={
              <>
                Hình ảnh khoảnh khắc <span className="text-destructive">*</span>
              </>
            }
            value={composer.mediaUrls}
            onChange={composer.setMediaUrls}
            folder={MOMENT_UPLOAD_FOLDER}
            cleanup={composer.mediaCleanup}
            maxSizeMb={MOMENT_MAX_IMAGE_MB}
            onUploadingChange={composer.setIsUploadingImage}
            showCoverBadge
            hint={`Ảnh đầu tiên là ảnh bìa. Chọn được nhiều ảnh JPG/PNG, tối đa ${MOMENT_MAX_IMAGE_LABEL}/ảnh.`}
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block font-bold text-foreground text-xs">
                Địa điểm check-in
              </span>
              <AppInput
                value={composer.locationName}
                onChange={(event) => composer.setLocationName(event.target.value)}
                placeholder="VD: Đỉnh Fansipan, Rừng trúc Y Tý..."
              />
            </label>
            <label className="block">
              <span className="mb-1 block font-bold text-foreground text-xs">
                Độ cao (tùy chọn)
              </span>
              <AppInput
                value={composer.altitude}
                onChange={(event) => composer.setAltitude(event.target.value)}
                placeholder="VD: 3.143m, 2.860m..."
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block font-bold text-foreground text-xs">
              Mô tả / Cảm nghĩ khoảnh khắc
            </span>
            <textarea
              value={composer.caption}
              onChange={(event) => composer.setCaption(event.target.value)}
              placeholder="Chia sẻ cảm xúc, câu chuyện trên đường leo núi..."
              rows={3}
              className="w-full rounded-xl border border-input bg-background p-3 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </label>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="block font-bold text-foreground text-xs">Tọa độ GPS (tùy chọn)</span>
              <button
                type="button"
                disabled={composer.isLocating}
                onClick={composer.fillCurrentLocation}
                className="inline-flex cursor-pointer items-center gap-1.5 font-bold text-primary text-xs hover:underline disabled:opacity-50"
              >
                {composer.isLocating ? (
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

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <AppInput
                type="number"
                step="any"
                value={composer.latitude}
                onChange={(event) => composer.setLatitude(event.target.value)}
                placeholder="Vĩ độ (VD: 22.3033)"
                aria-label="Vĩ độ"
              />
              <AppInput
                type="number"
                step="any"
                value={composer.longitude}
                onChange={(event) => composer.setLongitude(event.target.value)}
                placeholder="Kinh độ (VD: 103.7750)"
                aria-label="Kinh độ"
              />
            </div>
          </div>

          <fieldset className="space-y-1">
            <legend className="mb-1 font-bold text-foreground text-xs">Quyền hiển thị</legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {visibilityOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-border p-2.5 font-medium text-xs hover:bg-muted/40"
                >
                  <input
                    type="radio"
                    name="momentVisibility"
                    value={option.value}
                    checked={composer.visibility === option.value}
                    onChange={() => composer.setVisibility(option.value)}
                    className="text-primary"
                  />
                  <span>
                    <span className="block font-bold text-foreground">{option.label}</span>
                    <span className="block text-[10px] text-muted-foreground">
                      {option.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex justify-end gap-2 border-border border-t pt-3">
            <AppButton
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Hủy
            </AppButton>
            <AppButton type="submit" size="sm" disabled={isBusy || composer.mediaUrls.length === 0}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
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
  );
}
