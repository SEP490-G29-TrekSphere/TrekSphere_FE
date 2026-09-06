/**
 * Khung xám thay chỗ post card trong lúc tải lần đầu.
 * Giữ đúng nhịp chiều cao của `FeedPostCard` để feed không bị nhảy layout.
 */
export function FeedPostSkeleton() {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm sm:p-5" aria-hidden>
      <div className="flex items-center gap-3">
        <div className="size-10 animate-pulse rounded-full bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-32 animate-pulse rounded bg-muted" />
          <div className="h-3 w-24 animate-pulse rounded bg-muted" />
        </div>
      </div>

      <div className="mt-3 aspect-[4/3] animate-pulse rounded-xl bg-muted" />

      <div className="mt-3 h-5 w-3/4 animate-pulse rounded bg-muted" />
      <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-muted" />

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="h-8 animate-pulse rounded bg-muted" />
        <div className="h-8 animate-pulse rounded bg-muted" />
        <div className="h-8 animate-pulse rounded bg-muted" />
      </div>

      <div className="mt-4 h-9 animate-pulse rounded-full border-t border-border bg-muted" />
    </div>
  );
}
