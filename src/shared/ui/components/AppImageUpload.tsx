import { ExternalLink, ImagePlus, Loader2, X } from 'lucide-react';
import { type ReactNode, useCallback, useRef, useState } from 'react';
// `profileService` là transport upload file dùng chung (/files/upload) của toàn hệ thống,
// không phải API riêng của hồ sơ — mọi feature dùng lại thay vì gọi axios trực tiếp.
import { profileService } from '@/features/profile/services/profileService';
import { toast } from '@/store/useToastStore';
import { getSafeImageUrl } from '@/utils/sanitize';

/**
 * Cơ chế upload ảnh dùng chung cho toàn app (chuẩn hoá theo modal "Thêm điểm dừng"):
 *
 * 1. Chọn ảnh từ máy → upload NGAY lên storage, form chỉ giữ URL string.
 * 2. Hoặc dán thẳng URL ảnh có sẵn vào ô bên dưới.
 * 3. Ảnh vừa upload nhưng người dùng gỡ đi / hủy form → gọi API xóa để không rác storage.
 *    Lưu thành công → `commit()` để đánh dấu ảnh đã thuộc về bản ghi, không xóa nữa.
 *
 * Luồng (3) là lý do mọi màn dùng component này đều phải cầm 1 `ImageUploadCleanup`
 * (qua `useImageUploadCleanup`) và gọi `discard()` ở nút Hủy / lúc unmount.
 */

const DEFAULT_MAX_SIZE_MB = 5;

export interface ImageUploadCleanup {
  /** Các URL vừa upload trong phiên này mà chưa được lưu vào bản ghi nào. */
  pendingUrls: React.MutableRefObject<string[]>;
  /** Đánh dấu 1 URL là vừa upload (component tự gọi). */
  track: (url: string) => void;
  /** Bỏ theo dõi + xóa khỏi storage nếu URL đó là ảnh vừa upload. */
  release: (url: string) => void;
  /** Người dùng hủy form → xóa toàn bộ ảnh đã lỡ upload. */
  discard: () => void;
  /** Lưu thành công → ảnh đã thuộc về bản ghi, không xóa nữa. */
  commit: () => void;
}

/** Quản lý vòng đời "ảnh đã upload nhưng form chưa lưu" cho 1 màn hình/modal. */
export function useImageUploadCleanup(): ImageUploadCleanup {
  const pendingUrls = useRef<string[]>([]);

  const track = useCallback((url: string) => {
    if (url && !pendingUrls.current.includes(url)) pendingUrls.current.push(url);
  }, []);

  const release = useCallback((url: string) => {
    if (!url || !pendingUrls.current.includes(url)) return;
    pendingUrls.current = pendingUrls.current.filter((item) => item !== url);
    profileService.deleteFile(url).catch(() => {});
  }, []);

  const discard = useCallback(() => {
    for (const url of pendingUrls.current) profileService.deleteFile(url).catch(() => {});
    pendingUrls.current = [];
  }, []);

  const commit = useCallback(() => {
    pendingUrls.current = [];
  }, []);

  return { pendingUrls, track, release, discard, commit };
}

interface UploadOptions {
  folder: string;
  maxSizeMb: number;
  cleanup: ImageUploadCleanup;
}

async function uploadOne(file: File, { folder, maxSizeMb, cleanup }: UploadOptions) {
  if (!file.type.startsWith('image/')) {
    toast.error(`"${file.name}" không phải là file ảnh.`);
    return null;
  }
  if (file.size > maxSizeMb * 1024 * 1024) {
    toast.error(`Kích thước ảnh tối đa là ${maxSizeMb}MB.`);
    return null;
  }

  const res = await profileService.uploadFile(file, folder);
  if (!res.data) {
    toast.error(res.error || 'Không thể tải ảnh lên. Vui lòng thử lại!');
    return null;
  }
  cleanup.track(res.data);
  return res.data;
}

/* -------------------------------------------------------------------------- */
/*  1 ảnh                                                                      */
/* -------------------------------------------------------------------------- */

export interface AppImageUploadFieldProps {
  /** URL ảnh hiện tại ('' hoặc null = chưa có ảnh). */
  value?: string | null;
  onChange: (url: string) => void;
  /** Thư mục lưu trên storage, ví dụ 'checkpoints' | 'tours' | 'refund-receipts'. */
  folder: string;
  cleanup: ImageUploadCleanup;
  label?: ReactNode;
  /** Gợi ý hiển thị dưới ô nhập URL. */
  hint?: ReactNode;
  urlPlaceholder?: string;
  maxSizeMb?: number;
  disabled?: boolean;
  errorMessage?: string;
  /** Hiện nút mở ảnh gốc ở tab mới (dùng cho ảnh hóa đơn / biên nhận). */
  showOpenLink?: boolean;
  /** Class của khung ảnh xem trước. */
  previewClassName?: string;
  className?: string;
  /** Báo cho form cha biết đang upload để khóa nút Lưu. */
  onUploadingChange?: (isUploading: boolean) => void;
  /**
   * Trả về File thô vừa upload (null khi ảnh bị gỡ / khi người dùng dán URL).
   * Chỉ cần cho vài API còn nhận ảnh dạng multipart song song với URL.
   */
  onFileSelected?: (file: File | null) => void;
}

