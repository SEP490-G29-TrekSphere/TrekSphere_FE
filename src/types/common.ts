export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  role: import('@/constants').Role;
}

export interface ApiSuccess<T> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiFailure {
  error: string;
  status: number;
  message?: string;
}

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
