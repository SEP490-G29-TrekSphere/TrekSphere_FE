import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import ReactQuill from 'react-quill-new';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getPrimaryRole, PATHS, ROLES } from '@/constants';
import { AppSpinner } from '@/shared/ui';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import { getSafeImageUrl, stripHtml } from '@/utils/sanitize';
import 'react-quill-new/dist/quill.snow.css';
import { BlogPreviewModal } from '../components/BlogPreviewModal';
import { BlogCoverUploader, BlogSidebarInfo } from '../components/editor';
import { MyBlogPagination } from '../components/MyBlogPagination';
import { MyBlogTable } from '../components/MyBlogTable';
import { VENDOR_POSTS_PAGE_SIZE } from '../constants';
import { useTrekkerBlogDetail, useTrekkerBlogList } from '../hooks/useTrekkerBlog';
import { useTrekkerBlogMutations } from '../hooks/useTrekkerBlogMutations';
import { computeReadStats } from '../utils/readingTime';
import { type BlogFormValues, blogFormSchema } from '../validations';

export function CreateBlogPost({ editMode = false }: { editMode?: boolean }) {
  const navigate = useNavigate();
  const params = useParams();
  const blogId = params.blogId;

  const user = useAppStore((state) => state.user);
  const isVendor = getPrimaryRole(user?.roles) === ROLES.VENDOR;

  const { data: existingBlog, isLoading: isLoadingBlog } = useTrekkerBlogDetail(
    editMode ? blogId : undefined
  );
  const { createBlog, updateBlog } = useTrekkerBlogMutations();

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [vendorPostsPage, setVendorPostsPage] = useState(1);

  // Vendor has no dedicated "My Blogs" page; display recent posts below the editor
  const showVendorPostList = isVendor && !editMode;
  const vendorPosts = useTrekkerBlogList(
    {
      authorId: user?.id,
      page: vendorPostsPage,
      size: VENDOR_POSTS_PAGE_SIZE,
      sortBy: 'createdAt',
      sortDir: 'desc',
    },
    { enabled: showVendorPostList }
  );

  const {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm<BlogFormValues>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: { title: '', content: '' },
  });

  const title = watch('title');
  const content = watch('content');

  useEffect(() => {
    if (!existingBlog) return;
    reset({ title: existingBlog.title, content: existingBlog.content });
    setCoverPreview(existingBlog.coverImageUrl ?? null);
  }, [existingBlog, reset]);

  useEffect(() => {
    return () => {
      if (coverPreview?.startsWith('blob:')) URL.revokeObjectURL(coverPreview);
    };
  }, [coverPreview]);

  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ảnh tối đa 5MB.');
      return;
    }
    if (coverPreview?.startsWith('blob:')) URL.revokeObjectURL(coverPreview);
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleRemoveCover = () => {
    if (coverPreview?.startsWith('blob:')) URL.revokeObjectURL(coverPreview);
    setCoverFile(null);
    setCoverPreview(editMode ? (existingBlog?.coverImageUrl ?? null) : null);
  };

  const isSubmitting = createBlog.isPending || updateBlog.isPending;

  const onSubmit = (values: BlogFormValues) => {
    if (editMode && blogId) {
      updateBlog.mutate(
        {
          blogId,
          payload: {
            title: values.title,
            content: values.content,
            ...(coverFile ? { coverImage: coverFile } : {}),
          },
        },
        {
          onSuccess: () => {
            toast.success('Đã lưu thay đổi.');
            navigate(PATHS.TREKKER_BLOG_LIST);
          },
          onError: (err: unknown) =>
            toast.error(err instanceof Error ? err.message : 'Không thể lưu thay đổi.'),
        }
      );
      return;
    }

    createBlog.mutate(
      {
        title: values.title,
        content: values.content,
        ...(coverFile ? { coverImage: coverFile } : {}),
      },
      {
        onSuccess: () => {
          toast.success('Bài viết đã được đăng thành công!');
          if (isVendor) {
            reset({ title: '', content: '' });
            handleRemoveCover();
            setVendorPostsPage(1);
          } else {
            navigate(PATHS.TREKKER_BLOG_LIST);
          }
        },
        onError: (err: unknown) =>
          toast.error(err instanceof Error ? err.message : 'Đăng bài thất bại.'),
      }
    );
  };

  const handleBack = () => navigate(isVendor ? PATHS.VENDOR : PATHS.TREKKER_BLOG_LIST);

  if (editMode && isLoadingBlog) {
    return (
      <div className="flex h-64 items-center justify-center bg-background">
        <AppSpinner size="lg" className="text-primary" />
      </div>
    );
  }

  const plainTextContent = stripHtml(content ?? '');
  const readStats = computeReadStats(plainTextContent);
  const safeCoverPreview = getSafeImageUrl(coverPreview);
  const canRemoveCover = !editMode || coverFile !== null;

  return (
    <div className="min-h-screen bg-background">
      {/* Topbar Action */}
      <div className="sticky top-0 z-10 flex items-center justify-between pb-4 bg-background/80 backdrop-blur-xs">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Quay lại
        </button>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPreview(true)}
            className="rounded-full px-4 py-2 text-xs font-medium"
          >
            Xem trước
          </Button>

          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="rounded-full px-5 py-2 text-xs font-semibold shadow-xs"
          >
            {isSubmitting ? 'Đang xử lý...' : editMode ? 'Lưu thay đổi' : 'Đăng bài'}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="w-full pb-16">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground">
            {editMode ? 'Chỉnh sửa bài viết' : 'Soạn thảo bài viết mới'}
          </h2>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* Left Column: Editor Area (65%) */}
          <div className="w-full lg:w-[65%]">
            <BlogCoverUploader
              safeCoverPreview={safeCoverPreview}
              canRemoveCover={canRemoveCover}
              onUpload={handleCoverImageUpload}
              onRemove={handleRemoveCover}
            />

            {/* Title Input */}
            <div className="mb-1">
              <input
                type="text"
                placeholder="Nhập tiêu đề bài viết tại đây..."
                {...register('title')}
                className={`w-full rounded-full border px-6 py-4 text-lg font-semibold bg-card text-foreground outline-none transition-colors focus:border-primary ${
                  errors.title ? 'border-destructive' : 'border-border'
                }`}
              />
              {errors.title && (
                <p className="mt-1 px-2 text-xs font-medium text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Content Editor */}
            <div
              className={`mt-4 rounded-3xl border overflow-hidden bg-card [&_.quill]:flex [&_.quill]:flex-col [&_.quill]:h-[400px] lg:[&_.quill]:h-[500px] [&_.quill]:border-none [&_.ql-container]:flex-1 [&_.ql-container]:overflow-y-auto [&_.ql-container]:!border-none [&_.ql-container]:text-base [&_.ql-container]:font-inherit [&_.ql-toolbar]:!border-none [&_.ql-toolbar]:!border-b [&_.ql-toolbar]:!border-border [&_.ql-editor.ql-blank::before]:text-muted-foreground [&_.ql-editor.ql-blank::before]:not-italic ${
                errors.content ? 'border-destructive' : 'border-border'
              }`}
            >
              <Controller
                name="content"
                control={control}
                render={({ field }) => (
                  <ReactQuill
                    theme="snow"
                    value={field.value}
                    onChange={field.onChange}
                    modules={{
                      toolbar: [
                        [{ header: [1, 2, 3, false] }],
                        [{ font: [] }],
                        [{ size: [] }],
                        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                        [
                          { list: 'ordered' },
                          { list: 'bullet' },
                          { indent: '-1' },
                          { indent: '+1' },
                        ],
                        [{ align: [] }],
                        ['link', 'image', 'video'],
                        ['clean'],
                      ],
                    }}
                    placeholder="Bắt đầu chia sẻ hành trình của bạn..."
                  />
                )}
              />
            </div>
            {errors.content && (
              <p className="mt-1 px-2 text-xs font-medium text-destructive">
                {errors.content.message}
              </p>
            )}
          </div>

          {/* Right Column: Sidebar (35%) */}
          <BlogSidebarInfo
            wordCount={readStats.words}
            authorName={user?.name}
            authorAvatarUrl={user?.avatarUrl}
            editMode={editMode}
          />
        </div>

        {showVendorPostList && (
          <div className="mt-10">
            <h3 className="mb-4 text-lg font-bold text-foreground">
              Bài viết đã đăng
            </h3>

            {vendorPosts.isLoading ? (
              <div className="flex items-center justify-center rounded-2xl border border-border bg-card py-16">
                <AppSpinner size="default" className="text-primary" />
              </div>
            ) : (
              <>
                <MyBlogTable blogs={vendorPosts.data?.items ?? []} />
                {(vendorPosts.data?.meta.totalElements ?? 0) > 0 && (
                  <div className="overflow-hidden rounded-b-3xl border-t border-border bg-card">
                    <MyBlogPagination
                      currentPage={vendorPostsPage}
                      totalPages={Math.max(1, vendorPosts.data?.meta.totalPages ?? 1)}
                      onPageChange={setVendorPostsPage}
                      totalCount={vendorPosts.data?.meta.totalElements ?? 0}
                      pageSize={VENDOR_POSTS_PAGE_SIZE}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {showPreview && (
        <BlogPreviewModal
          title={title || 'Tiêu đề bài viết'}
          content={content || ''}
          coverPreview={safeCoverPreview ?? undefined}
          authorName={user?.name ?? 'Bạn'}
          authorAvatarUrl={user?.avatarUrl ?? undefined}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}

export default CreateBlogPost;
