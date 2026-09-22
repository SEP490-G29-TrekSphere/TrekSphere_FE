import type { BlogPostDetail } from '../types';
import 'react-quill-new/dist/quill.snow.css';
import { sanitizeHtml, stripHtml } from '@/utils/sanitize';

interface BlogContentProps {
  post: BlogPostDetail;
}

export function BlogContent({ post }: BlogContentProps) {
  const content = post.content ?? '';

  return (
    <article
      id="blog-content"
      className="flex flex-col gap-5 text-base leading-relaxed text-primary/90 md:text-lg ql-editor [&_img]:mx-auto [&_img]:block [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-xl transition-all duration-300"
      style={{ padding: 0 }}
    >
      {stripHtml(content).trim().length === 0 ? (
        <p className="italic text-muted-foreground">Nội dung đang được cập nhật.</p>
      ) : (
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Biome warns about XSS, but this content is sanitized on the backend before being rendered here.
        <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />
      )}

      {Boolean(post.tags && post.tags.length > 0) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags?.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-primary/80"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
