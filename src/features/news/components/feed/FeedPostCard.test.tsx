import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import type { BlogListItem } from '../../types';
import { FeedPostCard } from './FeedPostCard';

jest.mock('react-router-dom', () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => <a href={to}>{children}</a>,
}));

const mockLike = jest.fn();
const mockFollow = jest.fn();
let mockSocialAvailable = false;

jest.mock('../../hooks/useSocial', () => ({
  useToggleBlogLike: () => ({ mutate: mockLike, isAvailable: mockSocialAvailable }),
  useToggleFollow: () => ({ mutate: mockFollow, isAvailable: mockSocialAvailable }),
}));

const post: BlogListItem = {
  blogId: 'b1',
  title: 'Cung đường Tà Xùa mùa săn mây',
  excerpt: 'Ghi chép hai ngày một đêm.',
  coverImageUrl: 'https://example.com/cover.jpg',
  categoryName: 'Kinh nghiệm',
  authorId: 'u1',
  authorName: 'Minh Tuấn',
  authorAvatarUrl: '',
  publishedAt: '2026-07-28T00:00:00Z',
  readingTimeMinutes: 7,
  tags: ['taxua', 'trekking'],
  viewCount: 1234,
};

describe('FeedPostCard', () => {
  beforeEach(() => {
    mockSocialAvailable = false;
    mockLike.mockClear();
    mockFollow.mockClear();
  });

  it('hiển thị tiêu đề, tác giả, tags và các chỉ số của bài viết', () => {
    render(<FeedPostCard post={post} />);

    expect(screen.getByText('Cung đường Tà Xùa mùa săn mây')).toBeTruthy();
    expect(screen.getByText('Minh Tuấn')).toBeTruthy();
    expect(screen.getByText('Kinh nghiệm')).toBeTruthy();
    expect(screen.getByText('#taxua')).toBeTruthy();
    expect(screen.getByText('7 phút')).toBeTruthy();
    expect(screen.getByText('1.234')).toBeTruthy();
  });

  it('hiển thị "—" cho chỉ số BE chưa trả về', () => {
    render(<FeedPostCard post={post} />);

    // `commentCount` chưa có trong response BE → ô Bình luận rơi về dấu gạch.
    expect(screen.getByText('—')).toBeTruthy();
  });

  it('vô hiệu hoá nút Thích và Theo dõi khi FEATURES.SOCIAL đang tắt', () => {
    render(<FeedPostCard post={post} />);

    const likeButton = screen.getByRole('button', { name: 'Thích bài viết' }) as HTMLButtonElement;
    const followButton = screen.getByRole('button', { name: 'Theo dõi' }) as HTMLButtonElement;

    expect(likeButton.disabled).toBe(true);
    expect(followButton.disabled).toBe(true);
    expect(mockLike).not.toHaveBeenCalled();
  });

  it('bật nút Thích khi FEATURES.SOCIAL đã mở', () => {
    mockSocialAvailable = true;
    render(<FeedPostCard post={post} />);

    const likeButton = screen.getByRole('button', { name: 'Thích bài viết' }) as HTMLButtonElement;
    expect(likeButton.disabled).toBe(false);
  });
});
