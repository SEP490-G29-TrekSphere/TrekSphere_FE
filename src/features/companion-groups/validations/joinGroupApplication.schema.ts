import { z } from 'zod';
import { MATCHING_GROUP_APPLICATION_MESSAGE_MAX_LENGTH } from '../constants';

export const joinGroupApplicationSchema = z.object({
  message: z
    .string()
    .trim()
    .max(
      MATCHING_GROUP_APPLICATION_MESSAGE_MAX_LENGTH,
      `Lời nhắn tối đa ${MATCHING_GROUP_APPLICATION_MESSAGE_MAX_LENGTH} ký tự`
    )
    .optional(),
});

export type JoinGroupApplicationFormValues = z.infer<typeof joinGroupApplicationSchema>;

export const JOIN_GROUP_APPLICATION_DEFAULT_VALUES: JoinGroupApplicationFormValues = {
  message: '',
};
