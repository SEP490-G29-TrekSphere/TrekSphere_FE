import DOMPurify from 'dompurify';

export function getSafeImageUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('blob:')) return url;
  try {
    const parsed = new URL(url, 'http://dummy.local');
    const allowedProtocols = ['http:', 'https:', 'data:'];
    return allowedProtocols.includes(parsed.protocol) ? url : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Validate and sanitize external URL to prevent javascript: and protocol-relative XSS.
 */
export function getSafeExternalUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  try {
    const parsed = new URL(
      trimmed.startsWith('http://') || trimmed.startsWith('https://')
        ? trimmed
        : `https://${trimmed}`
    );
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
      ? parsed.toString()
      : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Sanitize telephone number for safe tel: href attribute.
 */
export function getSafeTelUri(phone: string | null | undefined): string | undefined {
  if (!phone) return undefined;
  const cleaned = phone.replace(/[^\d+*#]/g, '');
  return cleaned ? `tel:${cleaned}` : undefined;
}

/**
 * Sanitize internal application path to prevent open redirect and javascript: injection.
 */
export function sanitizeInternalUrl(url: string | null | undefined): string | undefined {
  if (!url || typeof url !== 'string') return undefined;
  const trimmed = url.trim();
  if (
    trimmed.startsWith('/') &&
    !trimmed.startsWith('//') &&
    !trimmed.startsWith('/\\') &&
    !trimmed.includes('javascript:')
  ) {
    return trimmed;
  }
  return undefined;
}

/**
 * Sanitize HTML content to prevent XSS.
 * Removes dangerous tags like <script>, <iframe>, etc.
 */
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return '';
  return DOMPurify.sanitize(html);
}

/**
 * Extract plain text from HTML, stripping out all tags.
 * Safer than using RegExp /<[^>]+>/g which can be bypassed.
 */
export function stripHtml(html: string | null | undefined): string {
  if (!html) return '';
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
}
