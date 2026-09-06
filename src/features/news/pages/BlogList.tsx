import { PenLine } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PATHS } from '@/constants';
import { useDebounce } from '@/shared/hooks';
import { AppSpinner } from '@/shared/ui';
import { useAppStore } from '@/store/useAppStore';
import { FeedHeader, type FeedTab } from '../components/feed/FeedHeader';
import { FeedPostCard } from '../components/feed/FeedPostCard';
import { FeedPostSkeleton } from '../components/feed/FeedPostSkeleton';
import { FeedSidebar } from '../components/feed/FeedSidebar';
import { useInfiniteBlogList } from '../hooks/useBlog';

const PAGE_SIZE = 8;
const SEARCH_DEBOUNCE_MS = 400;
/** Nạp trước khi sentinel còn cách viewport ngần này — cuộn thấy liền mạch. */
const PREFETCH_MARGIN = '400px';
const MAX_TOPICS = 8;

/**
 * Màn hình 1: Community feed (`/news`).
 * - Cột trái: tabs + tiêu đề + tìm kiếm, rồi feed 1 cột cuộn vô tận.
 * - Cột phải (từ `lg`): viết bài, gợi ý theo dõi, chủ đề nổi bật, footer.
 *
 * Phân trang dùng `useInfiniteBlogList` + `IntersectionObserver` thay cho
 * phân trang số — bám thiết kế community feed.
 */
export default function BlogList() {
  const user = useAppStore((state) => state.user);
  const isLoggedIn = Boolean(user);

  const [activeTab, setActiveTab] = useState<FeedTab>('discover');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS);

  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteBlogList({
      size: PAGE_SIZE,
      keyword: debouncedSearch.trim() || undefined,
      sortBy,
      sortDir,
    });

  const posts = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);

  /** Tag xuất hiện nhiều nhất trong các bài đang tải — dùng cho khối "Chủ đề nổi bật". */
  const topics = useMemo(() => {
    const counts = new Map<string, number>();
    for (const post of posts) {
      for (const tag of post.tags ?? []) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, MAX_TOPICS)
      .map(([tag]) => tag);
  }, [posts]);

  // Cuộn vô tận: nạp trang kế khi sentinel cuối feed lọt vào tầm nhìn.
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const isFollowingTab = activeTab === 'following';

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || isFollowingTab || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void fetchNextPage();
      },
      { rootMargin: PREFETCH_MARGIN }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [isFollowingTab, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSearchChange = (q: string) => setSearch(q);

  const handleSortChange = (newSortBy: string, newSortDir: 'asc' | 'desc') => {
    setSortBy(newSortBy);
    setSortDir(newSortDir);
  };

  const handleTopicSelect = (topic: string) => {
    setSearch(topic);
    setActiveTab('discover');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderFeed = () => {
    // Tab "Đang theo dõi" cần API follow — BE chưa có (xem FEATURES.SOCIAL).
    if (isFollowingTab) {
      return (
        <div className="rounded-2xl bg-card py-16 text-center shadow-sm">
          <p className="text-base font-semibold text-primary">Tính năng đang được phát triển</p>
          <p className="mx-auto mt-2 max-w-sm px-4 text-sm text-muted-foreground">
            Khi theo dõi được mở, bảng tin này sẽ chỉ hiển thị bài viết từ những người bạn theo dõi.
          </p>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex flex-col gap-5">
          {[0, 1, 2].map((i) => (
            <FeedPostSkeleton key={i} />
          ))}
        </div>
      );
    }

    if (isError) {
      return (
        <div className="rounded-2xl bg-card py-16 text-center shadow-sm">
          <p className="text-base font-semibold text-destructive">
            Không thể tải danh sách bài viết
          </p>
          <p className="mx-auto mt-2 max-w-sm px-4 text-sm text-muted-foreground">
            Vui lòng thử lại sau. Nếu lỗi vẫn tiếp diễn, hãy liên hệ hỗ trợ.
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-5 cursor-pointer rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            Thử lại
          </button>
        </div>
      );
    }

    if (posts.length === 0) {
      return (
        <div className="rounded-2xl bg-card py-16 text-center shadow-sm">
          <p className="text-base font-semibold text-primary">Không tìm thấy bài viết</p>
          <p className="mx-auto mt-2 max-w-sm px-4 text-sm text-muted-foreground">
            Thử thay đổi từ khóa hoặc bộ lọc tìm kiếm khác.
          </p>
        </div>
      );
    }

    return (
      <>
        <div className="flex flex-col gap-5">
          {posts.map((post) => (
            <FeedPostCard key={post.blogId} post={post} />
          ))}
        </div>

        <div ref={sentinelRef} className="flex justify-center py-8">
          {isFetchingNextPage ? (
            <AppSpinner size="default" className="text-primary" />
          ) : hasNextPage ? null : (
            <p className="text-sm text-muted-foreground">Bạn đã xem hết bài viết</p>
          )}
        </div>
      </>
    );
  };

  return (
    // pt-16 chừa chỗ cho PublicHeader (fixed, h-16) — cùng quy ước với ListTours.
    <div className="min-h-screen bg-background pt-16">
      <div className="mx-auto grid w-full max-w-[980px] gap-10 px-4 pb-16 sm:px-6 lg:grid-cols-[minmax(0,600px)_320px]">
        {/* Cột feed */}
        <div className="min-w-0">
          <FeedHeader
            activeTab={activeTab}
            onTabChange={setActiveTab}
            searchQuery={search}
            onSearchChange={handleSearchChange}
            sortBy={sortBy}
            sortDir={sortDir}
            onSortChange={handleSortChange}
          />

          {/* Dưới lg sidebar bị ẩn → đưa lối viết bài lên đầu feed */}
          <Link
            to={isLoggedIn ? PATHS.BLOG_CREATE : PATHS.LOGIN}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover lg:hidden"
          >
            <PenLine className="size-4" />
            Viết bài mới
          </Link>

          <div className="mt-6">{renderFeed()}</div>
        </div>

        {/* Cột phải — chỉ hiện từ lg trở lên */}
        <div className="hidden lg:block">
          <div className="sticky top-24 pt-6 sm:pt-8">
            <FeedSidebar
              isLoggedIn={isLoggedIn}
              topics={topics}
              onTopicSelect={handleTopicSelect}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
