import { useEffect, useMemo, useRef, useState } from 'react';
import { useDebounce } from '@/shared/hooks';
import { AppSpinner } from '@/shared/ui';
import { FeedHeader } from '../components/feed/FeedHeader';
import { FeedPostCard } from '../components/feed/FeedPostCard';
import { FeedPostSkeleton } from '../components/feed/FeedPostSkeleton';
import { FEED_MAX_TOPICS, FEED_PAGE_SIZE, SEARCH_DEBOUNCE_MS } from '../constants';
import { useInfiniteBlogList } from '../hooks/useBlog';

const PREFETCH_MARGIN = '400px';

export default function BlogList() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS);

  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteBlogList({
      size: FEED_PAGE_SIZE,
      keyword: debouncedSearch.trim() || undefined,
      sortBy,
      sortDir,
    });

  const posts = useMemo(() => {
    const raw = data?.pages.flatMap((p) => p.items) ?? [];
    if (sortBy === 'createdAt') {
      return [...raw].sort((a, b) => {
        const timeA = new Date(a.createdAt || a.publishedAt || 0).getTime();
        const timeB = new Date(b.createdAt || b.publishedAt || 0).getTime();
        return sortDir === 'asc' ? timeA - timeB : timeB - timeA;
      });
    }
    return raw;
  }, [data, sortBy, sortDir]);

  const topics = useMemo(() => {
    const counts = new Map<string, number>();
    for (const post of posts) {
      for (const tag of post.tags ?? []) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, FEED_MAX_TOPICS)
      .map(([tag]) => tag);
  }, [posts]);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void fetchNextPage();
      },
      { rootMargin: PREFETCH_MARGIN }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSearchChange = (q: string) => setSearch(q);

  const handleSortChange = (newSortBy: string, newSortDir: 'asc' | 'desc') => {
    setSortBy(newSortBy);
    setSortDir(newSortDir);
  };

  const handleTopicSelect = (topic: string) => {
    setSearch(topic);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderFeed = () => {
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
    <div className="min-h-screen bg-background pt-16">
      <div className="mx-auto w-full max-w-[760px] px-4 pb-16 sm:px-6">
        <FeedHeader
          searchQuery={search}
          onSearchChange={handleSearchChange}
          sortBy={sortBy}
          sortDir={sortDir}
          onSortChange={handleSortChange}
          topics={topics}
          onTopicSelect={handleTopicSelect}
        />

        <div className="mt-8">{renderFeed()}</div>
      </div>
    </div>
  );
}
