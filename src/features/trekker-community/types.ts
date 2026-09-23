export type BlogStatus = 'DRAFT' | 'PUBLISHED' | 'HIDDEN' | 'DELETED';

export interface TrekkerBlogItem {
  blogId: string;
  title: string;
  coverImageUrl: string | null;
  status: BlogStatus;
  viewCount: number;
  authorId: string;
  authorName: string;
  authorAvatarUrl: string | null;
  totalComments: number;
  createdAt: string; // ISO date string
}

export interface TrekkerBlogDetail extends TrekkerBlogItem {
  content: string;
  updatedAt: string;
}

export interface TrekkerBlogMeta {
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

/** Response envelope cho list endpoint. */
export interface TrekkerBlogListResponse {
  items: TrekkerBlogItem[];
  meta: TrekkerBlogMeta;
}

export interface TrekkerBlogListParams {
  authorId?: string;
  page?: number;
  size?: number;
  keyword?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface CreateBlogPayload {
  title: string;
  content: string;
  coverImage?: File;
}

export interface UpdateBlogPayload {
  title?: string;
  content?: string;
  coverImage?: File;
}
