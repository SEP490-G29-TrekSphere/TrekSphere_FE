import { useCallback, useState } from 'react';
import { useImageUploadCleanup } from '@/shared/ui';
import { toast } from '@/store/useToastStore';
import { MOMENT_GEOLOCATION_OPTIONS } from '../constants';
import type { MomentCreatePayload, MomentVisibility } from '../types';

interface UseMomentComposerOptions {
  defaultVisibility: MomentVisibility;
}

/**
 * Gom toàn bộ state của form "Đăng khoảnh khắc": ảnh đã upload, thông tin check-in,
 * tọa độ GPS và quyền hiển thị.
 *
 * Phần ảnh dùng cơ chế upload chung của app (`AppImageUploadGallery` +
 * `useImageUploadCleanup`): ảnh upload ngay khi chọn, URL vừa upload mà người dùng
 * gỡ đi hoặc hủy modal sẽ bị xóa khỏi storage.
 */
export function useMomentComposer({ defaultVisibility }: UseMomentComposerOptions) {
  const [caption, setCaption] = useState('');
  const [locationName, setLocationName] = useState('');
  const [altitude, setAltitude] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [visibility, setVisibility] = useState<MomentVisibility>(defaultVisibility);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const mediaCleanup = useImageUploadCleanup();

  const resetFields = useCallback(() => {
    setCaption('');
    setLocationName('');
    setAltitude('');
    setLatitude('');
    setLongitude('');
    setVisibility(defaultVisibility);
    setMediaUrls([]);
  }, [defaultVisibility]);

  /** Người dùng đóng form giữa chừng → xóa các ảnh đã lỡ upload để không rác storage. */
  const discardUploads = mediaCleanup.discard;

  /** Gửi thành công → các ảnh đã thuộc về khoảnh khắc, không được xóa nữa. */
  const commitUploads = mediaCleanup.commit;

  const fillCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Trình duyệt của bạn không hỗ trợ định vị GPS.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
        if (position.coords.altitude !== null && position.coords.altitude !== undefined) {
          setAltitude(`${Math.round(position.coords.altitude)}m`);
        }
        setIsLocating(false);
        toast.success('Đã lấy tọa độ GPS hiện tại thành công!');
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          toast.error('Bạn đã từ chối quyền truy cập vị trí GPS của trình duyệt.');
        } else if (error.code === error.TIMEOUT) {
          toast.error('Quá thời gian lấy vị trí GPS. Vui lòng thử lại!');
        } else {
          toast.error('Không thể lấy vị trí hiện tại. Vui lòng kiểm tra GPS thiết bị.');
        }
      },
      MOMENT_GEOLOCATION_OPTIONS
    );
  }, []);

  const buildPayload = useCallback((): MomentCreatePayload => {
    return {
      caption: caption.trim() || undefined,
      locationName: locationName.trim() || undefined,
      altitude: altitude.trim() || undefined,
      latitude: latitude ? Number.parseFloat(latitude) : undefined,
      longitude: longitude ? Number.parseFloat(longitude) : undefined,
      visibility,
      mediaUrls: mediaUrls.filter((url) => url.trim().length > 0),
    };
  }, [altitude, caption, latitude, locationName, longitude, mediaUrls, visibility]);

  return {
    caption,
    setCaption,
    locationName,
    setLocationName,
    altitude,
    setAltitude,
    latitude,
    setLatitude,
    longitude,
    setLongitude,
    visibility,
    setVisibility,
    mediaUrls,
    setMediaUrls,
    mediaCleanup,
    isUploadingImage,
    setIsUploadingImage,
    isLocating,
    fillCurrentLocation,
    buildPayload,
    resetFields,
    discardUploads,
    commitUploads,
  };
}
