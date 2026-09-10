import { z } from 'zod';
import {
  CHECKLIST_ITEM_NAME_MAX_LENGTH,
  CHECKLIST_NOTE_MAX_LENGTH,
  CHECKPOINT_DESCRIPTION_MAX_LENGTH,
  CHECKPOINT_LOCATION_MAX_LENGTH,
  CHECKPOINT_TITLE_MAX_LENGTH,
  COMMENT_CONTENT_MAX_LENGTH,
  POST_CONTENT_MAX_LENGTH,
  POST_TITLE_MAX_LENGTH,
  POST_TITLE_MIN_LENGTH,
} from '../constants/workspace';

// ==================== CHECKPOINT SCHEMAS ====================
export const checkpointFormSchema = z.object({
  dayNo: z.number().min(1, 'Ngày phải từ 1 trở lên').optional().nullable(),
  checkpointOrder: z.number().min(0, 'Thứ tự không được âm'),
  title: z
    .string()
    .trim()
    .min(1, 'Tên điểm dừng không được để trống')
    .max(CHECKPOINT_TITLE_MAX_LENGTH, `Tên điểm dừng tối đa ${CHECKPOINT_TITLE_MAX_LENGTH} ký tự`),
  description: z
    .string()
    .trim()
    .max(
      CHECKPOINT_DESCRIPTION_MAX_LENGTH,
      `Mô tả tối đa ${CHECKPOINT_DESCRIPTION_MAX_LENGTH} ký tự`
    )
    .optional()
    .nullable(),
  locationName: z
    .string()
    .trim()
    .max(CHECKPOINT_LOCATION_MAX_LENGTH, `Địa điểm tối đa ${CHECKPOINT_LOCATION_MAX_LENGTH} ký tự`)
    .optional()
    .nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  plannedStartAt: z.string().optional().nullable(),
  plannedEndAt: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
});

export type CheckpointFormValues = z.infer<typeof checkpointFormSchema>;

// ==================== ACTIVITY SCHEMAS ====================
export const activityFormSchema = z.object({
  dayNo: z.number().min(1, 'Ngày phải từ 1 trở lên'),
  timeSlot: z.enum(['MORNING', 'NOON', 'AFTERNOON', 'EVENING'], {
    message: 'Vui lòng chọn buổi hợp lệ (Sáng, Trưa, Chiều, Tối)',
  }),
  activityOrder: z.number().min(1, 'Thứ tự phải từ 1 trở lên').optional().nullable(),
  title: z
    .string()
    .trim()
    .min(1, 'Tên hoạt động không được để trống')
    .max(255, 'Tên hoạt động tối đa 255 ký tự'),
  description: z.string().trim().max(1000, 'Mô tả tối đa 1000 ký tự').optional().nullable(),
  plannedStartAt: z.string().optional().nullable(),
  plannedEndAt: z.string().optional().nullable(),
  checkpointId: z.string().optional().nullable(),
});

export type ActivityFormValues = z.infer<typeof activityFormSchema>;

// ==================== CHECKLIST SCHEMAS ====================
export const checklistItemFormSchema = z.object({
  category: z.enum(['SHARED', 'PERSONAL'], {
    message: 'Vui lòng chọn danh mục hợp lệ (SHARED hoặc PERSONAL)',
  }),
  itemType: z.enum(['GEAR', 'MEDICINE', 'FOOD', 'DOCUMENT', 'OTHER'], {
    message: 'Vui lòng chọn loại đồ dùng hợp lệ',
  }),
  itemName: z
    .string()
    .trim()
    .min(1, 'Tên đồ dùng/nhiệm vụ không được để trống')
    .max(CHECKLIST_ITEM_NAME_MAX_LENGTH, `Tên tối đa ${CHECKLIST_ITEM_NAME_MAX_LENGTH} ký tự`),
  isRequired: z.boolean().default(false),
  note: z
    .string()
    .trim()
    .max(CHECKLIST_NOTE_MAX_LENGTH, `Ghi chú tối đa ${CHECKLIST_NOTE_MAX_LENGTH} ký tự`)
    .optional()
    .nullable(),
  assigneeMemberId: z.string().optional().nullable(),
});

export type ChecklistItemFormValues = z.infer<typeof checklistItemFormSchema>;

// ==================== GROUP POST & COMMENT SCHEMAS ====================
export const groupPostFormSchema = z.object({
  postType: z.enum(['ANNOUNCEMENT', 'DISCUSSION', 'QUESTION', 'GENERAL'], {
    message: 'Vui lòng chọn loại bài viết hợp lệ',
  }),
  title: z
    .string()
    .trim()
    .min(POST_TITLE_MIN_LENGTH, `Tiêu đề tối thiểu ${POST_TITLE_MIN_LENGTH} ký tự`)
    .max(POST_TITLE_MAX_LENGTH, `Tiêu đề tối đa ${POST_TITLE_MAX_LENGTH} ký tự`),
  content: z
    .string()
    .trim()
    .min(1, 'Nội dung bài viết không được để trống')
    .max(POST_CONTENT_MAX_LENGTH, `Nội dung tối đa ${POST_CONTENT_MAX_LENGTH} ký tự`),
  isPinned: z.boolean().default(false),
});

export type GroupPostFormValues = z.infer<typeof groupPostFormSchema>;

export const groupPostCommentFormSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'Nội dung bình luận không được để trống')
    .max(COMMENT_CONTENT_MAX_LENGTH, `Bình luận tối đa ${COMMENT_CONTENT_MAX_LENGTH} ký tự`),
});

export type GroupPostCommentFormValues = z.infer<typeof groupPostCommentFormSchema>;
