import { useAppStore } from '@/store/useAppStore';
import { storage } from '@/utils/storage';

export function useAuthCheck() {
  const user = useAppStore((state) => state.user);
  const _hasHydrated = useAppStore((state) => state._hasHydrated);

  if (!_hasHydrated) {
    return { isAuthenticated: false, isLoading: true };
  }

  // Sau khi hydrated:

  const hasToken = Boolean(storage.get<string>('accessToken'));
  const isAuthenticated = Boolean(user) || hasToken;

  return { isAuthenticated, isLoading: false };
}
