import { act, render, renderHook } from '@testing-library/react';
import { useToastStore } from '@/store/useToastStore';
import { usePushToastOnMenu } from './usePushToastOnMenu';

describe('usePushToastOnMenu and useToastStore menuOffsets', () => {
  beforeEach(() => {
    act(() => {
      useToastStore.setState({ menuOffsets: {}, toasts: [] });
    });
  });

  it('registers offset when menu is open', () => {
    const { rerender } = renderHook(
      ({ isOpen }) => usePushToastOnMenu('test-avatar', isOpen, 260),
      { initialProps: { isOpen: false } }
    );

    expect(useToastStore.getState().menuOffsets['test-avatar']).toBeUndefined();

    rerender({ isOpen: true });
    expect(useToastStore.getState().menuOffsets['test-avatar']).toBe(260);
  });

  it('unregisters offset when menu is closed', () => {
    const { rerender } = renderHook(
      ({ isOpen }) => usePushToastOnMenu('test-avatar', isOpen, 260),
      { initialProps: { isOpen: true } }
    );

    expect(useToastStore.getState().menuOffsets['test-avatar']).toBe(260);

    rerender({ isOpen: false });
    expect(useToastStore.getState().menuOffsets['test-avatar']).toBeUndefined();
  });

  it('unregisters offset on component unmount', () => {
    const { unmount } = renderHook(() => usePushToastOnMenu('test-notification', true, 550));

    expect(useToastStore.getState().menuOffsets['test-notification']).toBe(550);

    unmount();
    expect(useToastStore.getState().menuOffsets['test-notification']).toBeUndefined();
  });

  it('handles multiple active menus and retains the highest offset', () => {
    function MultiMenuComponent({
      avatarOpen,
      notifOpen,
    }: {
      avatarOpen: boolean;
      notifOpen: boolean;
    }) {
      usePushToastOnMenu('avatar', avatarOpen, 260);
      usePushToastOnMenu('notification', notifOpen, 550);
      return null;
    }

    const { rerender } = render(<MultiMenuComponent avatarOpen={true} notifOpen={false} />);

    let offsets = Object.values(useToastStore.getState().menuOffsets);
    expect(Math.max(...offsets)).toBe(260);

    // Both open: max should be 550
    rerender(<MultiMenuComponent avatarOpen={true} notifOpen={true} />);
    offsets = Object.values(useToastStore.getState().menuOffsets);
    expect(Math.max(...offsets)).toBe(550);

    // Notification closed, avatar still open: max should revert to 260
    rerender(<MultiMenuComponent avatarOpen={true} notifOpen={false} />);
    offsets = Object.values(useToastStore.getState().menuOffsets);
    expect(Math.max(...offsets)).toBe(260);

    // Both closed: offsets empty
    rerender(<MultiMenuComponent avatarOpen={false} notifOpen={false} />);
    offsets = Object.values(useToastStore.getState().menuOffsets);
    expect(offsets.length).toBe(0);
  });
});
