import * as z from 'zod';

export const scheduleFormSchema = z
  .object({
    departureDate: z.string().min(1, 'Vui lòng chọn ngày khởi hành'),
    returnDate: z.string().min(1, 'Vui lòng chọn ngày kết thúc'),
    status: z.enum(['OPEN', 'CLOSED', 'CANCELLED', 'COMPLETED']),
    reason: z.string().trim().optional(),
  })
  .refine((data) => data.returnDate >= data.departureDate, {
    message: 'Ngày kết thúc phải sau ngày khởi hành',
    path: ['returnDate'],
  });

export type ScheduleFormValues = z.output<typeof scheduleFormSchema>;
export type ScheduleFormInput = z.input<typeof scheduleFormSchema>;
