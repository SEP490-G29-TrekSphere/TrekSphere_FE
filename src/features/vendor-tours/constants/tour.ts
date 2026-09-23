import type { ApiScheduleStatus } from '../types';

export type FormDifficulty = 'EASY' | 'MODERATE' | 'HARD' | 'EXTREME';

export const DIFFICULTY_OPTIONS: Array<{ value: FormDifficulty; label: string }> = [
  { value: 'EASY', label: 'Dễ' },
  { value: 'MODERATE', label: 'Vừa' },
  { value: 'HARD', label: 'Khó' },
  { value: 'EXTREME', label: 'Cực khó' },
];

export const SCHEDULE_STATUS_OPTIONS: Array<{ value: ApiScheduleStatus; label: string }> = [
  { value: 'OPEN', label: 'Đang mở' },
  { value: 'CLOSED', label: 'Đã đóng' },
  { value: 'COMPLETED', label: 'Đã hoàn thành' },
];

export const MAX_COVER_SIZE_MB = 5;
