import { z } from 'zod';

export const blogFormSchema = z.object({
  title: z.string().trim().min(1, 'Vui lòng nhập tiêu đề bài viết.'),
  content: z.string().trim().min(1, 'Vui lòng nhập nội dung bài viết.'),
});

export type BlogFormValues = z.infer<typeof blogFormSchema>;
