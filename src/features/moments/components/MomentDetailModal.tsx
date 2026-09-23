import { Heart, MessageCircle } from 'lucide-react';
import { AppButton, AppModalShell } from '@/shared/ui';
import { formatDate } from '@/utils/format';
import type { MomentItem } from '../types';
import { getMomentImageUrls } from '../utils/momentMedia';

interface MomentDetailModalProps {
  moment: MomentItem;
  onClose: () => void;

  onSelectImage: (index: number) => void;
}

export function MomentDetailModal({ moment, onClose, onSelectImage }: MomentDetailModalProps) {
  const urls = getMomentImageUrls(moment);
  const likesCount = moment.likesCount ?? 0;
  const commentsCount = moment.commentsCount ?? 0;

  return (
    <AppModalShell
      open
      onClose={onClose}
      className="max-w-2xl"
      aria-label={moment.locationName || 'Chi tiết khoảnh khắc'}
    >
      <div className="space-y-4">
        <div>
          <h3 className="font-extrabold text-base text-foreground">
            {moment.locationName || moment.placeName || 'Chi tiết khoảnh khắc'}
          </h3>
          <p className="mt-0.5 text-muted-foreground text-xs">
            Đăng bởi {moment.authorName} • {formatDate(moment.createdAt)}
          </p>
        </div>

        {urls.length > 0 && (
          <div className="grid max-h-[60vh] grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
            {urls.map((url, index) => (
              <button
                type="button"
                key={url}
                onClick={() => onSelectImage(index)}
                className="cursor-pointer overflow-hidden rounded-xl border-0 bg-black/5 p-0"
                aria-label={`Xem ảnh ${index + 1}`}
              >
                <img
                  src={url}
                  alt={`Ảnh khoảnh khắc ${index + 1}`}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {moment.caption ? (
          <p className="whitespace-pre-line rounded-xl border border-border/50 bg-muted/20 p-3 text-foreground text-xs leading-relaxed">
            {moment.caption}
          </p>
        ) : null}

        <div className="flex items-center justify-between gap-3 border-border border-t pt-3 text-muted-foreground text-xs">
          <div className="flex items-center gap-3">
            {likesCount > 0 && (
              <span className="flex items-center gap-1 font-bold text-rose-500">
                <Heart className="h-4 w-4" /> {likesCount} yêu thích
              </span>
            )}
            {commentsCount > 0 && (
              <span className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" /> {commentsCount} bình luận
              </span>
            )}
            {moment.altitude ? (
              <span className="font-bold font-mono text-primary">{moment.altitude}</span>
            ) : null}
          </div>

          <AppButton variant="outline" size="sm" onClick={onClose}>
            Đóng
          </AppButton>
        </div>
      </div>
    </AppModalShell>
  );
}
