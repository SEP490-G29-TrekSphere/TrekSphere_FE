import type { UserProfile } from '@/features/auth';

export interface ProfileCompletenessResult {
  isComplete: boolean;
  missingFields: string[];
  missingFieldLabels: string[];
}

/**
 * Kiểm tra các trường thông tin bắt buộc đối với người dùng khi tham gia hoặc tạo nhóm ghép:
 * 1. Họ và tên (`name`): Tối thiểu 2 ký tự
 * 2. Số điện thoại (`phone`): Có giá trị
 * 3. Ngày sinh (`dateOfBirth`): Có giá trị
 * 4. Cấp độ kinh nghiệm (`experienceLevel`): Có giá trị
 * 5. Độ khó ưa thích (`preferredDifficulty`): Có giá trị
 */
export function checkProfileCompleteness(
  profile: UserProfile | null | undefined
): ProfileCompletenessResult {
  if (!profile) {
    return {
      isComplete: false,
      missingFields: ['name', 'phone', 'dateOfBirth', 'experienceLevel', 'preferredDifficulty'],
      missingFieldLabels: [
        'Họ và tên',
        'Số điện thoại',
        'Ngày sinh',
        'Cấp độ kinh nghiệm',
        'Độ khó ưa thích',
      ],
    };
  }

  const missingFields: string[] = [];
  const missingFieldLabels: string[] = [];

  if (!profile.name || profile.name.trim().length < 2) {
    missingFields.push('name');
    missingFieldLabels.push('Họ và tên');
  }

  if (!profile.phone || profile.phone.trim().length === 0) {
    missingFields.push('phone');
    missingFieldLabels.push('Số điện thoại');
  }

  if (!profile.dateOfBirth || profile.dateOfBirth.trim().length === 0) {
    missingFields.push('dateOfBirth');
    missingFieldLabels.push('Ngày sinh');
  }

  if (!profile.experienceLevel) {
    missingFields.push('experienceLevel');
    missingFieldLabels.push('Cấp độ kinh nghiệm');
  }

  if (!profile.preferredDifficulty) {
    missingFields.push('preferredDifficulty');
    missingFieldLabels.push('Độ khó ưa thích');
  }

  return {
    isComplete: missingFields.length === 0,
    missingFields,
    missingFieldLabels,
  };
}
