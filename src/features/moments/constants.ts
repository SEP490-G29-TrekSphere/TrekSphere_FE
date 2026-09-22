import type { MomentScope, MomentVisibility } from './types';

export const MOMENT_MAX_IMAGE_MB = 10;
export const MOMENT_MAX_IMAGE_LABEL = `${MOMENT_MAX_IMAGE_MB}MB`;

export const MOMENT_UPLOAD_FOLDER = 'moments';

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

export const MOMENT_VISIBILITY_TOGGLE: Record<
  MomentScope,
  { restricted: MomentVisibility; publicValue: MomentVisibility }
> = {
  group: { restricted: 'GROUP_ONLY', publicValue: 'PUBLIC_PROFILE' },
  personal: { restricted: 'ONLY_ME', publicValue: 'PUBLIC_PROFILE' },
};
