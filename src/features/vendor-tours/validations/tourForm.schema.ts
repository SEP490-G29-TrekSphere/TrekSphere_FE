import * as z from 'zod';

export const requiredAgeText = z
  .string()
  .trim()
  .min(1, 'Vui lòng nhập tuổi tối thiểu')
  .refine(
    (value) => Number.isInteger(Number(value)) && Number(value) >= 1 && Number(value) <= 100,
    'Tuổi phải là số nguyên từ 1 đến 100'
  );

export function optionalAgeText(label: string, minimum: number, maximum: number) {
  return z
    .string()
    .trim()
    .refine(
      (value) =>
        value === '' ||
        (Number.isInteger(Number(value)) && Number(value) >= minimum && Number(value) <= maximum),
      `${label} phải là số nguyên từ ${minimum} đến ${maximum}`
    );
}

export const tourFormSchema = z
  .object({
    tourName: z.string().trim().min(1, 'Vui lòng nhập tên tour'),
    difficulty: z.enum(['EASY', 'MODERATE', 'HARD', 'EXTREME']),
    price: z.coerce.number().min(0, 'Giá tiền không hợp lệ'),
    location: z.string().trim().min(1, 'Vui lòng nhập địa điểm'),
    minCapacity: z.coerce.number().int().min(1, 'Tối thiểu 1 khách'),
    maxCapacity: z.coerce.number().int().min(1, 'Tối thiểu 1 khách'),
    durationDays: z.coerce.number().int().min(1, 'Tối thiểu 1 ngày'),
    totalDistanceKm: z
      .string()
      .trim()
      .refine(
        (value) => value === '' || (!Number.isNaN(Number(value)) && Number(value) >= 0),
        'Quãng đường phải là số không âm'
      ),
    highlights: z.string().trim(),
    includes: z.string().trim(),
    excludes: z.string().trim(),
    description: z.string().trim().min(1, 'Vui lòng nhập lịch trình chi tiết'),
    minAge: requiredAgeText,
    maxAge: optionalAgeText('Tuổi tối đa', 1, 100),
    fitnessLevel: z.enum(['ANY', 'BASIC', 'MODERATE', 'HIGH', 'EXTREME']),
    healthRequirements: z.string().trim(),
    restrictedMedicalConditions: z.string().trim(),
    requiredExperience: z.string().trim(),
    requiredSkills: z.string().trim(),
    requiredEquipment: z.string().trim(),
    requiredDocuments: z.string().trim(),
    requiresHealthDeclaration: z.boolean(),
    requiresMedicalCertificate: z.boolean(),
    guardianRequiredUnderAge: optionalAgeText('Tuổi cần người giám hộ', 1, 18),
    additionalRequirements: z.string().trim(),
  })
  .refine((data) => data.maxCapacity >= data.minCapacity, {
    message: 'Số khách tối đa phải lớn hơn hoặc bằng số khách tối thiểu',
    path: ['maxCapacity'],
  })
  .superRefine((data, context) => {
    if (data.maxAge !== '' && Number(data.maxAge) < Number(data.minAge)) {
      context.addIssue({
        code: 'custom',
        message: 'Tuổi tối đa phải lớn hơn hoặc bằng tuổi tối thiểu',
        path: ['maxAge'],
      });
    }
  });

export type TourFormValues = z.infer<typeof tourFormSchema>;
export type TourFormInput = z.input<typeof tourFormSchema>;
