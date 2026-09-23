import type { MomentScope, MomentVisibility } from './types';

/** Giới hạn dung lượng mỗi ảnh khi đăng khoảnh khắc. */
export const MOMENT_MAX_IMAGE_MB = 10;
export const MOMENT_MAX_IMAGE_LABEL = `${MOMENT_MAX_IMAGE_MB}MB`;

/** Thư mục lưu trữ trên dịch vụ upload. */
export const MOMENT_UPLOAD_FOLDER = 'moments';

/** Số ảnh tối đa hiển thị trong lưới gallery trước khi gộp thành "+N ảnh". */
export const MOMENT_GALLERY_PREVIEW_LIMIT = 4;

export const MOMENT_GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10_000,
  maximumAge: 0,
};

export interface MomentVisibilityOption {
  value: MomentVisibility;
  label: string;
  description: string;
}

/** Khoảnh khắc đăng trong workspace nhóm ghép. */
export const GROUP_MOMENT_VISIBILITY_OPTIONS: MomentVisibilityOption[] = [
  {
    value: 'GROUP_ONLY',
    label: '👥 Chỉ trong nhóm',
    description: 'Chỉ thành viên nhóm ghép xem được',
  },
  {
    value: 'PUBLIC_PROFILE',
    label: '🌐 Công khai hồ sơ',
    description: 'Hiển thị thêm trên trang cá nhân',
  },
];

/** Khoảnh khắc đăng từ trang hồ sơ cá nhân. */
export const PERSONAL_MOMENT_VISIBILITY_OPTIONS: MomentVisibilityOption[] = [
  {
    value: 'PUBLIC_PROFILE',
    label: '🌐 Công khai hồ sơ',
    description: 'Mọi người đều xem được',
  },
  {
    value: 'ONLY_ME',
    label: '🔒 Chỉ mình tôi',
    description: 'Riêng tư trên tài khoản',
  },
];

export const MOMENT_VISIBILITY_LABELS: Record<MomentVisibility, string> = {
  GROUP_ONLY: 'Chỉ trong nhóm',
  PUBLIC_PROFILE: 'Công khai hồ sơ',
  ONLY_ME: 'Chỉ mình tôi',
};

/**
 * Cặp quyền hiển thị được đổi qua lại theo ngữ cảnh: trong nhóm là
 * "chỉ trong nhóm ↔ công khai", còn ở hồ sơ cá nhân là "riêng tư ↔ công khai".
 */
export const MOMENT_VISIBILITY_TOGGLE: Record<
  MomentScope,
  { restricted: MomentVisibility; publicValue: MomentVisibility }
> = {
  group: { restricted: 'GROUP_ONLY', publicValue: 'PUBLIC_PROFILE' },
  personal: { restricted: 'ONLY_ME', publicValue: 'PUBLIC_PROFILE' },
};
