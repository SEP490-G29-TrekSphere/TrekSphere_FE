import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { blogService } from '../services/blogService';
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

export const blogKeys = {
  all: ['blogs'] as const,
  lists: () => [...blogKeys.all, 'list'] as const,
  list: (params: BlogListParams) => [...blogKeys.lists(), params] as const,
  infiniteList: (params: Omit<BlogListParams, 'page'>) =>
    [...blogKeys.lists(), 'infinite', params] as const,
  details: () => [...blogKeys.all, 'detail'] as const,
  detail: (blogId: string) => [...blogKeys.details(), blogId] as const,
  comments: (blogId: string) => [...blogKeys.detail(blogId), 'comments'] as const,
};

export function useBlogList(params: BlogListParams) {
  return useQuery<{ items: BlogListItem[]; meta: BlogListMeta }>({
    queryKey: blogKeys.list(params),
    queryFn: () => blogService.getPosts(params),
    staleTime: 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
}

export function useInfiniteBlogList(params: Omit<BlogListParams, 'page'>) {
  return useInfiniteQuery({
    queryKey: blogKeys.infiniteList(params),
    queryFn: ({ pageParam }) => blogService.getPosts({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.pageNumber < lastPage.meta.totalPages
        ? lastPage.meta.pageNumber + 1
        : undefined,
    staleTime: 60 * 1000,
  });
}

export function useBlogDetail(blogId: string | undefined) {
  return useQuery<BlogPostDetail | null>({
    queryKey: blogKeys.detail(blogId ?? ''),
    queryFn: () => blogService.getPostById(blogId as string),
    enabled: Boolean(blogId),
    staleTime: 60 * 1000,
  });
}

export function useBlogRelated(currentBlogId: string | undefined) {
  return useQuery<BlogListItem[]>({
    queryKey: [...blogKeys.all, 'related', currentBlogId ?? ''] as const,
    queryFn: async () => {
      const { items } = await blogService.getPosts({
        page: 1,
        size: 6,
        sortBy: 'blogId',
        sortDir: 'desc',
      });
      return items.filter((p) => p.blogId !== currentBlogId).slice(0, 4);
    },
    enabled: Boolean(currentBlogId),
    staleTime: 60 * 1000,
  });
}

export function useBlogComments(blogId: string | undefined) {
  return useQuery<{ items: BlogCommentItem[]; meta: BlogCommentListMeta }>({
    queryKey: blogKeys.comments(blogId ?? ''),
    queryFn: () => blogService.getCommentsById(blogId as string, { topLevelOnly: true, size: 50 }),
    enabled: Boolean(blogId),
    staleTime: 30 * 1000,
  });
}

export function useCreateBlogComment(blogId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBlogCommentPayload) => {
      if (!blogId) {
        return Promise.reject(new Error('Thiếu blog blogId — không thể gửi bình luận.'));
      }
      return blogService.createComment(blogId, payload);
    },
    onSuccess: () => {
      if (blogId) {
        queryClient.invalidateQueries({ queryKey: blogKeys.comments(blogId) });
        queryClient.invalidateQueries({ queryKey: blogKeys.lists() });
      }
    },
  });
}

export function useUpdateBlogComment(blogId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      commentId,
      payload,
    }: {
      commentId: string;
      payload: UpdateBlogCommentPayload;
    }) => blogService.updateComment(commentId, payload),
    onSuccess: () => {
      if (blogId) {
        queryClient.invalidateQueries({ queryKey: blogKeys.comments(blogId) });
      }
    },
  });
}

export function useDeleteBlogComment(blogId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => blogService.deleteComment(commentId),
    onSuccess: () => {
      if (blogId) {
        queryClient.invalidateQueries({ queryKey: blogKeys.comments(blogId) });
        queryClient.invalidateQueries({ queryKey: blogKeys.lists() });
      }
    },
  });
}
