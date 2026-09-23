import { useEffect } from 'react';
import { useToastStore } from '@/store/useToastStore';

/**
 * Hook to dynamically push down the global toast container when a menu/dropdown
 * (e.g. user avatar dropdown, notification bell popover) is open, preventing visual overlap.
 *
 * @param menuId - Unique identifier for the menu/dropdown
 * @param isOpen - Whether the menu is currently open
 * @param offset - The target top offset in pixels (e.g. 260 for avatar dropdown, 550 for notification popover)
 */
export function usePushToastOnMenu(menuId: string, isOpen: boolean, offset = 260): void {
  const registerMenuOffset = useToastStore((state) => state.registerMenuOffset);
  const unregisterMenuOffset = useToastStore((state) => state.unregisterMenuOffset);

  useEffect(() => {
    if (isOpen) {
      registerMenuOffset(menuId, offset);
      return () => {
        unregisterMenuOffset(menuId);
      };
    }
    unregisterMenuOffset(menuId);
  }, [menuId, isOpen, offset, registerMenuOffset, unregisterMenuOffset]);
}
