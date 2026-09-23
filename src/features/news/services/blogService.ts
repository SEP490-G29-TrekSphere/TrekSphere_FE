import { ApiService } from '@/config/apiClient';
import type {
  BlogCommentItem,
  BlogCommentListMeta,
  BlogListItem,
  BlogListMeta,
  BlogListParams,
  BlogPostDetail,
  CreateBlogCommentPayload,
  UpdateBlogCommentPayload,
} from '../types';

export const blogService = {
  async getPosts(
    params: BlogListParams = {}
  ): Promise<{ items: BlogListItem[]; meta: BlogListMeta }> {
    const query = new URLSearchParams();
    if (params.keyword?.trim()) query.set('keyword', params.keyword.trim());
    if (params.authorId) query.set('authorId', params.authorId);
    if (params.page) query.set('page', String(params.page - 1));
    if (params.size) query.set('size', String(params.size));
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.sortDir) query.set('sortDir', params.sortDir);

    const qs = query.toString();
    const res = await ApiService<{
      content: BlogListItem[];
      pageNumber: number;
      pageSize: number;
      totalElements: number;
      totalPages: number;
    }>(`/blogs${qs ? `?${qs}` : ''}`, 'GET');

    if (res.error) {
      throw new Error(res.error);
    }

    const data = res.data;
    return {
      items: data?.content ?? [],
      meta: {
        pageNumber: (data?.pageNumber ?? params.page ?? 1) + 1,
        pageSize: data?.pageSize ?? params.size ?? 10,
        totalElements: data?.totalElements ?? 0,
        totalPages: data?.totalPages ?? 1,
      },
    };
  },

  async getPostById(id: string): Promise<BlogPostDetail | null> {
    const res = await ApiService<BlogPostDetail>(`/blogs/${id}`, 'GET');
    if (res.error) {
      if (res.status === 404) return null;
      throw new Error(res.error);
    }
    return res.data ?? null;
  },

  async getCommentsById(
    id: string,
    params: { page?: number; size?: number; topLevelOnly?: boolean } = {}
  ): Promise<{ items: BlogCommentItem[]; meta: BlogCommentListMeta }> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page - 1));
    if (params.size) query.set('size', String(params.size));
    if (params.topLevelOnly !== undefined) query.set('topLevelOnly', String(params.topLevelOnly));
    const qs = query.toString();
    const res = await ApiService<{
      content: BlogCommentItem[];
      pageNumber: number;
      pageSize: number;
      totalElements: number;
      totalPages: number;
    }>(`/blogs/${id}/comments${qs ? `?${qs}` : ''}`, 'GET');

    if (res.error) {
      throw new Error(res.error);
    }

    const data = res.data;
    return {
      items: data?.content ?? [],
      meta: {
        pageNumber: (data?.pageNumber ?? params.page ?? 1) + 1,
        pageSize: data?.pageSize ?? params.size ?? 10,
        totalElements: data?.totalElements ?? 0,
        totalPages: data?.totalPages ?? 1,
      },
    };
  },

  async createComment(blogId: string, payload: CreateBlogCommentPayload): Promise<BlogCommentItem> {
    const res = await ApiService<BlogCommentItem>(`/blogs/${blogId}/comments`, 'POST', payload);
    if (res.error) {
      throw new Error(res.error);
    }
    if (!res.data) {
      throw new Error('Không nhận được phản hồi từ máy chủ.');
    }
    return res.data;
  },

  async updateComment(
    commentId: string,
    payload: UpdateBlogCommentPayload
  ): Promise<BlogCommentItem> {
    const res = await ApiService<BlogCommentItem>(`/blogs/comments/${commentId}`, 'PUT', payload);
    if (res.error) {
      throw new Error(res.error);
    }
    if (!res.data) {
      throw new Error('Không nhận được phản hồi từ máy chủ.');
    }
    return res.data;
  },

  async deleteComment(commentId: string): Promise<void> {
    const res = await ApiService<void>(`/blogs/comments/${commentId}`, 'DELETE');
    if (res.error) {
      throw new Error(res.error);
    }
  },
};
