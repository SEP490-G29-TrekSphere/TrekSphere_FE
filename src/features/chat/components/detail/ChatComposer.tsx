import { zodResolver } from '@hookform/resolvers/zod';
import { ImagePlus, Loader2, Send, Smile, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { EmojiPicker, EmojiPickerContent, EmojiPickerSearch } from '@/components/ui/emoji-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { DraftTourAttachment } from '@/features/chat/types/types';
import { profileService } from '@/features/profile/services/profileService';
import { toast } from '@/store/useToastStore';

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGES_PER_MESSAGE = 5;
const MAX_TEXTAREA_HEIGHT_PX = 160;

const composerSchema = z.object({
  // Allows empty message when only images are attached; send button is disabled when empty.
  message: z.string(),
});

type ComposerFormValues = z.infer<typeof composerSchema>;

interface PendingImage {
  id: string;
  file: File;
  previewUrl: string;
}

interface ChatComposerProps {
  /** Send message callback. Images are uploaded and sent as individual image URLs. */
  onSendMessage: (content: string) => void;
  isSending: boolean;
  placeholder?: string;
  initialDraftMessage?: string;
  draftTour?: DraftTourAttachment;
  onRemoveDraftTour?: () => void;
}

export function ChatComposer({
  onSendMessage,
  isSending,
  placeholder,
  initialDraftMessage,
  draftTour,
  onRemoveDraftTour,
}: ChatComposerProps) {
  const { register, handleSubmit, setValue, getValues, watch, reset } = useForm<ComposerFormValues>(
    {
      resolver: zodResolver(composerSchema),
      defaultValues: { message: initialDraftMessage || '' },
    }
  );

  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { ref: registerTextareaRef, ...messageField } = register('message');

  const message = watch('message');
  const hasContent = message.trim().length > 0 || pendingImages.length > 0 || Boolean(draftTour);
  const isBusy = isSending || isUploading;

  const autoGrow = useCallback(() => {
    const element = textareaRef.current;
    if (!element) return;
    element.style.height = 'auto';
    element.style.height = `${Math.min(element.scrollHeight, MAX_TEXTAREA_HEIGHT_PX)}px`;
  }, []);

  // Update draft message on prop change
  useEffect(() => {
    if (initialDraftMessage) {
      setValue('message', initialDraftMessage);
      requestAnimationFrame(autoGrow);
    }
  }, [initialDraftMessage, setValue, autoGrow]);

  // Revoke pending object URLs on unmount
  const pendingImagesRef = useRef(pendingImages);
  useEffect(() => {
    pendingImagesRef.current = pendingImages;
  }, [pendingImages]);
  useEffect(() => {
    return () => {
      for (const image of pendingImagesRef.current) URL.revokeObjectURL(image.previewUrl);
    };
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

  // Desired caret position after inserting emoji, applied when picker closes.
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

    // Retry focus after popup close animation
    for (const delay of [0, 120, 320]) setTimeout(focusTextareaAtCaret, delay);
  };

  const onSubmit = async (data: ComposerFormValues) => {
    let text = data.message.trim();
    if (!text && pendingImages.length === 0 && !draftTour) return;

    if (draftTour) {
      const tourLink = `${window.location.origin}/tours/${draftTour.tourId}`;
      if (!text.includes(draftTour.tourId)) {
        text = text
          ? `${text}\n${tourLink}`
          : `Tôi đang quan tâm đến tour "${draftTour.tourName}":\n${tourLink}`;
      }
      onRemoveDraftTour?.();
    }

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
        <div className="rounded-2xl border border-border bg-muted/20 transition-colors focus-within:border-primary/40 focus-within:bg-background overflow-hidden">
          {/* Draft Tour Preview Attachment Banner */}
          {draftTour && (
            <div className="flex items-center justify-between gap-3 border-b border-border bg-primary/5 p-3">
              <div className="flex items-center gap-3 min-w-0">
                {draftTour.coverImageUrl ? (
                  <img
                    src={draftTour.coverImageUrl}
                    alt={draftTour.tourName}
                    className="h-12 w-16 shrink-0 rounded-lg object-cover ring-1 ring-border"
                  />
                ) : (
                  <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
                    Tour
                  </div>
                )}
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    Đính kèm liên kết Tour
                  </span>
                  <p className="truncate text-xs font-semibold text-foreground">
                    {draftTour.tourName}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                    {draftTour.location && <span>{draftTour.location}</span>}
                    {draftTour.durationDays && <span>• {draftTour.durationDays} ngày</span>}
                    {draftTour.price !== undefined && (
                      <span className="font-semibold text-primary">
                        • {draftTour.price.toLocaleString('vi-VN')} đ
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to={`/tours/${draftTour.tourId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
                >
                  Xem chi tiết
                </Link>
                {onRemoveDraftTour && (
                  <button
                    type="button"
                    onClick={onRemoveDraftTour}
                    aria-label="Bỏ đính kèm tour"
                    className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

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
              // Ellipsis overflow handling for long placeholders
              className="max-h-40 flex-1 resize-none bg-transparent py-2 text-sm leading-relaxed outline-none placeholder:overflow-hidden placeholder:text-ellipsis placeholder:whitespace-nowrap placeholder:text-muted-foreground disabled:opacity-50"
            />

            <Popover
              open={isEmojiOpen}
              onOpenChange={setIsEmojiOpen}
              onOpenChangeComplete={(open) => {
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
