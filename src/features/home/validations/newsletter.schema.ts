import * as z from 'zod';

export const newsletterSchema = z.object({
  email: z.string().min(1, 'Vui lòng nhập email').email('Địa chỉ email không hợp lệ'),
});

export type NewsletterFormValues = z.infer<typeof newsletterSchema>;
