import axios from 'axios';
import { type ApiResponse, ApiService } from '@/config/apiClient';
import type {
  AuthActionResponse,
  AuthResponse,
  AuthUser,
  ChangePasswordPayload,
  LoginPayload,
  RegisterPayload,
  RegisterResponseData,
  ResetPasswordPayload,
  UpdateProfilePayload,
  UserProfile,
  VerifyEmailResponse,
} from '../types';
import type { LoginFormValues, RegisterFormValues } from '../validations/auth.schema';

export const authService = {
  /**
   * Log in to the system.
   * BE: POST /api/v1/auth/login -> returns `{ user, access_token, refresh_token }`.
   */
  login: (data: LoginFormValues) =>
    ApiService<AuthResponse>('/auth/login', 'POST', data as unknown as LoginPayload),

  /**
   * Register a new user account.
   * BE: POST /api/v1/auth/register -> only returns `{ userId, email, fullName }`,
   * NO token included - FE must then call /auth/login if they want to enter the system immediately.
   */
  register: (data: RegisterFormValues): Promise<ApiResponse<RegisterResponseData>> =>
    ApiService<RegisterResponseData>('/auth/register', 'POST', {
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
    } as unknown as RegisterPayload),

  /**
   * Resend a verification email to the user.
   * BE: POST /api/v1/auth/resend-verification
   */
  resendVerification: (email: string): Promise<ApiResponse<void>> =>
    ApiService<void>('/auth/resend-verification', 'POST', { email }),

  /**
   * Send a password reset request.
   */
  forgotPassword: (email: string) => ApiService('/auth/forgot-password', 'POST', { email }),

  /**
   * Reset the password using a verification token.
   */
  resetPassword: (data: ResetPasswordPayload) =>
    ApiService<AuthActionResponse>('/auth/reset-password', 'POST', data),

  /**
   * Log out of the system.
   */
  logout: () => ApiService('/auth/logout', 'POST'),

  refreshToken: (token: string) =>
    ApiService<AuthResponse>('/auth/refresh-token', 'POST', { refreshToken: token }),

  /**
   * Change the current password.
   */
  changePassword: (data: ChangePasswordPayload) => {
    return ApiService('/auth/change-password', 'POST', data);
  },

  /**
   * Log in with Google using the ID token from Google OAuth.
   * BE: POST /api/v1/auth/google?idToken=xxx -> returns `{ user, access_token, refresh_token }`.
   */
  googleLogin: (idToken: string) =>
    ApiService<AuthResponse>('/auth/google', 'POST', null, { idToken }),

  /**
   * Get the profile of the currently logged-in user.
   */
  getProfile: () => ApiService<UserProfile>('/users/me', 'GET'),

  /**
   * Update the profile of the currently logged-in user.
   */
  updateProfile: (data: UpdateProfilePayload) =>
    ApiService<UserProfile>('/users/profile', 'PUT', data),

  verifyEmail: async (token: string): Promise<ApiResponse<VerifyEmailResponse>> => {

    const rawApiUrl = import.meta.env.VITE_API_URL;
    const apiBase = rawApiUrl?.trim() ? rawApiUrl.trim() : 'https://api.treksphere.io.vn/api/v1';
    const cleanBase = apiBase.replace(/\/+$/, '');
    const verifyURL = `${cleanBase}/auth/verify?token=${encodeURIComponent(token)}`;

    try {
      const response = await axios.get<unknown>(verifyURL, {
        timeout: 60_000,
        __skipAuth: true,
        __skipRefresh: true,
      } as never);

      // Unwrap envelope according to spec ApiResponseString
      const envelope = response.data as {
        success?: boolean;
        code?: number;
        message?: string;
        data?: unknown;
        errors?: Array<{ field?: string; message?: string }>;
      } | null;

      const innerData = envelope && typeof envelope === 'object' ? envelope.data : undefined;

      let unwrapped: VerifyEmailResponse;
      if (innerData && typeof innerData === 'object') {
        unwrapped = innerData as VerifyEmailResponse;
      } else if (typeof innerData === 'string') {
        unwrapped = { message: innerData, success: true };
      } else {
        unwrapped = {};
      }

      const httpOk = response.status >= 200 && response.status < 300;
      const apiSuccess = envelope?.success !== false;
      const codeOk = !envelope?.code || envelope.code >= 200;
      const isOk = httpOk && apiSuccess && codeOk;

      if (!isOk) {
        return {
          error: envelope?.message || 'Xác thực thất bại. Vui lòng thử lại.',
          message: envelope?.message,
          status: response.status,
        };
      }

      return {
        data: unwrapped,
        status: response.status,
        message: envelope?.message ?? unwrapped.message,
      };
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const responseData = err.response?.data as { message?: string; error?: string } | undefined;
        return {
          error: responseData?.message || responseData?.error || err.message,
          message: responseData?.message || err.message,
          status: err.response?.status,
        };
      }
      return { error: 'An unknown error occurred', message: 'An unknown error occurred' };
    }
  },
};

/** Helper to convert user from BE (snake_case) to the shape stored in `useAppStore`. */
export function toAppStoreUser(user: AuthUser): {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  roles: string[];
} {
  return {
    id: user.id,
    name: user.fullName,
    email: user.email,
    avatarUrl: user.avatarUrl,
    roles: user.roles,
  };
}
