import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { normalizeRoleList } from '@/constants/roles';

export interface AppUser {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  roles?: string[];
}

interface AppState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  user: AppUser | null;
  setUser: (user: AppUser | null) => void;
  isLoading: boolean;
  setLoading: (isLoading: boolean) => void;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

/**
 * Global application store for session, user identity, and UI layout states.
 */
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isSidebarOpen: true,
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      user: null,
      /**
       * Normalizes roles at store ingress to ensure uniform RBAC checks across portals.
       */
      setUser: (user) =>
        set({ user: user ? { ...user, roles: normalizeRoleList(user.roles) } : null }),
      isLoading: false,
      setLoading: (isLoading) => set({ isLoading }),
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'treksphere-app-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('[Store] Rehydration failed:', error);
        }
        if (state) {
          if (state.user) {
            state.setUser(state.user);
          }
          state.setHasHydrated(true);
        } else {
          setTimeout(() => {
            useAppStore.getState().setHasHydrated?.(true);
          }, 0);
        }
      },
    }
  )
);
