import { FileText, Image as ImageIcon } from 'lucide-react';
import { AppImageUploadField, type ImageUploadCleanup } from '@/shared/ui';

interface ExpenseReceiptUploadProps {
  receiptUrl?: string | null;
  onReceiptChange: (url: string) => void;
  cleanup: ImageUploadCleanup;
  onUploadingChange?: (isUploading: boolean) => void;
}

export function ExpenseReceiptUpload({
  receiptUrl,
  onReceiptChange,
  cleanup,
  onUploadingChange,
}: ExpenseReceiptUploadProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
        <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
        Ảnh hóa đơn / Biên lai chi tiền (Tùy chọn)
      </label>
      <div className="rounded-xl border border-border bg-muted/20 p-3">
        <AppImageUploadField
          value={receiptUrl || ''}
          onChange={onReceiptChange}
          folder="group-expenses"
          cleanup={cleanup}
          onUploadingChange={onUploadingChange}
          maxSizeMb={5}
          showOpenLink
          previewClassName="max-h-36 w-full rounded-lg object-contain bg-background"
        />
        {!receiptUrl && (
          <p className="mt-1 text-[11px] text-muted-foreground flex items-center gap-1">
            <FileText className="h-3 w-3" />
            Tải ảnh hóa đơn giúp việc quyết toán và đối chiếu công khai, minh bạch hơn.
          </p>
        )}
      </div>
    </div>
  );
}
