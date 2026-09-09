import { z } from 'zod';
import {
  MATCHING_GROUP_DEFAULT_SIZE,
  MATCHING_GROUP_DESCRIPTION_MAX_LENGTH,
  MATCHING_GROUP_MAX_SIZE,
  MATCHING_GROUP_MIN_SIZE,
  MATCHING_GROUP_NAME_MAX_LENGTH,
  MATCHING_GROUP_NAME_MIN_LENGTH,
} from '../constants';

export const createTourMatchingGroupSchema = z
  .object({
    tourId: z.string().uuid('Vui lòng chọn Tour hợp lệ').min(1, 'Vui lòng chọn Tour bạn muốn đi'),
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
    matchingDeadline: z.string().min(1, 'Vui lòng chọn hạn chót đăng ký'),
  })
  .refine(
    ({ targetDate, matchingDeadline }) => {
      if (!targetDate || !matchingDeadline) return true;
      return new Date(matchingDeadline) <= new Date(targetDate);
    },
    {
      message: 'Hạn chót đăng ký phải trước hoặc bằng ngày khởi hành',
      path: ['matchingDeadline'],
    }
  );

export type CreateTourMatchingGroupFormInput = z.input<typeof createTourMatchingGroupSchema>;
export type CreateTourMatchingGroupFormValues = z.output<typeof createTourMatchingGroupSchema>;

export const CREATE_TOUR_MATCHING_GROUP_DEFAULT_VALUES: CreateTourMatchingGroupFormInput = {
  tourId: '',
  groupName: '',
  description: '',
  maxSize: MATCHING_GROUP_DEFAULT_SIZE,
  targetDate: '',
  matchingDeadline: '',
};
