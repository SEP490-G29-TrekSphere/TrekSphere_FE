/**
 * Barrel export cho feature news.
 */

export { BlogComments } from './components/BlogComments';
export { BlogContent } from './components/BlogContent';
export { BlogDetailsHero } from './components/BlogDetailsHero';
export { BlogSidebar } from './components/BlogSidebar';
// Community feed
export { FeedAvatar } from './components/feed/FeedAvatar';
export { FeedHeader, type FeedTab } from './components/feed/FeedHeader';
export { FeedPostCard } from './components/feed/FeedPostCard';
export { FeedPostSkeleton } from './components/feed/FeedPostSkeleton';
export { FeedSidebar } from './components/feed/FeedSidebar';
export { SuggestedUserRow } from './components/feed/SuggestedUserRow';
export {
  useBlogComments,
  useBlogDetail,
  useBlogList,
  useBlogRelated,
  useCreateBlogComment,
  useInfiniteBlogList,
} from './hooks/useBlog';
export { useSuggestedUsers, useToggleBlogLike, useToggleFollow } from './hooks/useSocial';
export { default as BlogDetails } from './pages/BlogDetails';
export { default as BlogList } from './pages/BlogList';
export { blogService } from './services/blogService';
export { socialService } from './services/socialService';
export type {
  BlogCategory,
  BlogCategoryId,
  BlogComment,
  BlogCommentItem,
  BlogCommentListMeta,
  BlogListItem,
  BlogListMeta,
  BlogListParams,
  BlogPost,
  BlogPostDetail,
  CreateBlogCommentPayload,
  SuggestedUser,
} from './types';
export { flattenComments } from './types';
