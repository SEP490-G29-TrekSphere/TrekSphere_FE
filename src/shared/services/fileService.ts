import { ApiService, ApiUpload } from '@/config/apiClient';

/**
 * Shared service for file upload and deletion (Cloudinary).
 */
export const fileService = {
  /**
   * Upload a single file to backend -> returns URL string.
   * Endpoint: POST /files/upload?folder=<folder>
   */
  uploadFile: async (file: File, folder = 'avatars') => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await ApiUpload<string>(
      `/files/upload?folder=${encodeURIComponent(folder)}`,
      formData
    );
    if (typeof res.data === 'string' && res.data) return res;
    if (typeof res.message === 'string' && res.message) return { ...res, data: res.message };
    return res;
  },

  /**
   * Upload multiple files in a single request -> returns array of URL strings.
   * Endpoint: POST /files/upload/batch?folder=<folder>
   */
  uploadFiles: async (files: File[], folder = 'general') => {
    const formData = new FormData();
    for (const file of files) formData.append('files', file);
    return ApiUpload<string[]>(
      `/files/upload/batch?folder=${encodeURIComponent(folder)}`,
      formData
    );
  },

  /**
   * Delete a file from Cloudinary via publicId or full URL.
   * Endpoint: DELETE /files/delete?publicId=<publicId>
   */
  deleteFile: async (publicIdOrUrl: string) => {
    let publicId = publicIdOrUrl;
    if (publicIdOrUrl.includes('cloudinary.com/')) {
      const uploadIdx = publicIdOrUrl.indexOf('/upload/');
      if (uploadIdx !== -1) {
        let pathAfterUpload = publicIdOrUrl.substring(uploadIdx + 8);
        pathAfterUpload = pathAfterUpload.replace(/^v\d+\//, '');
        const dotIdx = pathAfterUpload.lastIndexOf('.');
        if (dotIdx !== -1) {
          publicId = pathAfterUpload.substring(0, dotIdx);
        } else {
          publicId = pathAfterUpload;
        }
      }
    }
    return ApiService<string>(`/files/delete?publicId=${encodeURIComponent(publicId)}`, 'DELETE');
  },
};
