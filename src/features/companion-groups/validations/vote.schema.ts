import { z } from 'zod';

export const openDissolutionVoteSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, 'Lý do giải tán nhóm không được để trống')
    .min(5, 'Lý do giải tán nhóm tối thiểu 5 ký tự')
    .max(500, 'Lý do tối đa 500 ký tự'),
  closesAt: z
    .string()
    .min(1, 'Vui lòng chọn thời hạn bỏ phiếu')
    .refine(
      (val) => {
        const time = new Date(val).getTime();
        return !Number.isNaN(time) && time > Date.now();
      },
      { message: 'Thời hạn bỏ phiếu phải ở tương lai' }
    ),
  confirmed: z.boolean().refine((val) => val === true, {
    message: 'Bạn phải xác nhận đã hiểu toàn bộ các tác động khi giải tán nhóm',
  }),
});

export type OpenDissolutionVoteFormValues = z.infer<typeof openDissolutionVoteSchema>;

export const openLeaderElectionSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, 'Lý do mở bầu cử không được để trống')
    .min(5, 'Lý do mở bầu cử tối thiểu 5 ký tự')
    .max(500, 'Lý do tối đa 500 ký tự'),
  closesAt: z
    .string()
    .min(1, 'Vui lòng chọn thời hạn bỏ phiếu')
    .refine(
      (val) => {
        const time = new Date(val).getTime();
        return !Number.isNaN(time) && time > Date.now();
      },
      { message: 'Thời hạn bỏ phiếu phải ở tương lai' }
    ),
  candidateMemberIds: z
    .array(z.string())
    .min(2, 'Vui lòng chọn tối thiểu 2 ứng viên khác để mở cuộc bầu cử'),
});

export type OpenLeaderElectionFormValues = z.infer<typeof openLeaderElectionSchema>;

export const createGeneralPollSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Tiêu đề cuộc bình chọn không được để trống')
    .min(3, 'Tiêu đề tối thiểu 3 ký tự')
    .max(200, 'Tiêu đề tối đa 200 ký tự'),
  reason: z.string().trim().max(500, 'Ghi chú tối đa 500 ký tự').optional().or(z.literal('')),
  closesAt: z
    .string()
    .min(1, 'Vui lòng chọn thời hạn bỏ phiếu')
    .refine(
      (val) => {
        const time = new Date(val).getTime();
        return !Number.isNaN(time) && time > Date.now();
      },
      { message: 'Thời hạn bỏ phiếu phải ở tương lai' }
    ),
  options: z
    .array(
      z.object({
        id: z.string(),
        value: z.string().trim().min(1, 'Nội dung lựa chọn không được để trống'),
      })
    )
    .min(2, 'Cuộc bình chọn cần tối thiểu 2 lựa chọn')
    .refine((items) => items.filter((item) => item.value.trim().length > 0).length >= 2, {
      message: 'Cần ít nhất 2 lựa chọn có nội dung',
    }),
});

export type CreateGeneralPollFormValues = z.infer<typeof createGeneralPollSchema>;
