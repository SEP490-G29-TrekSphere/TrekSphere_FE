/**
 * Constants dùng chung cho feature News/Blog.
 */

export const EMPTY_STAT = '—';

export const FEED_PAGE_SIZE = 8;
export const FEED_MAX_TOPICS = 8;
export const SEARCH_DEBOUNCE_MS = 400;

export const INITIAL_VISIBLE_COMMENTS = 5;
export const COMMENTS_LOAD_MORE_STEP = 5;

export const FEED_SORT_OPTIONS = [
  { value: 'createdAt-desc', label: 'Mới nhất' },
  { value: 'createdAt-asc', label: 'Cũ nhất' },
  { value: 'viewCount-desc', label: 'Xem nhiều nhất' },
] as const;

export const COMMENT_SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'oldest', label: 'Cũ nhất' },
] as const;

export type CommentSortOrder = (typeof COMMENT_SORT_OPTIONS)[number]['value'];
