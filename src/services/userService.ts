import { ApiService } from '@/config/apiClient';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  phone: string;
  createdAt: string;
}

export const userService = {
  /**
   * Lấy thông tin cá nhân của user đang đăng nhập
   */
  getProfile: async () => {
    return ApiService<UserProfile>('/users/me', 'GET');
  },

  /**
   * Cập nhật thông tin cá nhân
   */
  updateProfile: async (data: Partial<UserProfile>) => {
    return ApiService<UserProfile>('/users/me', 'PUT', data);
  },

  /**
   * Lấy danh sách user (Dành cho Admin)
   */
  getAllUsers: async (page: number = 1, limit: number = 10) => {
    // Truyền query params thông qua URL
    return ApiService<{ users: UserProfile[]; total: number }>(
      `/users?page=${page}&limit=${limit}`,
      'GET'
    );
  },
};
