import { ApiService } from '@/config/apiClient';
import type { UserProfile } from '@/features/auth';
import { fileService } from '@/shared/services';

/**
 * Service for profile-related APIs.
 */
export const profileService = {
  /** Get current user profile. */
  getProfile: () => ApiService<UserProfile>('/users/me', 'GET'),

  /**
   * Update profile information with multipart/form-data.
   * API PUT /users/me
   */
  updateProfile: (data: FormData) => ApiService<UserProfile>('/users/me', 'PUT', data),

  /** @deprecated Use `fileService.uploadFile` from `@/shared/services` instead. */
  uploadFile: fileService.uploadFile,

  /** @deprecated Use `fileService.uploadFiles` from `@/shared/services` instead. */
  uploadFiles: fileService.uploadFiles,

  /** @deprecated Use `fileService.deleteFile` from `@/shared/services` instead. */
  deleteFile: fileService.deleteFile,
};
