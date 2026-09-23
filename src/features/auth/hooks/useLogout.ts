import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { queryClient } from '@/config/queryClient';
import { PATHS } from '@/constants';
import { authService } from '@/features/auth';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import { storage } from '@/utils/storage';

interface UseLogoutOptions {
  redirectTo?: string;

  callApi?: boolean;
}

interface UseLogoutReturn {
  logout: () => Promise<void>;
  isLoggingOut: boolean;
}

export function useLogout(options: UseLogoutOptions = {}): UseLogoutReturn {
  const { redirectTo = PATHS.HOME, callApi = true } = options;
  const navigate = useNavigate();
  const setUser = useAppStore((state) => state.setUser);

  const logout = useCallback(async () => {
    try {
      if (callApi) {
        await authService.logout();
      }
    } catch (err) {
      console.warn('[useLogout] authService.logout failed (continuing anyway):', err);
    }

    storage.remove('accessToken');
    storage.remove('refreshToken');
    setUser(null);
    queryClient.clear();
    toast.success('Đã đăng xuất.');
    navigate(redirectTo);
  }, [callApi, navigate, redirectTo, setUser]);

  return { logout, isLoggingOut: false };
}
