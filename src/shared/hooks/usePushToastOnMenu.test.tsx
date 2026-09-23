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

  it('unmount cleans up the registered offset', () => {
    const { unmount } = renderHook(() => usePushToastOnMenu('test-cleanup', true, 300));

    expect(useToastStore.getState().menuOffsets['test-cleanup']).toBe(300);

    unmount();
    expect(useToastStore.getState().menuOffsets['test-cleanup']).toBeUndefined();
  });

  it('does nothing when isOpen is false', () => {
    renderHook(() => usePushToastOnMenu('test-inactive', false, 200));

    expect(useToastStore.getState().menuOffsets['test-inactive']).toBeUndefined();
  });

  it('renders a dummy element in DOM tree without throwing', () => {
    function DummyMenu({ open }: { open: boolean }) {
      usePushToastOnMenu('dummy-menu', open, 280);
      return <div data-testid="dummy-menu">Menu Content</div>;
    }

    const { getByTestId, rerender } = render(<DummyMenu open={false} />);
    expect(getByTestId('dummy-menu')).toBeDefined();

    rerender(<DummyMenu open={true} />);
    expect(useToastStore.getState().menuOffsets['dummy-menu']).toBe(280);
  });
});
