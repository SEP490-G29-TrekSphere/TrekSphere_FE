import { type ApiResponse, ApiService, ApiUpload } from '@/config/apiClient';
import type {
  CreateBlogPayload,
  TrekkerBlogDetail,
  TrekkerBlogItem,
  TrekkerBlogListParams,
  TrekkerBlogListResponse,
  UpdateBlogPayload,
} from '../types';

interface PaginationResponseDto<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

function buildBlogFormData(payload: CreateBlogPayload | UpdateBlogPayload): FormData {
  const formData = new FormData();
  if (payload.title !== undefined) formData.append('title', payload.title);
  if (payload.content !== undefined) formData.append('content', payload.content);
  if (payload.coverImage) formData.append('coverImage', payload.coverImage);
  return formData;
}

function unwrapResponse<T>(response: ApiResponse<T>): T {
  if (response.error) {
    throw new Error(response.error);
  }
  if (response.data === undefined) {
    throw new Error('Không nhận được dữ liệu từ máy chủ.');
  }
  return response.data;
}

export const trekkerBlogService = {

  async getBlogs(params: TrekkerBlogListParams = {}): Promise<TrekkerBlogListResponse> {
    const query: Record<string, string> = {};
    if (params.authorId) query.authorId = params.authorId;
    if (params.keyword?.trim()) query.keyword = params.keyword.trim();
    query.page = String((params.page ?? 1) - 1); // BE Spring Data 0-indexed
    query.size = String(params.size ?? 10);
    if (params.sortBy) query.sortBy = params.sortBy;
    if (params.sortDir) query.sortDir = params.sortDir;

    const response = await ApiService<PaginationResponseDto<TrekkerBlogItem>>(
      '/blogs',
      'GET',
      undefined,
      query
    );
    const data = unwrapResponse(response);

    return {
      items: data.content,
      meta: {
        pageNumber: data.pageNumber + 1,
        pageSize: data.pageSize,
        totalElements: data.totalElements,
        totalPages: data.totalPages,
      },
    };
  },

  async getBlogDetail(blogId: string): Promise<TrekkerBlogDetail> {
    const response = await ApiService<TrekkerBlogDetail>(`/blogs/${blogId}`, 'GET');
    return unwrapResponse(response);
  },

  async createBlog(payload: CreateBlogPayload): Promise<TrekkerBlogDetail> {
    const response = await ApiUpload<TrekkerBlogDetail>(
      '/blogs',
      buildBlogFormData(payload),
      'POST'
    );
    return unwrapResponse(response);
  },

  async updateBlog(blogId: string, payload: UpdateBlogPayload): Promise<TrekkerBlogDetail> {
    const response = await ApiUpload<TrekkerBlogDetail>(
      `/blogs/${blogId}`,
      buildBlogFormData(payload),
      'PUT'
    );
    return unwrapResponse(response);
  },

  async toggleBlogVisibility(blogId: string): Promise<void> {
    const response = await ApiService<void>(`/blogs/${blogId}/hide`, 'PUT');
    if (response.error) {
      throw new Error(response.error);
    }
  },

  async deleteBlog(blogId: string): Promise<void> {
    const response = await ApiService<void>(`/blogs/${blogId}`, 'DELETE');
    if (response.error) {
      throw new Error(response.error);
    }
  },
};
