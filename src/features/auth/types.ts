import type { HikingExperienceLevel, HikingPreferredDifficulty } from '@/constants';
import type { ChangePasswordFormValues } from './validations/auth.schema';

/**
 * Types specific to the auth feature.
 * Only types related to login, register, forgot-password, and reset-password are defined here.
 */

/** Payload sent to the /auth/login endpoint. */
export interface LoginPayload {
  email: string;
  password: string;
}

/** Payload sent to the /auth/register endpoint. */
export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface AuthActionResponse {
  success: boolean;
  message: string;
}

export interface VerifyEmailResponse {
  user?: AuthUser;
  access_token?: string;
  refresh_token?: string;
  success?: boolean;
  message?: string;
}

/** Payload sent to the /auth/reset-password endpoint. */
export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

/** Payload sent to the /auth/change-password endpoint. */
export type ChangePasswordPayload = Pick<
  ChangePasswordFormValues,
  'currentPassword' | 'newPassword'
>;

/** User object returned in the BE response (snake_case, uses `fullName`/`avatarUrl`/`roles[]`). */
export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  roles: string[];
}

/** Response envelope for `/auth/login`. The BE returns token in snake_case. */
export interface AuthResponse {
  user: AuthUser;
  access_token: string;
  refresh_token: string;
}

/** Response data for `/auth/register` - BE only returns user info, no token. */
export interface RegisterResponseData {
  userId: string;
  email: string;
  fullName: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  gender?: 'male' | 'female' | 'other';
  dateOfBirth?: string;

  roles: string[];

  role: string;

  bio?: string;
  experienceLevel?: HikingExperienceLevel;
  preferredDifficulty?: HikingPreferredDifficulty;
  preferredAreas?: string[];
  skills?: string[];

  trustScore?: number;
  trustReviewCount?: number;
}

/**
 * Payload for updating user profile (all fields are optional for partial updates).
 */
export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  avatar?: string;
  gender?: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  address?: string;
  bio?: string;
  interests?: string[];
}
