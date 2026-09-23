import { z } from 'zod';

export const applicationSchema = z.object({
  companyName: z.string().min(1, 'Vui lòng nhập tên công ty'),
  contactEmail: z
    .string()
    .min(1, 'Vui lòng nhập email liên hệ')
    .email('Email không đúng định dạng'),
  contactPhone: z
    .string()
    .min(1, 'Vui lòng nhập số điện thoại')
    .regex(
      /^0[35789][0-9]{8}$/,
      'Số điện thoại không hợp lệ (gồm 10 chữ số, bắt đầu bằng 03, 05, 07, 08, 09)'
    ),
  businessDescription: z.string().optional(),
  taxCode: z.string().min(1, 'Vui lòng nhập mã số thuế'),
});

export type ApplicationFormValues = z.infer<typeof applicationSchema>;
