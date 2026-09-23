import { Eye, EyeOff, FileImage, Pencil, Trash2 } from 'lucide-react';
import type { TrekkerBlogItem } from '../types';

interface MyBlogTableProps {
  blogs: TrekkerBlogItem[];
  onEdit?: (blog: TrekkerBlogItem) => void;
  onDelete?: (blog: TrekkerBlogItem) => void;
  onHide?: (blog: TrekkerBlogItem) => void;
}

export function MyBlogTable({ blogs, onEdit, onDelete, onHide }: MyBlogTableProps) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-border bg-card">
      <div className="overflow-x-auto">
        {/* Table Header */}
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="bg-muted/60">
              <HeaderCell className="px-5 py-3.5 text-left">HÌNH ẢNH & TIÊU ĐỀ</HeaderCell>
              <HeaderCell>TRẠNG THÁI</HeaderCell>
              <HeaderCell>NGÀY TẠO</HeaderCell>
              <HeaderCell>LƯỢT XEM</HeaderCell>
              <HeaderCell className="text-center">THAO TÁC</HeaderCell>
            </tr>
          </thead>
          <tbody>
            {blogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-3">
                    <FileImage className="h-10 w-10 opacity-30 text-muted-foreground" />
                    <p className="font-medium">Chưa có bài viết nào</p>
                    <p className="text-sm">Bắt đầu chia sẻ hành trình của bạn ngay hôm nay!</p>
                  </div>
                </td>
              </tr>
            ) : (
              blogs.map((blog, index) => (
                <TableRow
                  key={blog.blogId}
                  blog={blog}
                  index={index}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onHide={onHide}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HeaderCell({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground ${className}`}
    >
      {children}
    </th>
  );
}

interface TableRowProps {
  blog: TrekkerBlogItem;
  index: number;
  onEdit?: (blog: TrekkerBlogItem) => void;
  onDelete?: (blog: TrekkerBlogItem) => void;
  onHide?: (blog: TrekkerBlogItem) => void;
}

function TableRow({ blog, index, onEdit, onDelete, onHide }: TableRowProps) {
  const isHidden = blog.status === 'HIDDEN';

  return (
    <tr
      className={`transition-colors ${index < 10 ? 'border-b border-border' : ''} ${index % 2 === 1 ? 'bg-muted/20' : 'bg-transparent'}`}
    >
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          {/* Thumbnail */}
          <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
            {blog.coverImageUrl ? (
              <img
                src={blog.coverImageUrl}
                alt={blog.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <FileImage className="h-6 w-6 opacity-30 text-muted-foreground" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p
              className="font-semibold leading-tight line-clamp-2 text-foreground"
              title={blog.title}
            >
              {blog.title}
            </p>
          </div>
        </div>
      </td>

      <td className="px-4 py-4 text-center">
        <StatusBadge status={blog.status} />
      </td>

      <td className="px-4 py-4 text-center text-muted-foreground">{formatDate(blog.createdAt)}</td>

      <td className="px-4 py-4 text-center">
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <Eye className="h-3.5 w-3.5" />
          {formatViewCount(blog.viewCount)}
        </span>
      </td>

      <td className="px-4 py-4 text-center">
        <div className="flex items-center justify-center gap-2">
          {onHide && (
            <button
              type="button"
              onClick={() => onHide(blog)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted"
              title={isHidden ? 'Hiển thị lại' : 'Ẩn bài viết'}
            >
              {isHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
          )}

          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(blog)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted"
              title="Sửa bài viết"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(blog)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-destructive transition-colors hover:bg-destructive/10"
              title="Xóa vĩnh viễn"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

function StatusBadge({ status }: { status: TrekkerBlogItem['status'] }) {
  if (status === 'PUBLISHED') {
    return (
      <span className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
        Đã xuất bản
      </span>
    );
  }

  if (status === 'HIDDEN') {
    return (
      <span className="inline-block rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
        Đã ẩn
      </span>
    );
  }

  return (
    <span className="inline-block rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
      {status}
    </span>
  );
}

function formatViewCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
}

/** Format date: "2023-10-15T00:00:00Z" → "15/10/2023" */
function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return isoString;
  }
}
