import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import type { BlogListItem } from '../types';
import BlogList from './BlogList';

jest.mock('react-router-dom', () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => <a href={to}>{children}</a>,
}));

jest.mock('@/store/useAppStore', () => ({
  useAppStore: (selector: (state: unknown) => unknown) => selector({ user: { id: 'u1' } }),
}));

jest.mock('@/shared/ui', () => ({
  AppSpinner: () => null,
}));

jest.mock('../hooks/useSocial', () => ({
  useToggleBlogLike: () => ({ mutate: jest.fn(), isAvailable: false }),
  useToggleFollow: () => ({ mutate: jest.fn(), isAvailable: false }),
  useSuggestedUsers: () => ({ users: [], isLoading: false, isAvailable: false }),
}));

const mockFetchNextPage = jest.fn();
let mockQueryState: Record<string, unknown> = {};

jest.mock('../hooks/useBlog', () => ({
  useInfiniteBlogList: () => mockQueryState,
}));

/** Bắt callback của IntersectionObserver để chủ động kích hoạt trong test. */
let observerCallback: IntersectionObserverCallback | null = null;
const observeSpy = jest.fn();

class MockIntersectionObserver {
  constructor(cb: IntersectionObserverCallback) {
    observerCallback = cb;
  }
  observe = observeSpy;
  disconnect = jest.fn();
  unobserve = jest.fn();
  takeRecords = jest.fn();
}

const post: BlogListItem = {
  blogId: 'b1',
  title: 'Cung đường Tà Xùa mùa săn mây',
  excerpt: 'Ghi chép hai ngày một đêm.',
  coverImageUrl: 'https://example.com/cover.jpg',
  authorId: 'u1',
  authorName: 'Minh Tuấn',
  authorAvatarUrl: '',
  publishedAt: '2026-07-28T00:00:00Z',
  readingTimeMinutes: 7,
  tags: ['taxua'],
  viewCount: 1234,
};

const loadedState = {
  data: { pages: [{ items: [post] }] },
  isLoading: false,
  isError: false,
  refetch: jest.fn(),
  fetchNextPage: mockFetchNextPage,
  hasNextPage: true,
  isFetchingNextPage: false,
};

describe('BlogList (community feed)', () => {
  beforeAll(() => {
    (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver =
      MockIntersectionObserver;
  });

  beforeEach(() => {
    observerCallback = null;
    observeSpy.mockClear();
    mockFetchNextPage.mockClear();
    mockQueryState = { ...loadedState };
  });

  it('hiển thị khung xám khi đang tải lần đầu', () => {
    mockQueryState = { ...loadedState, data: undefined, isLoading: true };
    const { container } = render(<BlogList />);

    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
    expect(screen.queryByText('Cung đường Tà Xùa mùa săn mây')).toBeNull();
  });

  it('render bài viết và ô tìm kiếm sau khi tải xong', () => {
    render(<BlogList />);

    expect(screen.getByText('Cung đường Tà Xùa mùa săn mây')).toBeTruthy();
    expect(screen.getByLabelText('Tìm kiếm bài viết')).toBeTruthy();
  });

  it('gọi fetchNextPage khi sentinel cuối feed lọt vào tầm nhìn', () => {
    render(<BlogList />);

    expect(observeSpy).toHaveBeenCalled();
    observerCallback?.([{ isIntersecting: true } as IntersectionObserverEntry], {
      // biome-ignore lint/suspicious/noExplicitAny: chỉ cần callback, không dùng instance
    } as any);

    expect(mockFetchNextPage).toHaveBeenCalled();
  });

  it('báo đã hết bài khi không còn trang kế', () => {
    mockQueryState = { ...loadedState, hasNextPage: false };
    render(<BlogList />);

    expect(screen.getByText('Bạn đã xem hết bài viết')).toBeTruthy();
  });

  it('tab "Đang theo dõi" hiển thị thông báo tính năng chưa mở', () => {
    render(<BlogList />);

    fireEvent.click(screen.getByRole('button', { name: 'Đang theo dõi' }));

    expect(screen.getByText('Tính năng đang được phát triển')).toBeTruthy();
  });
});
