import * as z from 'zod';

export const tourSearchSchema = z.object({
  keyword: z.string(),
});

export type TourSearchFormValues = z.infer<typeof tourSearchSchema>;