export function AppImageUploadField({
  value,
  onChange,
  folder,
  cleanup,
  label,
  hint,
  urlPlaceholder = 'https://images.unsplash.com/...',
  maxSizeMb = DEFAULT_MAX_SIZE_MB,
  disabled = false,
  errorMessage,
  showOpenLink = false,
  previewClassName = 'h-36 w-full object-cover',
  className,
  onUploadingChange,
  onFileSelected,
}: AppImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const setUploading = (next: boolean) => {
    setIsUploading(next);
    onUploadingChange?.(next);
  };

  const resetFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploadedUrl = await uploadOne(file, { folder, maxSizeMb, cleanup });
      if (uploadedUrl) {
        // Ảnh cũ trong ô này nếu cũng vừa upload ở phiên này thì đã bị thay thế → dọn luôn.
        if (value && value !== uploadedUrl) cleanup.release(value);
        onChange(uploadedUrl);
        onFileSelected?.(file);
        toast.success('Đã tải ảnh lên thành công!');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải ảnh lên.');
    } finally {
      setUploading(false);
      resetFileInput();
    }
  };

  const handleRemove = () => {
    if (value) cleanup.release(value);
    onChange('');
    onFileSelected?.(null);
    resetFileInput();
  };

  const safePreview = getSafeImageUrl(value);

  return (
    <div className={className ?? 'space-y-1.5'}>
      {label && <span className="block text-xs font-bold text-foreground">{label}</span>}

      {/* Ảnh xem trước — chỉ hiện khi URL hợp lệ, nên gõ URL dở dang không làm nhảy layout. */}
      {safePreview && (
        <div className="relative overflow-hidden rounded-xl border border-border bg-muted/30">
          <img src={safePreview} alt="Ảnh đã chọn" className={previewClassName} />
          <div className="absolute right-2 top-2 flex items-center gap-1.5">
            {showOpenLink && (
              <a
                href={safePreview}
                target="_blank"
                rel="noreferrer"
                title="Mở ảnh gốc"
                className="rounded-lg bg-black/60 p-1 text-white backdrop-blur-xs transition hover:bg-black/80"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled}
              title="Gỡ ảnh"
              className="cursor-pointer rounded-lg bg-black/60 p-1 text-white backdrop-blur-xs transition hover:bg-black/80 disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          disabled={disabled || isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-dashed border-border bg-muted/40 px-3 py-2 text-xs font-semibold text-foreground transition hover:border-primary hover:bg-primary/5 disabled:opacity-50"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              <span>Đang tải ảnh lên...</span>
            </>
          ) : (
            <>
              <ImagePlus className="h-3.5 w-3.5 text-primary" />
              <span>{value ? 'Đổi ảnh khác' : 'Tải ảnh từ máy'}</span>
            </>
          )}
        </button>
        <span className="text-[11px] text-muted-foreground">hoặc dán đường dẫn URL:</span>
      </div>

      <input
        type="text"
        value={value ?? ''}
        disabled={disabled}
        onChange={(event) => {
          // Tự gõ/dán URL khác → ảnh vừa upload trong phiên này thành rác, dọn luôn.
          if (value) cleanup.release(value);
          onChange(event.target.value);
          onFileSelected?.(null);
        }}
        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
        placeholder={urlPlaceholder}
      />

      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
      {errorMessage && <p className="text-[10px] text-red-500">{errorMessage}</p>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Nhiều ảnh                                                                  */
/* -------------------------------------------------------------------------- */

export interface AppImageUploadGalleryProps {
  /** Danh sách URL ảnh hiện tại. */
  value: string[];
  onChange: (urls: string[]) => void;
  folder: string;
  cleanup: ImageUploadCleanup;
  label?: ReactNode;
  hint?: ReactNode;
  urlPlaceholder?: string;
  maxSizeMb?: number;
  /** Số ảnh tối đa (bỏ trống = không giới hạn). */
  maxImages?: number;
  disabled?: boolean;
  errorMessage?: string;
  /** Gắn nhãn "Ảnh bìa" cho ảnh đầu tiên. */
  showCoverBadge?: boolean;
  /** Class của lưới ảnh xem trước. */
  gridClassName?: string;
  className?: string;
  /** Báo cho form cha biết đang upload để khóa nút Lưu. */
  onUploadingChange?: (isUploading: boolean) => void;
}

export function AppImageUploadGallery({
  value,
  onChange,
  folder,
  cleanup,
  label,
  hint,
  urlPlaceholder = 'https://images.unsplash.com/...',
  maxSizeMb = DEFAULT_MAX_SIZE_MB,
  maxImages,
  disabled = false,
  errorMessage,
  showCoverBadge = false,
  gridClassName = 'grid grid-cols-2 gap-2.5 sm:grid-cols-3',
  className,
  onUploadingChange,
}: AppImageUploadGalleryProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [urlDraft, setUrlDraft] = useState('');

  const setUploading = (next: boolean) => {
    setIsUploading(next);
    onUploadingChange?.(next);
  };

  const remainingSlots =
    maxImages === undefined ? Number.POSITIVE_INFINITY : maxImages - value.length;
  const isFull = remainingSlots <= 0;

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    if (files.length > remainingSlots) {
      toast.error(`Chỉ được tải lên tối đa ${maxImages} ảnh.`);
      if (event.target) event.target.value = '';
      return;
    }

    setUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const uploadedUrl = await uploadOne(file, { folder, maxSizeMb, cleanup });
        if (uploadedUrl) uploadedUrls.push(uploadedUrl);
      }
      if (uploadedUrls.length > 0) {
        onChange([...value, ...uploadedUrls]);
        toast.success(`Đã tải lên ${uploadedUrls.length} ảnh thành công!`);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải ảnh lên.');
    } finally {
      setUploading(false);
      if (event.target) event.target.value = '';
    }
  };

  const handleAddUrl = () => {
    const url = urlDraft.trim();
    if (!url) return;
    if (isFull) {
      toast.error(`Chỉ được thêm tối đa ${maxImages} ảnh.`);
      return;
    }
    if (value.includes(url)) {
      toast.error('Ảnh này đã có trong danh sách.');
      return;
    }
    if (!getSafeImageUrl(url)) {
      toast.error('Đường dẫn ảnh không hợp lệ.');
      return;
    }
    onChange([...value, url]);
    setUrlDraft('');
  };

  const handleRemove = (index: number) => {
    const url = value[index];
    if (url) cleanup.release(url);
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className={className ?? 'space-y-2'}>
      {label && <span className="block text-xs font-bold text-foreground">{label}</span>}

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="file"
          accept="image/*"
          multiple
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          disabled={disabled || isUploading || isFull}
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-dashed border-border bg-muted/40 px-3 py-2 text-xs font-semibold text-foreground transition hover:border-primary hover:bg-primary/5 disabled:opacity-50"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              <span>Đang tải ảnh lên...</span>
            </>
          ) : (
            <>
              <ImagePlus className="h-3.5 w-3.5 text-primary" />
              <span>Tải ảnh từ máy</span>
            </>
          )}
        </button>
        <span className="text-[11px] text-muted-foreground">hoặc dán đường dẫn URL:</span>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={urlDraft}
          disabled={disabled || isFull}
          onChange={(event) => setUrlDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              handleAddUrl();
            }
          }}
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
          placeholder={urlPlaceholder}
        />
        <button
          type="button"
          onClick={handleAddUrl}
          disabled={disabled || isFull || !urlDraft.trim()}
          className="shrink-0 cursor-pointer rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-muted disabled:opacity-50"
        >
          Thêm
        </button>
      </div>

      {value.length > 0 && (
        <div className={gridClassName}>
          {value.map((url, index) => (
            <div
              key={url}
              className="relative aspect-video overflow-hidden rounded-xl border border-border bg-muted/30"
            >
              <img
                src={getSafeImageUrl(url) || ''}
                alt={`Ảnh đã chọn ${index + 1}`}
                className="h-full w-full object-cover"
              />
              {showCoverBadge && (
                <span className="absolute bottom-1.5 left-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-white backdrop-blur-xs">
                  {index === 0 ? 'Ảnh bìa' : `#${index + 1}`}
                </span>
              )}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                disabled={disabled}
                title="Gỡ ảnh"
                aria-label={`Gỡ ảnh ${index + 1}`}
                className="absolute right-1.5 top-1.5 cursor-pointer rounded-lg bg-black/70 p-1 text-white backdrop-blur-xs transition hover:bg-rose-600 disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
      {errorMessage && <p className="text-[10px] text-red-500">{errorMessage}</p>}
    </div>
  );
}
