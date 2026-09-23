import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosProgressEvent,
  type AxiosResponse,
} from 'axios';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import { storage } from '@/utils/storage';
import { queryClient } from './queryClient';

const isDev = import.meta.env.DEV;
const envApiUrl = import.meta.env.VITE_API_URL;

const deriveApiUrl = (rawUrl?: string): string => {
  const url = rawUrl || 'https://api.treksphere.io.vn';
  const cleanUrl = url.replace(/\/+$/, '');

  if (cleanUrl.endsWith('/api/v1')) {
    return cleanUrl;
  }
  if (cleanUrl.endsWith('/api')) {
    return `${cleanUrl}/v1`;
  }
  return `${cleanUrl}/api/v1`;
};

// Prod without VITE_API_URL → fail fast with a clear error rather than silently
// pointing at a hardcoded URL.
const getBaseURL = (): string => {
  if (isDev && import.meta.env.VITE_API_USE_PROXY !== 'false') return '/api/v1';
  if (envApiUrl) return deriveApiUrl(envApiUrl);
  throw new Error(
    '[apiClient] VITE_API_URL is not set. ' +
      'Set it in your .env file before running a production build.'
  );
};

const baseURL = getBaseURL();
const withCredentialsEnv = import.meta.env.VITE_API_WITH_CREDENTIALS;
const withCredentials = withCredentialsEnv !== 'false'; // default true

const TIME_OUT = 60000;

const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: TIME_OUT,
  withCredentials,
});

export type ApiResponse<T> = {
  data?: T;
  error?: string;
  status?: number;
  meta?: unknown;
  message?: string;
  errors?: Array<{ field?: string; message?: string }>;
};

type RetryableRequest = AxiosError['config'] & {
  __retried?: boolean;
  __skipAuth?: boolean;
  __skipRefresh?: boolean;
};

const COOKIE_AUTH = '__COOKIE_AUTH__';

let refreshPromise: Promise<string | null> | null = null;

