import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import type { BlogListItem } from '@/features/news';
import { ProfileScreen } from './ProfileScreen';

jest.mock('react-router-dom', () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => <a href={to}>{children}</a>,
  useNavigate: () => jest.fn(),
}));

jest.mock('@/store/useAppStore', () => ({
  useAppStore: (selector: (state: unknown) => unknown) => selector({ user: { id: 'me-1' } }),
}));

jest.mock('@/shared/ui', () => ({
  AppSpinner: () => null,
}));

jest.mock('@/features/news', () => ({
  useToggleFollow: () => ({ mutate: jest.fn(), isAvailable: false }),
  useToggleBlogLike: () => ({ mutate: jest.fn(), isAvailable: false }),
}));

jest.mock('@/features/news/hooks/useSocial', () => ({
  useToggleBlogLike: () => ({ mutate: jest.fn(), isAvailable: false }),
  useToggleFollow: () => ({ mutate: jest.fn(), isAvailable: false }),
}));

const mockMe = {
  id: 'me-1',
  email: 'tuan@example.com',
  name: 'Minh Tuấn',
  phone: '0900000000',
  avatar: '',
  gender: 'male' as const,
  dateOfBirth: '2004-06-22',
  roles: ['trekker'],
  role: 'trekker',
};

let mockMeQuery: Record<string, unknown> = {};
let mockPublicQuery: Record<string, unknown> = {};
let mockBlogsQuery: Record<string, unknown> = {};
let mockHikingQuery: Record<string, unknown> = {};

jest.mock('../../hooks/useProfile', () => ({
  useProfile: () => mockMeQuery,
  profileKeys: { all: ['profile'], detail: (id: string) => ['profile', 'detail', id] },
}));

jest.mock('../../hooks/usePublicProfile', () => ({
  usePublicProfile: () => mockPublicQuery,
  useUserBlogs: () => mockBlogsQuery,
  usePublicHikingSummary: () => mockHikingQuery,
}));

jest.mock('../../hooks/useUserMoments', () => ({
  useUserMoments: () => ({ data: { items: [] }, isLoading: false }),
  useUserMomentsMap: () => ({ data: [], isLoading: false }),
  useCreatePersonalMoment: () => ({ mutate: jest.fn(), isPending: false }),
  useUpdatePersonalMomentVisibility: () => ({ mutate: jest.fn(), isPending: false }),
  useDeletePersonalMoment: () => ({ mutate: jest.fn(), isPending: false }),
}));

jest.mock('@/features/companion-groups/hooks/useGroupPeerReviews', () => ({
  useUserPeerReviews: () => ({ data: [], isLoading: false }),
}));

const post: BlogListItem = {
  blogId: 'b1',
  title: 'Cung đường Tà Xùa mùa săn mây',
  excerpt: 'Ghi chép hai ngày một đêm.',
  coverImageUrl: 'https://example.com/cover.jpg',
  authorId: 'me-1',
  authorName: 'Minh Tuấn',
  authorAvatarUrl: '',
  publishedAt: '2026-07-28T00:00:00Z',
  readingTimeMinutes: 7,
  tags: ['taxua'],
  viewCount: 1234,
};

describe('ProfileScreen', () => {
  beforeEach(() => {
    mockMeQuery = { data: mockMe, isLoading: false, isError: false, refetch: jest.fn() };
    mockPublicQuery = { data: null, isLoading: false };
    mockHikingQuery = { data: null, isLoading: false };
    mockBlogsQuery = {
      data: {
        items: [post],
        meta: { pageNumber: 1, pageSize: 12, totalElements: 3, totalPages: 1 },
      },
      isLoading: false,
    };
  });

  it('hồ sơ của tôi: hiện email, số bài viết thật và tab Thông tin mở sẵn', () => {
    render(<ProfileScreen mode="me" />);

    expect(screen.getAllByText('Minh Tuấn').length).toBeGreaterThan(0);
    expect(screen.getAllByText('tuan@example.com').length).toBeGreaterThan(0);
    expect(screen.getByText('Trekker')).toBeTruthy();
    expect(screen.getByText('3')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Thông tin' })).toBeTruthy();
    expect(screen.getByText('Chỉnh sửa hồ sơ')).toBeTruthy();
    expect(screen.getByText('Thông tin cá nhân')).toBeTruthy();
    expect(screen.getByText('0900000000')).toBeTruthy();
  });

  it('hồ sơ người khác: không lộ email, không có tab Thông tin, có nút Nhắn tin', () => {
    mockPublicQuery = {
      data: { userId: 'u2', fullName: 'Joseph Kemp', avatarUrl: '' },
      isLoading: false,
    };
    mockHikingQuery = { data: null, isLoading: false };

    render(<ProfileScreen mode="public" userId="u2" />);

    expect(screen.getByText('Joseph Kemp')).toBeTruthy();
    expect(screen.queryByText('tuan@example.com')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Thông tin' })).toBeNull();

    expect(screen.getByRole('button', { name: /Nhắn tin/i })).toBeTruthy();
  });

  it('hồ sơ người khác không tồn tại: hiện thông báo thay vì hồ sơ rỗng', () => {
    mockPublicQuery = { data: null, isLoading: false };

    render(<ProfileScreen mode="public" userId="u404" />);

    expect(screen.getByText('Không hiển thị được hồ sơ')).toBeTruthy();
  });

  it('tab Đánh giá hiển thị tổng quan điểm uy tín và thông báo rỗng', () => {
    render(<ProfileScreen mode="me" />);

    fireEvent.click(screen.getByRole('button', { name: 'Đánh giá' }));

    expect(screen.getByText('Chưa có đánh giá nào')).toBeTruthy();
  });

  it('hồ sơ của tôi: tab Thông tin hiển thị cả kinh nghiệm, kỹ năng và khu vực từ API', () => {
    mockMeQuery = {
      data: {
        ...mockMe,
        experienceLevel: 'ADVANCED',
        preferredDifficulty: 'HARD',
        preferredAreas: ['Tây Bắc'],
        skills: ['Sơ cứu'],
        trustScore: 82,
        trustReviewCount: 5,
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    };

    render(<ProfileScreen mode="me" />);

    expect(screen.getAllByText('Nâng cao').length).toBeGreaterThan(0);
    expect(screen.getByText('Thử thách')).toBeTruthy();
    expect(screen.getByText('Tây Bắc')).toBeTruthy();
    expect(screen.getByText('Sơ cứu')).toBeTruthy();
  });
});
