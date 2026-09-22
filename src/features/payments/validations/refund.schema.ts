import { z } from 'zod';

export const destinationSchema = z.object({
  bankBin: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Mã BIN phải gồm đúng 6 chữ số.'),
  accountNumber: z
    .string()
    .trim()
    .regex(/^\d{6,20}$/, 'Số tài khoản phải gồm 6-20 chữ số.'),
  accountName: z.string().trim().min(3, 'Vui lòng nhập tên chủ tài khoản.'),
});

export const manualSchema = z.object({
  note: z.string().trim().max(300, 'Ghi chú tối đa 300 ký tự.').optional(),
});

export type DestinationValues = z.infer<typeof destinationSchema>;
export type ManualValues = z.infer<typeof manualSchema>;
