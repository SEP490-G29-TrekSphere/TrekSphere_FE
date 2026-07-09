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

/** Payload sent to the /auth/reset-password endpoint. */
export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

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

/**
 * Detailed user profile (used for the View/Edit profile screens).
 * Preserves the existing structure to avoid breaking other features.
 */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  username?: string;
  gender?: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  address?: string;
  bio?: string;
  interests?: string[];
  stats?: {
    toursCount: number;
    postsCount: number;
    followersCount: number;
  };
  joinedAt?: string;
  role: string;
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
