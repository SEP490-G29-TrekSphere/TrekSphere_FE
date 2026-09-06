import {
  EmojiPicker as EmojiPickerPrimitive,
  type EmojiPickerRootProps,
  type EmojiPickerSearchProps,
  type EmojiPickerViewportProps,
} from 'frimousse';
import { Loader2, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Bộ chọn emoji dựng trên `frimousse` — headless, không phụ thuộc package nào
 * khác, dữ liệu emoji tải từ CDN jsdelivr khi mở lần đầu rồi được cache lại.
 */
function EmojiPicker({ className, ...props }: EmojiPickerRootProps) {
  return (
    <EmojiPickerPrimitive.Root
      locale="vi"
      columns={9}
      className={cn(
        'isolate flex h-[22rem] w-full flex-col overflow-hidden rounded-xl bg-popover text-popover-foreground',
        className
      )}
      {...props}
    />
  );
}

function EmojiPickerSearch({ className, ...props }: EmojiPickerSearchProps) {
  return (
    <div className="relative shrink-0 border-b border-border p-2">
      <Search className="pointer-events-none absolute top-1/2 left-4 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
      <EmojiPickerPrimitive.Search
        placeholder="Tìm emoji..."
        className={cn(
          'h-9 w-full rounded-lg bg-muted/60 pr-3 pl-8 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/40',
          className
        )}
        {...props}
      />
    </div>
  );
}

function EmojiPickerContent({ className, ...props }: EmojiPickerViewportProps) {
  return (
    <EmojiPickerPrimitive.Viewport
      className={cn('relative flex-1 outline-none', className)}
      {...props}
    >
      <EmojiPickerPrimitive.Loading className="absolute inset-0 flex items-center justify-center text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
      </EmojiPickerPrimitive.Loading>
      <EmojiPickerPrimitive.Empty className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
        Không tìm thấy emoji nào
      </EmojiPickerPrimitive.Empty>
      <EmojiPickerPrimitive.List
        className="select-none pb-1.5"
        components={{
          CategoryHeader: ({ category, ...headerProps }) => (
            <div
              className="bg-popover px-3 pt-3 pb-1.5 text-[11px] font-bold tracking-wide text-muted-foreground uppercase"
              {...headerProps}
            >
              {category.label}
            </div>
          ),
          Row: ({ children, ...rowProps }) => (
            <div className="scroll-my-1.5 px-1.5" {...rowProps}>
              {children}
            </div>
          ),
          Emoji: ({ emoji, ...emojiProps }) => (
            <button
              type="button"
              className="flex size-8 items-center justify-center rounded-md text-lg data-[active]:bg-muted"
              {...emojiProps}
            >
              {emoji.emoji}
            </button>
          ),
        }}
      />
    </EmojiPickerPrimitive.Viewport>
  );
}

export { EmojiPicker, EmojiPickerContent, EmojiPickerSearch };
