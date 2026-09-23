
export type HikingExperienceLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

export type HikingPreferredDifficulty = 'EASY' | 'MODERATE' | 'HARD' | 'EXTREME';

interface LevelMeta {
  label: string;

  hint: string;

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

export const HIKING_BIO_MAX_LENGTH = 2_000;
export const HIKING_PREFERRED_AREAS_MAX = 20;
export const HIKING_SKILLS_MAX = 30;

export const HIKING_TAG_MAX_LENGTH = 60;

export const HIKING_PREFERRED_AREA_SUGGESTIONS = [
  'Tây Bắc',
  'Đông Bắc',
  'Sa Pa',
  'Hà Giang',
  'Lâm Đồng',
  'Tây Nguyên',
];

export const HIKING_SKILL_SUGGESTIONS = [
  'Sơ cứu',
  'Định vị bản đồ',
  'Dựng lều',
  'Nấu ăn dã ngoại',
  'Leo dây',
  'Chụp ảnh',
];
