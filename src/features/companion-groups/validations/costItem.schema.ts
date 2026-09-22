import { z } from 'zod';

export const costItemSchema = z.object({
  itemName: z
    .string()
    .min(1, 'Vui lòng nhập tên khoản chi dự toán')
    .max(100, 'Tên khoản chi không được vượt quá 100 ký tự'),
  category: z.enum(['PERMIT', 'GUIDE', 'FOOD', 'TRANSPORT', 'GEAR', 'OTHER']),
  estimatedAmount: z
    .number({ message: 'Số tiền không hợp lệ' })
    .positive('Số tiền dự toán phải lớn hơn 0')
    .max(1_000_000_000, 'Số tiền không được vượt quá 1 tỷ VNĐ'),
  note: z.string().max(255, 'Ghi chú không được quá 255 ký tự').optional().nullable(),
});

export const editCostItemSchema = costItemSchema;

export type CostItemFormValues = z.infer<typeof costItemSchema>;
export type EditCostItemFormValues = z.infer<typeof editCostItemSchema>;
