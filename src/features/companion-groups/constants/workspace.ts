import type {
  GroupChecklistItemType,
  GroupChecklistStatus,
  GroupPostType,
  TimeSlot,
} from '../types/workspace';

// ==================== CHECKLIST CONSTANTS ====================
export const CHECKLIST_ITEM_NAME_MAX_LENGTH = 100;
export const CHECKLIST_NOTE_MAX_LENGTH = 500;

export const CHECKLIST_CATEGORY_OPTIONS = [
  { value: 'ALL', label: 'Tất cả danh mục' },
  { value: 'SHARED', label: 'Đồ dùng chung' },
  { value: 'PERSONAL', label: 'Cá nhân của tôi' },
] as const;

export const CHECKLIST_ITEM_TYPE_OPTIONS: ReadonlyArray<{
  value: GroupChecklistItemType;
  label: string;
}> = [
  { value: 'GEAR', label: 'Trang thiết bị' },
  { value: 'MEDICINE', label: 'Thuốc men / Y tế' },
  { value: 'FOOD', label: 'Thực phẩm / Nước uống' },
  { value: 'DOCUMENT', label: 'Giấy tờ / Thủ tục' },
  { value: 'OTHER', label: 'Khác' },
] as const;

export const CHECKLIST_STATUS_META: Record<
  GroupChecklistStatus,
  { label: string; variant: 'default' | 'outline' | 'secondary' | 'success' | 'warning' }
> = {
  PENDING: { label: 'Chưa chuẩn bị', variant: 'warning' },
  DONE: { label: 'Đã chuẩn bị', variant: 'success' },
};

// ==================== FEED & POST CONSTANTS ====================
export const POST_TITLE_MIN_LENGTH = 3;
export const POST_TITLE_MAX_LENGTH = 150;
export const POST_CONTENT_MAX_LENGTH = 3_000;
export const COMMENT_CONTENT_MAX_LENGTH = 1_000;
export const GROUP_POSTS_PAGE_SIZE = 10;

export const POST_TYPE_META: Record<
  GroupPostType,
  { label: string; color: string; bgClass: string; textClass: string; borderClass: string }
> = {
  ANNOUNCEMENT: {
    label: 'Thông báo quan trọng',
    color: '#ef4444',
    bgClass: 'bg-red-500/10 dark:bg-red-500/20',
    textClass: 'text-red-600 dark:text-red-400',
    borderClass: 'border-red-500/30',
  },
  DISCUSSION: {
    label: 'Thảo luận',
    color: '#3b82f6',
    bgClass: 'bg-blue-500/10 dark:bg-blue-500/20',
    textClass: 'text-blue-600 dark:text-blue-400',
    borderClass: 'border-blue-500/30',
  },
  QUESTION: {
    label: 'Hỏi đáp / Q&A',
    color: '#f59e0b',
    bgClass: 'bg-amber-500/10 dark:bg-amber-500/20',
    textClass: 'text-amber-600 dark:text-amber-400',
    borderClass: 'border-amber-500/30',
  },
  GENERAL: {
    label: 'Chung',
    color: '#6b7280',
    bgClass: 'bg-muted',
    textClass: 'text-muted-foreground',
    borderClass: 'border-border',
  },
};

export const POST_TYPE_OPTIONS: ReadonlyArray<{
  value: GroupPostType;
  label: string;
  leaderOnly?: boolean;
}> = [
  { value: 'DISCUSSION', label: 'Thảo luận chuyến đi' },
  { value: 'QUESTION', label: 'Hỏi đáp / Thắc mắc' },
  { value: 'GENERAL', label: 'Chia sẻ chung' },
  { value: 'ANNOUNCEMENT', label: 'Thông báo quan trọng (Chỉ Leader)', leaderOnly: true },
] as const;

// ==================== CHECKPOINT CONSTANTS ====================
export const CHECKPOINT_TITLE_MAX_LENGTH = 120;
export const CHECKPOINT_DESCRIPTION_MAX_LENGTH = 1_000;
export const CHECKPOINT_LOCATION_MAX_LENGTH = 200;

// ==================== ACTIVITY & TIME SLOT CONSTANTS ====================
export const ACTIVITY_TITLE_MAX_LENGTH = 255;
export const ACTIVITY_DESCRIPTION_MAX_LENGTH = 1_000;

export const TIME_SLOT_OPTIONS: ReadonlyArray<{
  value: TimeSlot;
  label: string;
  time: string;
}> = [
  { value: 'MORNING', label: 'Buổi Sáng', time: '06:00 - 11:30' },
  { value: 'NOON', label: 'Buổi Trưa', time: '11:30 - 13:30' },
  { value: 'AFTERNOON', label: 'Buổi Chiều', time: '13:30 - 18:00' },
  { value: 'EVENING', label: 'Buổi Tối', time: '18:00 - 22:00' },
] as const;

export type TimeSlotKey = 'morning' | 'noon' | 'afternoon' | 'evening';

export const TIMETABLE_TIME_SLOTS: ReadonlyArray<{
  id: TimeSlotKey;
  slotEnum: TimeSlot;
  label: string;
  time: string;
}> = [
  { id: 'morning', slotEnum: 'MORNING', label: 'SÁNG', time: '06:00 - 11:30' },
  { id: 'noon', slotEnum: 'NOON', label: 'TRƯA', time: '11:30 - 13:30' },
  { id: 'afternoon', slotEnum: 'AFTERNOON', label: 'CHIỀU', time: '13:30 - 18:00' },
  { id: 'evening', slotEnum: 'EVENING', label: 'TỐI', time: '18:00 - 22:00' },
] as const;
