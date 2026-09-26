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
  TIME_SLOT_BOUNDARIES,
} from '../constants/workspace';
import type {
  CustomJourneyActivityResponse,
  CustomJourneyCheckpointResponse,
} from '../types/workspace';

function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function extractTimeHHmm(value: string | null | undefined): string | null {
  if (!value) return null;
  const match = value.match(/(\d{2}:\d{2})/);
  return match ? match[1] : null;
}

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
const activityBaseObjectSchema = z.object({
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
  plannedStartAt: z
    .string()
    .min(1, 'Vui lòng chọn giờ bắt đầu')
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Giờ bắt đầu phải có định dạng HH:mm'),
  plannedEndAt: z
    .string()
    .min(1, 'Vui lòng chọn giờ kết thúc')
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Giờ kết thúc phải có định dạng HH:mm'),
  checkpointId: z.string().optional().nullable(),
});

/**
 * Validate giờ hoạt động theo đúng rule của backend (CustomJourneyServiceImpl):
 * - Nếu hoạt động gắn với 1 chặng (checkpoint) có đủ plannedStartAt/plannedEndAt,
 *   giờ hoạt động phải nằm trong khung giờ THỰC TẾ của chặng đó (có thể vắt ngang nhiều buổi).
 * - Nếu không gắn chặng (hoặc chặng chưa có giờ cụ thể), fallback về khung giờ cố định
 *   của buổi (TIME_SLOT_BOUNDARIES) làm giá trị mặc định/hướng dẫn.
 */
export function buildActivityFormSchema(
  checkpoints: CustomJourneyCheckpointResponse[] = [],
  activities: CustomJourneyActivityResponse[] = [],
  currentActivityId?: string
) {
  return activityBaseObjectSchema.superRefine((data, ctx) => {
    const startMin = timeToMinutes(data.plannedStartAt);
    const endMin = timeToMinutes(data.plannedEndAt);

    if (startMin >= endMin) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['plannedEndAt'],
        message: 'Giờ kết thúc phải sau giờ bắt đầu',
      });
      return;
    }

    const conflict = activities.find((a) => {
      const activityId = a.customJourneyActivityId || a.id;
      if (currentActivityId && activityId === currentActivityId) return false;
      if (a.dayNo !== data.dayNo) return false;
      const existingStart = extractTimeHHmm(a.plannedStartAt);
      const existingEnd = extractTimeHHmm(a.plannedEndAt);
      if (!existingStart || !existingEnd) return false;
      const exStartMin = timeToMinutes(existingStart);
      const exEndMin = timeToMinutes(existingEnd);
      return startMin < exEndMin && exStartMin < endMin;
    });

    if (conflict) {
      const message = `Thời gian hoạt động bị trùng với hoạt động "${conflict.title}" (${extractTimeHHmm(conflict.plannedStartAt)} - ${extractTimeHHmm(conflict.plannedEndAt)})`;
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['plannedStartAt'], message });
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['plannedEndAt'], message });
      return;
    }

    const linkedCheckpoint = data.checkpointId
      ? checkpoints.find((cp) => (cp.customJourneyCheckpointId || cp.id) === data.checkpointId)
      : null;

    const checkpointStart = extractTimeHHmm(linkedCheckpoint?.plannedStartAt);
    const checkpointEnd = extractTimeHHmm(linkedCheckpoint?.plannedEndAt);

    if (linkedCheckpoint && checkpointStart && checkpointEnd) {
      const checkpointStartMin = timeToMinutes(checkpointStart);
      const checkpointEndMin = timeToMinutes(checkpointEnd);

      if (startMin < checkpointStartMin || endMin > checkpointEndMin) {
        const message = `Thời gian hoạt động phải nằm trong khoảng thời gian của chặng "${linkedCheckpoint.title}" (${checkpointStart} - ${checkpointEnd})`;
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['plannedStartAt'], message });
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['plannedEndAt'], message });
      }
      return;
    }

    const boundary = TIME_SLOT_BOUNDARIES[data.timeSlot];
    if (!boundary) return;

    const boundaryStartMin = timeToMinutes(boundary.start);
    const boundaryEndMin = timeToMinutes(boundary.end);

    if (startMin < boundaryStartMin || startMin > boundaryEndMin) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['plannedStartAt'],
        message: `Giờ bắt đầu của ${boundary.label} phải từ ${boundary.start} đến ${boundary.end}`,
      });
    }

    if (endMin < boundaryStartMin || endMin > boundaryEndMin) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['plannedEndAt'],
        message: `Giờ kết thúc của ${boundary.label} phải từ ${boundary.start} đến ${boundary.end}`,
      });
    }
  });
}

export type ActivityFormValues = z.infer<typeof activityBaseObjectSchema>;

// ==================== CHECKLIST SCHEMAS ====================
export const checklistItemFormSchema = z.object({
  category: z.enum(['SHARED', 'PERSONAL'], {
    message: 'Vui lòng chọn danh mục hợp lệ (SHARED hoặc PERSONAL)',
  }),
  itemType: z.enum(['CLOTHING', 'TENT', 'MEDICAL', 'ELECTRONICS', 'OTHER'], {
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
  isPinned: z.boolean(),
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
