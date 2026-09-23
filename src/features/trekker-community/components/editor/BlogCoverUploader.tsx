import { ImageIcon, X } from 'lucide-react';
import type { ChangeEvent } from 'react';

interface BlogCoverUploaderProps {
  safeCoverPreview?: string | null;
  canRemoveCover: boolean;
  onUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}

export function BlogCoverUploader({
  safeCoverPreview,
  canRemoveCover,
  onUpload,
  onRemove,
}: BlogCoverUploaderProps) {
  return (
    <div className="relative mb-6">
      <button
        type="button"
        className={`flex h-52 w-full cursor-pointer flex-col items-center justify-center rounded-3xl transition-colors hover:bg-muted/60 sm:h-64 ${
          safeCoverPreview
            ? 'border-0 bg-transparent'
            : 'border-2 border-dashed border-border bg-muted/30'
        }`}
        onClick={() => document.getElementById('cover-image-input')?.click()}
      >
        {safeCoverPreview ? (
          <>
            <img
              src={safeCoverPreview}
              alt="Cover"
              className="h-full w-full rounded-3xl object-cover"
            />
            {canRemoveCover && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                aria-label="Gỡ ảnh bìa"
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </>
        ) : (
          <>
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Nhấn để tải ảnh bìa lên
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Kéo thả hoặc chọn file (tối đa 5MB)
            </p>
          </>
        )}
      </button>
      <input
        id="cover-image-input"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onUpload}
      />
    </div>
  );
}
