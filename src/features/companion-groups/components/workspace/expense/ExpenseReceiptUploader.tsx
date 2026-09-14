import { ExternalLink, Image as ImageIcon, ImagePlus, Loader2, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { profileService } from '@/features/profile/services/profileService';
import { toast } from '@/store/useToastStore';

interface ExpenseReceiptUploaderProps {
  value?: string | null;
  onChange: (url: string) => void;
  newlyUploadedUrlRef: React.MutableRefObject<string | null>;
  errorMessage?: string;
  disabled?: boolean;
}

export function ExpenseReceiptUploader({
  value,
  onChange,
  newlyUploadedUrlRef,
  errorMessage,
  disabled = false,
}: ExpenseReceiptUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh tối đa là 5MB.');
      return;
    }

    setIsUploading(true);
    try {
      const res = await profileService.uploadFile(file, 'expense-receipts');
      if (res.data) {
        // Nếu trước đó đã upload 1 ảnh mới khác trong phiên này chưa lưu, xóa ảnh cũ đó đi
        if (newlyUploadedUrlRef.current && newlyUploadedUrlRef.current !== res.data) {
          profileService.deleteFile(newlyUploadedUrlRef.current).catch(() => {});
        }
        newlyUploadedUrlRef.current = res.data;
        onChange(res.data);
        toast.success('Đã tải ảnh hóa đơn lên thành công!');
      } else {
        toast.error(res.error || 'Không thể tải ảnh lên. Vui lòng thử lại!');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải ảnh lên.';
      toast.error(msg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    // Nếu ảnh vừa bị xóa là ảnh mới upload trong phiên này -> dọn rác Cloudinary
    if (newlyUploadedUrlRef.current) {
      profileService.deleteFile(newlyUploadedUrlRef.current).catch(() => {});
      newlyUploadedUrlRef.current = null;
    }
    onChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
        <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" /> Link ảnh hóa đơn (URL)
      </label>

      {value ? (
        <div className="relative overflow-hidden rounded-xl border border-border bg-muted/30">
          <img
            src={value}
            alt="Hóa đơn chi tiêu"
            className="max-h-48 w-full object-contain bg-background/50"
          />
          <div className="absolute right-2 top-2 flex items-center gap-1.5">
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-black/60 p-1.5 text-white backdrop-blur-xs transition hover:bg-black/80 cursor-pointer"
              title="Mở xem ảnh gốc"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
            <button
              type="button"
              onClick={handleRemoveImage}
              disabled={disabled}
              className="rounded-lg bg-black/60 p-1.5 text-white backdrop-blur-xs transition hover:bg-black/80 cursor-pointer disabled:opacity-50"
              title="Gỡ ảnh"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              disabled={disabled || isUploading}
            />
            <button
              type="button"
              disabled={disabled || isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-border bg-muted/40 px-3 py-2 text-xs font-semibold text-foreground transition hover:border-primary hover:bg-primary/5 disabled:opacity-50 cursor-pointer"
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

          <input
            type="url"
            value={value || ''}
            disabled={disabled}
            onChange={(e) => {
              if (newlyUploadedUrlRef.current && newlyUploadedUrlRef.current !== e.target.value) {
                profileService.deleteFile(newlyUploadedUrlRef.current).catch(() => {});
                newlyUploadedUrlRef.current = null;
              }
              onChange(e.target.value);
            }}
            placeholder="https://... (nếu có)"
            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      )}

      {errorMessage && <p className="text-[11px] text-destructive font-medium">{errorMessage}</p>}
    </div>
  );
}
