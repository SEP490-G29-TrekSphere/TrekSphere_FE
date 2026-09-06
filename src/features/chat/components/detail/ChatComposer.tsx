import { zodResolver } from '@hookform/resolvers/zod';
import { ImagePlus, Loader2, Send, Smile, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { EmojiPicker, EmojiPickerContent, EmojiPickerSearch } from '@/components/ui/emoji-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { profileService } from '@/features/profile/services/profileService';
import { toast } from '@/store/useToastStore';

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGES_PER_MESSAGE = 5;
const MAX_TEXTAREA_HEIGHT_PX = 160;

const composerSchema = z.object({
  // Cho phép rỗng vì tin nhắn có thể chỉ gồm ảnh; nút gửi tự khoá khi không có gì để gửi.
  message: z.string(),
});

type ComposerFormValues = z.infer<typeof composerSchema>;

interface PendingImage {
  id: string;
  file: File;
  previewUrl: string;
}

interface ChatComposerProps {
  /** Gửi một tin nhắn. Ảnh được gửi thành từng tin nhắn riêng chứa URL ảnh. */
  onSendMessage: (content: string) => void;
  isSending: boolean;
  placeholder?: string;
}

export function ChatComposer({ onSendMessage, isSending, placeholder }: ChatComposerProps) {
  const { register, handleSubmit, setValue, getValues, watch, reset } = useForm<ComposerFormValues>(
    {
      resolver: zodResolver(composerSchema),
      defaultValues: { message: '' },
    }
  );

  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { ref: registerTextareaRef, ...messageField } = register('message');

  const message = watch('message');
  const hasContent = message.trim().length > 0 || pendingImages.length > 0;
  const isBusy = isSending || isUploading;

  // Giải phóng object URL của các ảnh còn treo khi component unmount.
  const pendingImagesRef = useRef(pendingImages);
  useEffect(() => {
    pendingImagesRef.current = pendingImages;
  }, [pendingImages]);
  useEffect(() => {
    return () => {
      for (const image of pendingImagesRef.current) URL.revokeObjectURL(image.previewUrl);
    };
  }, []);

  const autoGrow = useCallback(() => {
    const element = textareaRef.current;
    if (!element) return;
    element.style.height = 'auto';
    element.style.height = `${Math.min(element.scrollHeight, MAX_TEXTAREA_HEIGHT_PX)}px`;
  }, []);

  const handleSelectFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (files.length === 0) return;

    const remainingSlots = MAX_IMAGES_PER_MESSAGE - pendingImages.length;
    if (remainingSlots <= 0) {
      toast.error(`Mỗi lần chỉ gửi tối đa ${MAX_IMAGES_PER_MESSAGE} ảnh`);
      return;
    }

    const accepted: PendingImage[] = [];
    for (const file of files.slice(0, remainingSlots)) {
      if (!file.type.startsWith('image/')) {
        toast.error(`"${file.name}" không phải là ảnh`);
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        toast.error(`"${file.name}" vượt quá 5MB`);
        continue;
      }
      accepted.push({
        id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    if (files.length > remainingSlots) {
      toast.error(`Mỗi lần chỉ gửi tối đa ${MAX_IMAGES_PER_MESSAGE} ảnh`);
    }
    if (accepted.length > 0) setPendingImages((prev) => [...prev, ...accepted]);
  };

  const removePendingImage = (id: string) => {
    setPendingImages((prev) => {
      const target = prev.find((image) => image.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((image) => image.id !== id);
    });
  };

  // Vị trí con trỏ mong muốn sau khi chèn emoji, áp dụng lại khi picker đóng.
  const caretAfterInsertRef = useRef<number | null>(null);

  const focusTextareaAtCaret = useCallback(() => {
    const element = textareaRef.current;
    if (!element) return;

    element.focus();
    const caret = caretAfterInsertRef.current;
    if (caret !== null) {
      element.setSelectionRange(caret, caret);
      caretAfterInsertRef.current = null;
    }
    autoGrow();
  }, [autoGrow]);

  const insertEmoji = (emoji: string) => {
    const element = textareaRef.current;
    const current = getValues('message') ?? '';

    if (!element) {
      setValue('message', current + emoji);
      return;
    }

    const start = element.selectionStart ?? current.length;
    const end = element.selectionEnd ?? current.length;
    setValue('message', `${current.slice(0, start)}${emoji}${current.slice(end)}`);
    caretAfterInsertRef.current = start + emoji.length;

    // Base UI vẫn giữ focus bên trong popover một nhịp sau khi nó đóng về mặt
    // hình ảnh, nên đặt lại focus vài lần để con trỏ chắc chắn quay về ô soạn tin.
    for (const delay of [0, 120, 320]) setTimeout(focusTextareaAtCaret, delay);
  };

  const onSubmit = async (data: ComposerFormValues) => {
    const text = data.message.trim();
    if (!text && pendingImages.length === 0) return;

    const imagesToSend = pendingImages;
    setPendingImages([]);
    reset({ message: '' });
    requestAnimationFrame(autoGrow);

    if (imagesToSend.length > 0) {
      setIsUploading(true);
      try {
        for (const image of imagesToSend) {
          const result = await profileService.uploadFile(image.file, 'chat');
          if (result.error || !result.data) {
            toast.error(result.error || `Không thể tải ảnh "${image.file.name}" lên`);
            continue;
          }
          onSendMessage(result.data);
        }
      } finally {
        setIsUploading(false);
        for (const image of imagesToSend) URL.revokeObjectURL(image.previewUrl);
      }
    }

    if (text) onSendMessage(text);
  };

  return (
    <div className="border-t border-border bg-background px-4 py-3 sm:px-6 sm:py-4">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="rounded-2xl border border-border bg-muted/20 transition-colors focus-within:border-primary/40 focus-within:bg-background">
          {pendingImages.length > 0 && (
            <div className="flex flex-wrap gap-2 border-b border-border/70 p-3">
              {pendingImages.map((image) => (
                <div key={image.id} className="group relative">
                  <img
                    src={image.previewUrl}
                    alt={image.file.name}
                    className="h-16 w-16 rounded-lg object-cover ring-1 ring-border"
                  />
                  <button
                    type="button"
                    onClick={() => removePendingImage(image.id)}
                    aria-label={`Bỏ ảnh ${image.file.name}`}
                    className="absolute -top-1.5 -right-1.5 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-foreground text-background shadow-sm transition-transform hover:scale-110"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end gap-1.5 p-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={handleSelectFiles}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Gửi ảnh"
              disabled={isBusy}
              onClick={() => fileInputRef.current?.click()}
              className="shrink-0 rounded-full text-muted-foreground hover:text-foreground"
            >
              <ImagePlus className="h-5 w-5" />
            </Button>

            <textarea
              rows={1}
              placeholder={placeholder ?? 'Nhập tin nhắn của bạn...'}
              disabled={isBusy}
              {...messageField}
              ref={(element) => {
                registerTextareaRef(element);
                textareaRef.current = element;
              }}
              onInput={autoGrow}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  if (!isBusy && hasContent) handleSubmit(onSubmit)();
                }
              }}
              // Placeholder chứa tên hội thoại nên có thể rất dài — ép một dòng
              // kèm ellipsis để không đội cao ô soạn tin trên màn hình hẹp.
              className="max-h-40 flex-1 resize-none bg-transparent py-2 text-sm leading-relaxed outline-none placeholder:overflow-hidden placeholder:text-ellipsis placeholder:whitespace-nowrap placeholder:text-muted-foreground disabled:opacity-50"
            />

            <Popover
              open={isEmojiOpen}
              onOpenChange={setIsEmojiOpen}
              // Đợi picker đóng hẳn rồi mới trả con trỏ về ô soạn tin, nếu focus
              // ngay thì Base UI sẽ ghi đè bằng focus nội bộ của popover.
              onOpenChangeComplete={(open) => {
                // `caretAfterInsertRef` chỉ còn khác null khi lần focus ngay sau
                // lúc chọn emoji bị Base UI giành mất.
                if (!open && caretAfterInsertRef.current !== null) focusTextareaAtCaret();
              }}
            >
              <PopoverTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Chèn emoji"
                    disabled={isBusy}
                    className="shrink-0 rounded-full text-muted-foreground hover:text-foreground"
                  />
                }
              >
                <Smile className="h-5 w-5" />
              </PopoverTrigger>
              <PopoverContent align="end" side="top" className="w-[19.5rem] p-0">
                <EmojiPicker
                  onEmojiSelect={({ emoji }) => {
                    setIsEmojiOpen(false);
                    insertEmoji(emoji);
                  }}
                >
                  <EmojiPickerSearch />
                  <EmojiPickerContent />
                </EmojiPicker>
              </PopoverContent>
            </Popover>

            <Button
              type="submit"
              size="icon"
              aria-label="Gửi tin nhắn"
              disabled={isBusy || !hasContent}
              className="shrink-0 rounded-full transition-transform hover:scale-105 active:scale-95"
            >
              {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </form>

      <p className="mt-1.5 px-1 text-[11px] text-muted-foreground">
        Nhấn <kbd className="rounded bg-muted px-1 font-sans">Enter</kbd> để gửi,{' '}
        <kbd className="rounded bg-muted px-1 font-sans">Shift + Enter</kbd> để xuống dòng
      </p>
    </div>
  );
}
