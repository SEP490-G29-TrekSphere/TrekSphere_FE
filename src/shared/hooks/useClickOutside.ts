import { useEffect, useRef } from 'react';

export function useClickOutside<T extends HTMLElement>(onOutsideClick: () => void, active = true) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!active) return;

    function handlePointerDown(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onOutsideClick();
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [active, onOutsideClick]);

  return ref;
}
