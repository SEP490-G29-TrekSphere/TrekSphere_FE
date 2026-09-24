import * as z from 'zod';
import {
  HIKING_BIO_MAX_LENGTH,
  HIKING_PREFERRED_AREAS_MAX,
  HIKING_SKILLS_MAX,
  HIKING_TAG_MAX_LENGTH,
} from '@/constants';
import { isValidVietnamesePhone, normalizePhoneNumber } from '@/utils/phone';

export const loginSchema = z.object({
  email: z.string().min(1, 'Vui lòng nhập email').email('Địa chỉ email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  rememberMe: z.boolean().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Họ và tên phải có ít nhất 2 ký tự').max(100, 'Họ và tên quá dài'),
    email: z.string().min(1, 'Vui lòng nhập email').email('Địa chỉ email không hợp lệ'),
    password: z
      .string()
      .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
      .regex(/[A-Z]/, 'Mật khẩu phải chứa ít nhất một chữ cái viết hoa')
      .regex(/[a-z]/, 'Mật khẩu phải chứa ít nhất một chữ cái viết thường')
      .regex(/[0-9]/, 'Mật khẩu phải chứa ít nhất một chữ số')
      .regex(/[^A-Za-z0-9]/, 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Vui lòng nhập email').email('Địa chỉ email không hợp lệ'),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const newPasswordRules = z
  .string()
  .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
  .max(100, 'Mật khẩu không được vượt quá 100 ký tự')
  .regex(/[A-Z]/, 'Mật khẩu phải chứa ít nhất một chữ cái viết hoa')
  .regex(/[a-z]/, 'Mật khẩu phải chứa ít nhất một chữ cái viết thường')
  .regex(/[0-9]/, 'Mật khẩu phải chứa ít nhất một chữ số')
  .regex(/[!@#$%^&*()_\-+=~`[\]{}|;:'",.<>/?]/, 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt');

export const checkPasswordsMatch = (data: { newPassword: string; confirmPassword: string }) =>
  data.newPassword === data.confirmPassword;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token không được để trống'),
    newPassword: newPasswordRules,
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu mới'),
  })
  .refine(checkPasswordsMatch, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
    newPassword: newPasswordRules,
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu mới'),
  })
  .refine(checkPasswordsMatch, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'Mật khẩu mới phải khác mật khẩu hiện tại',
    path: ['newPassword'],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

/**
 * Schema for profile update validation.
 * Includes personal details, contact info, date of birth, and hiking preferences.
 */
export const updateProfileSchema = z
  .object({
    name: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự').max(100, 'Họ tên quá dài'),
    phone: z
      .string({ message: 'Vui lòng nhập số điện thoại' })
      .trim()
      .min(1, 'Vui lòng nhập số điện thoại')
      .refine((val) => isValidVietnamesePhone(val), {
        message:
          'Số điện thoại không hợp lệ (gồm 10 chữ số, bắt đầu bằng 03, 05, 07, 08, 09 hoặc +84)',
      })
      .transform((val) => normalizePhoneNumber(val)),
    gender: z.enum(['male', 'female', 'other']).optional().or(z.literal('')),
    dateOfBirth: z
      .string({ message: 'Vui lòng chọn ngày sinh' })
      .trim()
      .min(1, 'Vui lòng chọn ngày sinh')
      .refine(
        (val) => {
          const dob = new Date(val);
          if (Number.isNaN(dob.getTime())) return false;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return dob <= today;
        },
        {
          message: 'Ngày sinh không hợp lệ (không được lớn hơn ngày hiện tại)',
        }
      )
      .refine(
        (val) => {
          const dob = new Date(val);
          if (Number.isNaN(dob.getTime())) return false;
          const today = new Date();
          let age = today.getFullYear() - dob.getFullYear();
          const monthDiff = today.getMonth() - dob.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
          }
          return age >= 18 && age <= 100;
        },
        {
          message: 'Bạn phải từ 18 tuổi trở lên (độ tuổi hợp lệ từ 18 đến 100 tuổi)',
        }
      ),
    bio: z
      .string()
      .max(HIKING_BIO_MAX_LENGTH, `Giới thiệu tối đa ${HIKING_BIO_MAX_LENGTH} ký tự`)
      .optional()
      .or(z.literal('')),
    emergencyContactName: z
      .string()
      .max(100, 'Tên người thân tối đa 100 ký tự')
      .optional()
      .or(z.literal('')),
    emergencyContactPhone: z
      .string()
      .trim()
      .optional()
      .or(z.literal(''))
      .refine((val) => !val || isValidVietnamesePhone(val), {
        message:
          'Số điện thoại người thân không hợp lệ (gồm 10 chữ số, bắt đầu bằng 03, 05, 07, 08, 09 hoặc +84)',
      })
      .transform((val) => (val ? normalizePhoneNumber(val) : val)),
    experienceLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'], {
      message: 'Vui lòng chọn cấp độ kinh nghiệm',
    }),
    preferredDifficulty: z.enum(['EASY', 'MODERATE', 'HARD', 'EXTREME'], {
      message: 'Vui lòng chọn độ khó ưa thích',
    }),
    preferredAreas: z
      .array(z.string().trim().min(1).max(HIKING_TAG_MAX_LENGTH))
      .max(HIKING_PREFERRED_AREAS_MAX, `Tối đa ${HIKING_PREFERRED_AREAS_MAX} khu vực`)
      .optional(),
    skills: z
      .array(z.string().trim().min(1).max(HIKING_TAG_MAX_LENGTH))
      .max(HIKING_SKILLS_MAX, `Tối đa ${HIKING_SKILLS_MAX} kỹ năng`)
      .optional(),
  })
  .refine(
    (data) => {
      const expOrder: Record<string, number> = {
        BEGINNER: 0,
        INTERMEDIATE: 1,
        ADVANCED: 2,
        EXPERT: 3,
      };
      const diffOrder: Record<string, number> = {
        EASY: 0,
        MODERATE: 1,
        HARD: 2,
        EXTREME: 3,
      };
      if (data.experienceLevel && data.preferredDifficulty) {
        const exp = expOrder[data.experienceLevel];
        const diff = diffOrder[data.preferredDifficulty];
        if (exp !== undefined && diff !== undefined && diff > exp) {
          return false;
        }
      }
      return true;
    },
    {
      message: 'Độ khó ưa thích không được vượt quá cấp độ kinh nghiệm.',
      path: ['preferredDifficulty'],
    }
  );

export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;