const clearExpiredSession = (customMessage?: string): void => {
  const hasSession = Boolean(
    storage.get<string>('accessToken') ||
      storage.get<string>('refreshToken') ||
      useAppStore.getState().user
  );
  if (!hasSession) return;
  storage.remove('accessToken');
  storage.remove('refreshToken');
  useAppStore.getState().setUser(null);
  queryClient.clear();
  toast.error(customMessage || 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.');

  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

function buildAbsoluteBaseURL(): string {
  if (isDev) {
    return baseURL;
  }
  return baseURL;
}

async function performRefresh(): Promise<string | null> {
  const refreshToken = storage.get<string>('refreshToken');
  if (!refreshToken) {
    console.warn(
      '[apiClient] performRefresh: no refreshToken in storage — trying cookie-based refresh'
    );
  }

  const absoluteURL = `${buildAbsoluteBaseURL()}/auth/refresh-token`;
  const bodyCandidates: Array<Record<string, unknown> | null> = refreshToken
    ? [{ refreshToken }, { refresh_token: refreshToken }, { token: refreshToken }, null]
    : [null];

  for (const _body of bodyCandidates) {
    try {
      const response = await axios.post<{
        access_token?: string;
        accessToken?: string;
        refresh_token?: string;
        refreshToken?: string;
        token?: string;
        data?: {
          access_token?: string;
          accessToken?: string;
          token?: string;
          refresh_token?: string;
          refreshToken?: string;
        };
      }>(absoluteURL, _body ?? {}, { timeout: TIME_OUT, withCredentials });

      const root = response.data as Record<string, unknown>;
      const inner = (root.data as Record<string, unknown> | undefined) ?? {};
      const newAccess =
        (inner.access_token as string | undefined) ??
        (inner.accessToken as string | undefined) ??
        (inner.token as string | undefined) ??
        (root.access_token as string | undefined) ??
        (root.accessToken as string | undefined) ??
        (root.token as string | undefined);
      const newRefresh =
        (inner.refresh_token as string | undefined) ??
        (inner.refreshToken as string | undefined) ??
        (root.refresh_token as string | undefined) ??
        (root.refreshToken as string | undefined) ??
        refreshToken ??
        '';

      if (!newAccess) {
        if (response.status >= 200 && response.status < 300 && inner) return COOKIE_AUTH;
        continue;
      }

      storage.set('accessToken', newAccess);
      if (newRefresh) storage.set('refreshToken', newRefresh);
      return newAccess;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        console.error('[apiClient] refresh token returned 401 — refresh token invalid/expired');
        return null;
      }

      console.warn('[apiClient] refresh attempt failed:', err);
    }
  }

  console.error('[apiClient] refresh token: all body shapes failed');
  return null;
}

// Request interceptor for token
apiClient.interceptors.request.use(
  (config) => {
    const retryable = config as RetryableRequest;

    if (retryable.__skipAuth) return config;

    const token = storage.get<string>('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const originalConfig = error.config as RetryableRequest | undefined;

    if (
      status !== 401 ||
      !originalConfig ||
      originalConfig.__retried ||
      originalConfig.__skipRefresh
    ) {
      if (status === 401) {
        console.warn('[apiClient] 401 received (no refresh):', originalConfig?.url);
      } else if (status) {
        console.error('[apiClient] HTTP error:', status, originalConfig?.url);
      }
      return Promise.reject(error);
    }

    if (originalConfig.url?.includes('/auth/refresh-token')) {
      return Promise.reject(error);
    }

    const errorData = error.response?.data as
      | { message?: string; error?: string; detail?: string }
      | undefined;
    const rawErrorMessage = errorData?.message || errorData?.error || errorData?.detail || '';
    const isAccountLockedOrDisabled =
      rawErrorMessage.includes('khóa') ||
      rawErrorMessage.includes('vô hiệu') ||
      rawErrorMessage.includes('ACCOUNT_LOCKED') ||
      rawErrorMessage.includes('ACCOUNT_DEACTIVATED');

    if (isAccountLockedOrDisabled) {
      clearExpiredSession(rawErrorMessage || 'Tài khoản của bạn đã bị khóa.');
      return Promise.reject(error);
    }

    originalConfig.__retried = true;

    refreshPromise ??= performRefresh().finally(() => {
      refreshPromise = null;
    });
    const newToken = await refreshPromise;

    if (!newToken) {
      clearExpiredSession();
      return Promise.reject(error);
    }

    originalConfig.headers = originalConfig.headers ?? new axios.AxiosHeaders();
    if (newToken === COOKIE_AUTH) {
      originalConfig.headers.delete('Authorization');
    } else {
      originalConfig.headers.Authorization = `Bearer ${newToken}`;
    }
    return apiClient.request(originalConfig);
  }
);

// Centralized response handling
export const handleResponse = <T>(response: AxiosResponse<unknown>): ApiResponse<T> => {
  const raw = response.data as unknown;
  let data: unknown;

  const envelopeOuter = raw as { data?: unknown } | undefined;
  const envelopeInner = envelopeOuter?.data as { data?: unknown } | undefined;
  if (envelopeInner && typeof envelopeInner === 'object' && 'data' in envelopeInner) {
    data = (envelopeInner as { data: T }).data;
  } else if (
    envelopeOuter &&
    typeof envelopeOuter === 'object' &&
    'data' in envelopeOuter &&
    typeof (envelopeOuter as { success?: unknown }).success === 'boolean'
  ) {
    data = (envelopeOuter as { data: T }).data;
  } else {
    data = raw as T;
  }

  const message =
    (envelopeInner as { message?: string } | undefined)?.message ??
    (envelopeOuter as { message?: string } | undefined)?.message ??
    (raw as { message?: string } | undefined)?.message;

  return { data: data as T, status: response.status, message };
};

// Error handling
const handleError = (error: unknown): ApiResponse<never> => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as
      | {
          message?: string;
          error?: string;
          detail?: string;
          title?: string;
          error_name?: string;
          errors?: Array<{ field?: string; message?: string }>;
        }
      | undefined;
    const fieldErrors = responseData?.errors
      ?.map((e) => e.message)
      .filter(Boolean)
      .join('; ');
    const cloudflareOriginError = responseData?.error_name === 'origin_bad_gateway';
    const message =
      fieldErrors ||
      responseData?.message ||
      responseData?.error ||
      (cloudflareOriginError
        ? 'Backend không nhận được phản hồi hợp lệ từ payOS. Vui lòng thử lại sau.'
        : responseData?.detail || responseData?.title || error.message);
    return {
      error: message,
      message,
      errors: responseData?.errors,
      status: error.response?.status || 500,
    };
  }
  return { error: 'An unknown error occurred', message: 'An unknown error occurred' };
};

//

export const ApiUpload = async <T>(
  path: string,
  formData: FormData,
  methodOrProgress?: 'POST' | 'PUT' | 'PATCH' | ((progressEvent: AxiosProgressEvent) => void),
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
): Promise<ApiResponse<T>> => {
  let method: 'POST' | 'PUT' | 'PATCH' = 'POST';
  let progress = onUploadProgress;

  if (typeof methodOrProgress === 'string') {
    method = methodOrProgress;
  } else if (typeof methodOrProgress === 'function') {
    progress = methodOrProgress;
  }

  try {
    const response = await apiClient.request({
      url: path,
      method,
      data: formData,
      onUploadProgress: progress,
    });
    return handleResponse<T>(response);
  } catch (error) {
    return handleError(error);
  }
};

// General API request function
export const ApiService = async <T>(
  path: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  data?: unknown,
  params?: Record<string, string>,
  headers?: Record<string, string>
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiClient.request({
      url: path,
      method,
      data,
      params,
      headers,
    });

    return handleResponse<T>(response);
  } catch (error) {
    return handleError(error);
  }
};

export default apiClient;
