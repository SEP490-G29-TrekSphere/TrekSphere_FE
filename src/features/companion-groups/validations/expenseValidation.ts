import { z } from 'zod';

export const customShareItemSchema = z.object({
  matchingMemberId: z.string().min(1, 'Thành viên không hợp lệ'),
  amount: z
    .number({ message: 'Số tiền chia không hợp lệ' })
    .positive('Số tiền chia phải lớn hơn 0'),
});

export const groupExpenseCreateSchema = z.object({
  title: z
    .string()
    .min(1, 'Vui lòng nhập tên khoản chi')
    .max(150, 'Tên khoản chi không được vượt quá 150 ký tự'),
  amount: z
    .number({ message: 'Số tiền không hợp lệ' })
    .positive('Số tiền chi phải lớn hơn 0')
    .max(1_000_000_000, 'Số tiền không được vượt quá 1 tỷ VNĐ'),
  paidByMemberId: z.string().optional().nullable(),
  beneficiaryScope: z.enum(['ALL_MEMBERS', 'SELECTED_MEMBERS']).optional(),
  beneficiaryMemberIds: z.array(z.string()).optional(),
  splitMethod: z.enum(['EQUAL', 'PERCENTAGE', 'EXACT', 'CUSTOM']).optional(),
  customShares: z.array(customShareItemSchema).optional(),
  spentAt: z.string().optional().nullable(),
  receiptUrl: z
    .string()
    .url('Đường dẫn hóa đơn không hợp lệ')
    .optional()
    .nullable()
    .or(z.literal('')),
  note: z.string().max(500, 'Ghi chú không được quá 500 ký tự').optional().nullable(),
});

export type GroupExpenseCreateFormValues = z.infer<typeof groupExpenseCreateSchema>;

export const groupExpenseUpdateSchema = z.object({
  title: z
    .string()
    .min(1, 'Vui lòng nhập tên khoản chi')
    .max(150, 'Tên khoản chi không được vượt quá 150 ký tự')
    .optional(),
  amount: z
    .number({ message: 'Số tiền không hợp lệ' })
    .positive('Số tiền chi phải lớn hơn 0')
    .max(1_000_000_000, 'Số tiền không được vượt quá 1 tỷ VNĐ')
    .optional(),
  paidByMemberId: z.string().optional().nullable(),
  beneficiaryScope: z.enum(['ALL_MEMBERS', 'SELECTED_MEMBERS']).optional(),
  beneficiaryMemberIds: z.array(z.string()).optional(),
  splitMethod: z.enum(['EQUAL', 'PERCENTAGE', 'EXACT', 'CUSTOM']).optional(),
  customShares: z.array(customShareItemSchema).optional(),
  spentAt: z.string().optional().nullable(),
  receiptUrl: z
    .string()
    .url('Đường dẫn hóa đơn không hợp lệ')
    .optional()
    .nullable()
    .or(z.literal('')),
  note: z.string().max(500, 'Ghi chú không được quá 500 ký tự').optional().nullable(),
});

export type GroupExpenseUpdateFormValues = z.infer<typeof groupExpenseUpdateSchema>;
