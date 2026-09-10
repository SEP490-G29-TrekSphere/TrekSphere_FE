import { z } from 'zod';
import {
  MATCHING_GROUP_DEFAULT_SIZE,
  MATCHING_GROUP_DESCRIPTION_MAX_LENGTH,
  MATCHING_GROUP_MAX_SIZE,
  MATCHING_GROUP_MIN_SIZE,
  MATCHING_GROUP_NAME_MAX_LENGTH,
  MATCHING_GROUP_NAME_MIN_LENGTH,
} from '../constants';

export const createMatchingGroupSchema = z
  .object({
    sourceType: z.enum(['CUSTOM_JOURNEY', 'TOUR']).default('CUSTOM_JOURNEY'),
    tourId: z.string().optional(),
    groupName: z
      .string()
      .trim()
      .min(
        MATCHING_GROUP_NAME_MIN_LENGTH,
        `Tên nhóm phải có ít nhất ${MATCHING_GROUP_NAME_MIN_LENGTH} ký tự`
      )
      .max(
        MATCHING_GROUP_NAME_MAX_LENGTH,
        `Tên nhóm tối đa ${MATCHING_GROUP_NAME_MAX_LENGTH} ký tự`
      ),
    difficulty: z.enum(['EASY', 'MODERATE', 'HARD', 'EXTREME']).default('MODERATE'),
    description: z
      .string()
      .max(
        MATCHING_GROUP_DESCRIPTION_MAX_LENGTH,
        `Mô tả tối đa ${MATCHING_GROUP_DESCRIPTION_MAX_LENGTH} ký tự`
      )
      .optional(),
    maxSize: z.preprocess(
      (value) => (typeof value === 'string' && value.trim() !== '' ? Number(value) : value),
      z
        .number({ message: 'Số lượng phải là con số' })
        .min(MATCHING_GROUP_MIN_SIZE, `Tối thiểu ${MATCHING_GROUP_MIN_SIZE} người`)
        .max(MATCHING_GROUP_MAX_SIZE, `Tối đa ${MATCHING_GROUP_MAX_SIZE} người`)
        .int('Số lượng phải là số nguyên')
    ),
    targetDate: z.string().min(1, 'Vui lòng chọn ngày khởi hành'),
    endDate: z.string().optional(),
    matchingDeadline: z.string().min(1, 'Vui lòng chọn hạn chót đăng ký'),
  })
  .superRefine((data, ctx) => {
    if (data.sourceType === 'TOUR') {
      if (!data.tourId || data.tourId.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Vui lòng chọn Tour hợp lệ',
          path: ['tourId'],
        });
      }
    }

    if (data.targetDate && data.matchingDeadline) {
      if (new Date(data.matchingDeadline) > new Date(data.targetDate)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Hạn chót đăng ký phải trước hoặc bằng ngày khởi hành',
          path: ['matchingDeadline'],
        });
      }
    }

    if (data.sourceType === 'CUSTOM_JOURNEY' && data.targetDate && data.endDate) {
      if (new Date(data.endDate) < new Date(data.targetDate)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Ngày kết thúc phải sau hoặc bằng ngày khởi hành',
          path: ['endDate'],
        });
      }
    }
  });

export type CreateMatchingGroupFormInput = z.input<typeof createMatchingGroupSchema>;
export type CreateMatchingGroupFormValues = z.output<typeof createMatchingGroupSchema>;

// Aliases for compatibility
export const createTourMatchingGroupSchema = createMatchingGroupSchema;
export type CreateTourMatchingGroupFormInput = CreateMatchingGroupFormInput;
export type CreateTourMatchingGroupFormValues = CreateMatchingGroupFormValues;

export const CREATE_MATCHING_GROUP_DEFAULT_VALUES: CreateMatchingGroupFormInput = {
  sourceType: 'CUSTOM_JOURNEY',
  tourId: '',
  groupName: '',
  difficulty: 'MODERATE',
  description: '',
  maxSize: MATCHING_GROUP_DEFAULT_SIZE,
  targetDate: '',
  endDate: '',
  matchingDeadline: '',
};

export const CREATE_TOUR_MATCHING_GROUP_DEFAULT_VALUES = CREATE_MATCHING_GROUP_DEFAULT_VALUES;
