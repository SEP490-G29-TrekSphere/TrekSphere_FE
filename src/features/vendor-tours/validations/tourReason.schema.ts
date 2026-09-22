import * as z from 'zod';

export const reasonSchema = z.object({
  reason: z.string().trim().min(1, 'Vui lòng nhập lý do'),
});

export type ReasonFormValues = z.infer<typeof reasonSchema>;
