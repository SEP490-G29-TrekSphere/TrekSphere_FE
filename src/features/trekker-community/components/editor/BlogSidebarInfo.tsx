interface BlogSidebarInfoProps {
  wordCount: number;
  authorName?: string;
  authorAvatarUrl?: string;
  editMode?: boolean;
}

export function BlogSidebarInfo({
  wordCount,
  authorName,
  authorAvatarUrl,
  editMode = false,
}: BlogSidebarInfoProps) {
  return (
    <div className="w-full space-y-4 lg:w-[35%]">
      {/* Read Time Card */}
      <div className="rounded-3xl border border-border bg-card p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Số lượng từ</h3>
          <span className="text-sm font-bold text-foreground">{wordCount} từ</span>
        </div>
      </div>

      {/* Publish Info Card */}
      <div className="rounded-3xl border border-border bg-card p-5 shadow-xs">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Tác giả</h3>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary text-sm font-bold text-primary-foreground">
            {authorAvatarUrl ? (
              <img
                src={authorAvatarUrl}
                alt={authorName ?? 'Author'}
                className="h-full w-full object-cover"
              />
            ) : (
              <span>{(authorName ?? '?').charAt(0).toUpperCase()}</span>
            )}
          </div>
          <p className="text-sm font-semibold text-foreground">{authorName ?? 'Bạn'}</p>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {editMode
            ? 'Thay đổi sẽ được cập nhật ngay trên bài viết đã đăng.'
            : 'Bài viết sẽ hiển thị công khai với cộng đồng TrekSphere ngay sau khi đăng.'}
        </p>
      </div>
    </div>
  );
}
