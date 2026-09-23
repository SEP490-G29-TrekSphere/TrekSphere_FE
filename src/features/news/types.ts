
export interface BlogListItem {
  blogId: string;
  title: string;
  excerpt: string;
  coverImageUrl: string;

  categoryName?: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl: string;
  publishedAt?: string; // ISO
  createdAt?: string; // ISO from BE
  readingTimeMinutes?: number;
  tags?: string[];
  viewCount: number;

  totalComments?: number;
  likeCount?: number;
  likedByMe?: boolean;
  commentCount?: number;
  isFollowingAuthor?: boolean;
}

export interface SuggestedUser {
  userId: string;
  fullName: string;
  avatarUrl: string;

  subtitle?: string;
  isFollowing?: boolean;
}

export interface BlogPostDetail extends BlogListItem {

  content: string;

  comments: BlogCommentItem[];
  totalComments: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogCommentItem {
  commentId: string;
  userId: string;
  userFullName: string;
  userAvatarUrl: string;
  content: string;
  status?: 'ACTIVE' | 'HIDDEN' | 'DELETED' | string;
  createdAt: string;
  replies?: BlogCommentItem[];
}

export interface BlogListMeta {
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

export interface BlogCommentListMeta extends BlogListMeta {}

export interface CreateBlogCommentPayload {
  content: string;
  parentCommentId?: string | null;
}

export interface UpdateBlogCommentPayload {
  content: string;
}

export interface BlogListParams {
  keyword?: string;

  authorId?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface BlogPost extends BlogListItem {}

export interface BlogComment extends BlogCommentItem {}

export type BlogCategoryId = 'all' | 'experience' | 'review' | 'equipment' | 'guide';

export interface BlogCategory {
  id: BlogCategoryId;
  label: string;
}

export function flattenComments(comments: BlogCommentItem[]): BlogCommentItem[] {
  const flat: BlogCommentItem[] = [];
  for (const c of comments) {
    flat.push(c);
    if (c.replies?.length) {
      flat.push(...flattenComments(c.replies));
    }
  }
  return flat;
}
