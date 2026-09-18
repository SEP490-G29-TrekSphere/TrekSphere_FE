import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

// Configure marked options
marked.setOptions({
  gfm: true,
  breaks: true,
});

export interface RichTextContentProps {
  content?: string | null;
  className?: string;
  variant?: 'default' | 'dark' | 'muted' | 'compact';
  fallback?: string;
}

/**
 * RichTextContent: Renders Markdown and formatted text with Notion / Document / Blog styling.
 * Automatically formats headers, bold text, bullet lists, spacing, callouts, tables, and dividers.
 * Fully sanitized with DOMPurify against XSS.
 */
export function RichTextContent({
  content,
  className,
  variant = 'default',
  fallback,
}: RichTextContentProps) {
  const sanitizedHtml = useMemo(() => {
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return '';
    }

    let processedContent = content.trim();

    // Fix potential raw inline header tags that lack preceding newlines
    // e.g. "Text - - ### Title" or "Text ### Title"
    processedContent = processedContent.replace(/([^\n])\s*(#{1,6}\s+)/g, '$1\n\n$2');

    // Parse markdown to HTML synchronously
    const rawHtml = marked.parse(processedContent, { async: false }) as string;

    // Sanitize with DOMPurify
    return DOMPurify.sanitize(rawHtml, {
      USE_PROFILES: { html: true },
      ADD_ATTR: ['target', 'rel'],
    });
  }, [content]);

  if (!sanitizedHtml) {
    if (fallback) {
      return <p className={cn('text-sm italic text-muted-foreground', className)}>{fallback}</p>;
    }
    return null;
  }

  const variantStyles = {
    default: `
      text-foreground/90
      [&_h1]:text-xl [&_h1]:font-black [&_h1]:text-foreground [&_h1]:mt-5 [&_h1]:mb-2.5 [&_h1]:tracking-tight [&_h1]:border-b [&_h1]:border-border/60 [&_h1]:pb-1.5
      [&_h2]:text-lg [&_h2]:font-extrabold [&_h2]:text-foreground [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:tracking-tight [&_h2]:border-b [&_h2]:border-border/40 [&_h2]:pb-1
      [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-foreground [&_h3]:mt-3.5 [&_h3]:mb-1.5
      [&_h4]:text-sm [&_h4]:font-bold [&_h4]:text-foreground [&_h4]:mt-3 [&_h4]:mb-1
      [&_h5]:text-xs [&_h5]:font-bold [&_h5]:text-foreground [&_h5]:mt-2.5 [&_h5]:mb-1
      [&_h6]:text-xs [&_h6]:font-bold [&_h6]:text-muted-foreground [&_h6]:mt-2 [&_h6]:mb-1
      [&_p]:my-2 [&_p]:leading-relaxed [&_p]:text-foreground/80
      [&_strong]:font-bold [&_strong]:text-foreground
      [&_b]:font-bold [&_b]:text-foreground
      [&_em]:italic [&_em]:text-foreground/90
      [&_ul]:my-2.5 [&_ul]:ml-4 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:text-foreground/80
      [&_ol]:my-2.5 [&_ol]:ml-4 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:text-foreground/80
      [&_li]:pl-1 [&_li]:leading-relaxed [&_li::marker]:text-primary/70
      [&_hr]:my-4 [&_hr]:border-t [&_hr]:border-border/70
      [&_blockquote]:my-3 [&_blockquote]:rounded-2xl [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:bg-primary/5 [&_blockquote]:p-3.5 [&_blockquote]:text-foreground/90 [&_blockquote]:font-medium [&_blockquote]:italic
      [&_table]:my-3.5 [&_table]:w-full [&_table]:border-collapse [&_table]:text-xs [&_table]:sm:text-sm
      [&_th]:border [&_th]:border-border [&_th]:bg-muted/60 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-bold [&_th]:text-foreground
      [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:text-foreground/80
      [&_code]:rounded-md [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_code]:font-semibold [&_code]:text-primary
      [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-2xl [&_pre]:bg-slate-900 [&_pre]:p-4 [&_pre]:text-xs [&_pre]:text-slate-100
      [&_a]:font-semibold [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:text-primary-hover [&_a]:transition-colors
    `,
    dark: `
      text-white/90
      [&_h1]:text-xl [&_h1]:font-black [&_h1]:text-white [&_h1]:mt-5 [&_h1]:mb-2.5 [&_h1]:tracking-tight [&_h1]:border-b [&_h1]:border-white/20 [&_h1]:pb-1.5
      [&_h2]:text-lg [&_h2]:font-extrabold [&_h2]:text-white [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:tracking-tight [&_h2]:border-b [&_h2]:border-white/15 [&_h2]:pb-1
      [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-white [&_h3]:mt-3.5 [&_h3]:mb-1.5
      [&_h4]:text-sm [&_h4]:font-bold [&_h4]:text-white [&_h4]:mt-3 [&_h4]:mb-1
      [&_p]:my-2 [&_p]:leading-relaxed [&_p]:text-white/85
      [&_strong]:font-bold [&_strong]:text-white
      [&_b]:font-bold [&_b]:text-white
      [&_em]:italic [&_em]:text-white/90
      [&_ul]:my-2.5 [&_ul]:ml-4 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:text-white/85
      [&_ol]:my-2.5 [&_ol]:ml-4 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:text-white/85
      [&_li]:pl-1 [&_li]:leading-relaxed [&_li::marker]:text-white/70
      [&_hr]:my-4 [&_hr]:border-t [&_hr]:border-white/20
      [&_blockquote]:my-3 [&_blockquote]:rounded-2xl [&_blockquote]:border-l-4 [&_blockquote]:border-white/60 [&_blockquote]:bg-white/10 [&_blockquote]:p-3.5 [&_blockquote]:text-white
      [&_code]:rounded-md [&_code]:bg-white/15 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_code]:text-white
      [&_a]:font-semibold [&_a]:text-white [&_a]:underline [&_a]:underline-offset-2
    `,
    muted: `
      text-muted-foreground
      [&_h1]:text-lg [&_h1]:font-extrabold [&_h1]:text-foreground [&_h1]:mt-4 [&_h1]:mb-2
      [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mt-3.5 [&_h2]:mb-1.5
      [&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-foreground [&_h3]:mt-3 [&_h3]:mb-1
      [&_h4]:text-xs [&_h4]:font-bold [&_h4]:text-foreground [&_h4]:mt-2.5 [&_h4]:mb-1
      [&_p]:my-1.5 [&_p]:leading-relaxed [&_p]:text-muted-foreground
      [&_strong]:font-bold [&_strong]:text-foreground
      [&_b]:font-bold [&_b]:text-foreground
      [&_em]:italic
      [&_ul]:my-2 [&_ul]:ml-4 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:text-muted-foreground
      [&_ol]:my-2 [&_ol]:ml-4 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:text-muted-foreground
      [&_li]:pl-1 [&_li]:leading-relaxed [&_li::marker]:text-primary/60
      [&_hr]:my-3 [&_hr]:border-t [&_hr]:border-border/60
      [&_blockquote]:my-2.5 [&_blockquote]:rounded-xl [&_blockquote]:border-l-4 [&_blockquote]:border-primary/50 [&_blockquote]:bg-primary/5 [&_blockquote]:p-3 [&_blockquote]:text-foreground/90
      [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_code]:text-primary
      [&_a]:font-semibold [&_a]:text-primary [&_a]:underline
    `,
    compact: `
      text-xs text-foreground/90
      [&_h1]:text-sm [&_h1]:font-extrabold [&_h1]:text-foreground [&_h1]:mt-2.5 [&_h1]:mb-1
      [&_h2]:text-xs [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mt-2 [&_h2]:mb-1
      [&_h3]:text-xs [&_h3]:font-bold [&_h3]:text-foreground [&_h3]:mt-1.5 [&_h3]:mb-0.5
      [&_p]:my-1 [&_p]:leading-relaxed [&_p]:text-foreground/80
      [&_strong]:font-bold [&_strong]:text-foreground
      [&_b]:font-bold [&_b]:text-foreground
      [&_ul]:my-1 [&_ul]:ml-3.5 [&_ul]:list-disc [&_ul]:space-y-0.5 [&_ul]:text-foreground/80
      [&_ol]:my-1 [&_ol]:ml-3.5 [&_ol]:list-decimal [&_ol]:space-y-0.5 [&_ol]:text-foreground/80
      [&_li]:pl-0.5 [&_li]:leading-relaxed
      [&_hr]:my-2 [&_hr]:border-t [&_hr]:border-border/50
    `,
  };

  return (
    <div
      className={cn(
        'rich-text-content break-words text-xs sm:text-sm leading-relaxed',
        variantStyles[variant],
        className
      )}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Sanitized with DOMPurify
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}
