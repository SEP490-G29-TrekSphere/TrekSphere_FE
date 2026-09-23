/**
 * Enum, nhãn hiển thị và giới hạn của phần "hồ sơ leo núi" trong profile người dùng.
 *
 * Dùng chung cho nhiều feature (profile, companion-groups, validation của auth)
 * nên đặt ở constants toàn cục thay vì trong một feature cụ thể.
 * Giá trị enum khớp đúng với BE (`UserProfileResponse` / `UpdateProfileRequest`).
 */

export type HikingExperienceLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

export type HikingPreferredDifficulty = 'EASY' | 'MODERATE' | 'HARD' | 'EXTREME';

interface LevelMeta {
  label: string;
  /** Mô tả ngắn dùng cho dropdown khi chỉnh sửa hồ sơ. */
  hint: string;
  /** Class badge (nền + chữ + viền) theo token của theme. */
  className: string;
}

export const HIKING_EXPERIENCE_LEVEL_META = {
  BEGINNER: {
    label: 'Người mới',
    hint: 'Mới bắt đầu, đã đi vài cung dễ',
    className: 'bg-sky-500/10 text-sky-600 border-sky-500/30',
  },
  INTERMEDIATE: {
    label: 'Trung cấp',
    hint: 'Đi đều, quen cung 2 ngày 1 đêm',
    className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  },
  ADVANCED: {
    label: 'Nâng cao',
    hint: 'Thạo địa hình khó, biết dẫn đoàn nhỏ',
    className: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  },
  EXPERT: {
    label: 'Chuyên gia',
    hint: 'Kinh nghiệm dày, xử lý được tình huống khẩn cấp',
    className: 'bg-destructive/10 text-destructive border-destructive/30',
  },
} as const satisfies Record<HikingExperienceLevel, LevelMeta>;

export const HIKING_PREFERRED_DIFFICULTY_LABELS = {
  EASY: 'Dễ',
  MODERATE: 'Vừa phải',
  HARD: 'Thử thách',
  EXTREME: 'Khắc nghiệt',
} as const satisfies Record<HikingPreferredDifficulty, string>;

export const HIKING_EXPERIENCE_LEVEL_OPTIONS = (
  Object.keys(HIKING_EXPERIENCE_LEVEL_META) as HikingExperienceLevel[]
).map((value) => ({
  value,
  label: `${HIKING_EXPERIENCE_LEVEL_META[value].label} — ${HIKING_EXPERIENCE_LEVEL_META[value].hint}`,
}));

export const HIKING_PREFERRED_DIFFICULTY_OPTIONS = (
  Object.keys(HIKING_PREFERRED_DIFFICULTY_LABELS) as HikingPreferredDifficulty[]
).map((value) => ({ value, label: HIKING_PREFERRED_DIFFICULTY_LABELS[value] }));

/** Giới hạn của `UpdateProfileRequest` phía BE — FE chặn trước để không bị 400. */
export const HIKING_BIO_MAX_LENGTH = 2_000;
export const HIKING_PREFERRED_AREAS_MAX = 20;
export const HIKING_SKILLS_MAX = 30;
/** BE không giới hạn độ dài từng tag; chặn ở FE để tránh tag dài phá vỡ layout. */
export const HIKING_TAG_MAX_LENGTH = 60;

/** Gợi ý nhập nhanh cho ô khu vực ưa thích. */
export const HIKING_PREFERRED_AREA_SUGGESTIONS = [
  'Tây Bắc',
  'Đông Bắc',
  'Sa Pa',
  'Hà Giang',
  'Lâm Đồng',
  'Tây Nguyên',
];

/** Gợi ý nhập nhanh cho ô kỹ năng. */
export const HIKING_SKILL_SUGGESTIONS = [
  'Sơ cứu',
  'Định vị bản đồ',
  'Dựng lều',
  'Nấu ăn dã ngoại',
  'Leo dây',
  'Chụp ảnh',
];
