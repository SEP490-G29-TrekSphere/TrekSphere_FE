import type { HikingExperienceLevel, HikingPreferredDifficulty } from '@/constants';

/**
 * Types riêng cho feature profile.
 * Lưu ý: UserProfile / UpdateProfilePayload nằm trong features/auth/types.ts
 * vì chúng là payload của auth service. Ở đây chỉ chứa các type UI-only.
 */
export interface ProfileStat {
  label: string;
  value: string | number;
}

export const GENDER_LABELS: Record<'male' | 'female' | 'other', string> = {
  male: 'Nam',
  female: 'Nữ',
  other: 'Khác',
};

/** Giới tính theo đúng enum BE trả về (khác `GENDER_LABELS` đang dùng key lowercase). */
export type HikingSummaryGender = 'MALE' | 'FEMALE' | 'OTHER';

/** Nhãn giới tính theo enum BE — dùng khi hiển thị dữ liệu chưa qua `normalizeProfile`. */
export const GENDER_API_LABELS: Record<HikingSummaryGender, string> = {
  MALE: 'Nam',
  FEMALE: 'Nữ',
  OTHER: 'Khác',
};

/**
 * Phần hồ sơ leo núi dùng để hiển thị — tập field chung giữa `UserProfile`
 * (`GET /users/me`) và `PublicHikingSummary` (`GET /users/{id}/hiking-summary`),
 * nên một component view phục vụ được cả hồ sơ của mình lẫn hồ sơ người khác.
 */
export interface HikingProfileView {
  bio?: string;
  experienceLevel?: HikingExperienceLevel;
  preferredDifficulty?: HikingPreferredDifficulty;
  preferredAreas?: string[];
  skills?: string[];
  trustScore?: number;
  trustReviewCount?: number;
}

/**
 * Hồ sơ leo núi công khai — `GET /users/{userId}/hiking-summary`.
 *
 * Đây là phần "thông tin nâng cao" của một Trekker mà người khác được phép xem:
 * kinh nghiệm, sở thích cung đường, kỹ năng và điểm uy tín. BE đã lọc sẵn, KHÔNG
 * chứa email / số điện thoại / ngày sinh / thông tin y tế.
 */
export interface PublicHikingSummary {
  userId: string;
  fullName: string;
  avatarUrl?: string;
  gender?: HikingSummaryGender;
  bio?: string;
  experienceLevel?: HikingExperienceLevel;
  preferredDifficulty?: HikingPreferredDifficulty;
  preferredAreas?: string[];
  skills?: string[];
  trustScore?: number;
  trustReviewCount?: number;
}
