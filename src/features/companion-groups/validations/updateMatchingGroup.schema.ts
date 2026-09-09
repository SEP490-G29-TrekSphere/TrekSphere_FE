import { z } from 'zod';
import {
  MATCHING_GROUP_DESCRIPTION_MAX_LENGTH,
  MATCHING_GROUP_MAX_SIZE,
  MATCHING_GROUP_MIN_SIZE,
  MATCHING_GROUP_NAME_MAX_LENGTH,
  MATCHING_GROUP_NAME_MIN_LENGTH,
} from '../constants';

export const updateMatchingGroupSchema = z.object({
  groupName: z
    .string()
    .trim()
    .min(
      MATCHING_GROUP_NAME_MIN_LENGTH,
      `Tên nhóm phải có ít nhất ${MATCHING_GROUP_NAME_MIN_LENGTH} ký tự`
    )
    .max(MATCHING_GROUP_NAME_MAX_LENGTH, `Tên nhóm tối đa ${MATCHING_GROUP_NAME_MAX_LENGTH} ký tự`)
    .optional(),
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
      .optional()
  ),
});

export type UpdateMatchingGroupFormInput = z.input<typeof updateMatchingGroupSchema>;
export type UpdateMatchingGroupFormValues = z.output<typeof updateMatchingGroupSchema>;
