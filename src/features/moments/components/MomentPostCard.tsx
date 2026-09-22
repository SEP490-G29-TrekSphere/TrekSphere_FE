import { Compass, EyeOff, Globe, Heart, ImageIcon, Lock, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { AppAvatar, ConfirmActionDialog } from '@/shared/ui';
import { formatDateTime } from '@/utils/format';
import { MOMENT_VISIBILITY_LABELS, MOMENT_VISIBILITY_TOGGLE } from '../constants';
import type { MomentItem, MomentScope, MomentVisibility } from '../types';
import { MomentGeoBadges } from './MomentGeoBadges';
import { MomentMediaGallery } from './MomentMediaGallery';
import { MomentPostMenu } from './MomentPostMenu';

export interface MomentPostCardProps {
  moment: MomentItem;
  currentUserId?: string;

  scope: MomentScope;

  canModerate?: boolean;
  onSelectMoment: (moment: MomentItem) => void;
  onSelectImage: (moment: MomentItem, index: number) => void;
  onHide?: (momentId: string) => void;
  onUnhide?: (momentId: string) => void;
  onDelete?: (momentId: string) => void;
  onToggleVisibility?: (momentId: string, visibility: MomentVisibility) => void;
  onViewOnMap?: (moment: MomentItem) => void;
}

export function MomentPostCard({
  moment,
  currentUserId,
  scope,
  canModerate = false,
  onSelectMoment,
  onSelectImage,
  onHide,
  onUnhide,
  onDelete,
  onToggleVisibility,
  onViewOnMap,
}: MomentPostCardProps) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const isAuthor = moment.userId === currentUserId || moment.authorUserId === currentUserId;
  const isHidden = moment.status === 'HIDDEN';
  const isPublic = moment.visibility === 'PUBLIC_PROFILE';
  const hasCoordinates = moment.latitude !== undefined && moment.longitude !== undefined;

  const { restricted, publicValue } = MOMENT_VISIBILITY_TOGGLE[scope];
  const targetVisibility = isPublic ? restricted : publicValue;
  const visibilityActionLabel = isPublic
    ? scope === 'group'
      ? 'Thu về chỉ trong nhóm'
      : 'Chuyển về Chỉ mình tôi'
    : scope === 'group'
      ? 'Chia sẻ lên Trang cá nhân'
      : 'Công khai lên hồ sơ';

  const handleToggleVisibility = onToggleVisibility
    ? () => onToggleVisibility(moment.momentId, targetVisibility)
    : undefined;

  return (
    <article
      className={cn(
        'flex flex-col overflow-hidden rounded-3xl border bg-card shadow-xs transition hover:shadow-md',
        isHidden ? 'border-rose-500/40 bg-rose-500/5 ring-1 ring-rose-500/20' : 'border-border/80'
      )}
    >
      <header className="flex items-center justify-between gap-3 border-border/40 border-b p-4 sm:p-5">
        <div className="flex min-w-0 items-center gap-3">
          <AppAvatar name={moment.authorName} src={moment.authorAvatarUrl} size="md" />
          <div className="min-w-0 space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="truncate font-extrabold text-foreground text-sm">
                {moment.authorName}
              </h4>
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-bold text-[10px]',
                  isPublic
                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    : 'bg-zinc-500/10 text-muted-foreground'
                )}
              >
                {isPublic ? <Globe className="h-2.5 w-2.5" /> : <Lock className="h-2.5 w-2.5" />}
                {MOMENT_VISIBILITY_LABELS[moment.visibility]}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">{formatDateTime(moment.createdAt)}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {isHidden && (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 font-bold text-[11px] text-rose-600 dark:bg-rose-950/50">
              <EyeOff className="h-3 w-3" /> Bị ẩn kiểm duyệt
            </span>
          )}
          <MomentPostMenu
            isAuthor={isAuthor}
            canModerate={canModerate}
            isHidden={isHidden}
            isPublic={isPublic}
            visibilityActionLabel={visibilityActionLabel}
            onToggleVisibility={handleToggleVisibility}
            onHide={onHide ? () => onHide(moment.momentId) : undefined}
            onUnhide={onUnhide ? () => onUnhide(moment.momentId) : undefined}
            onDelete={onDelete ? () => setIsDeleteOpen(true) : undefined}
          />
        </div>
      </header>

      {isHidden && moment.hiddenReason ? (
        <p className="border-rose-500/20 border-b bg-rose-500/5 px-4 py-2 text-[11px] text-rose-700 sm:px-5 dark:text-rose-300">
          Lý do kiểm duyệt: {moment.hiddenReason}
        </p>
      ) : null}

      <MomentGeoBadges moment={moment} onViewOnMap={onViewOnMap} />

      {moment.caption ? (
        <div className="px-4 py-3 sm:px-5">
          <p className="whitespace-pre-line font-medium text-foreground/90 text-xs leading-relaxed sm:text-sm">
            {moment.caption}
          </p>
        </div>
      ) : null}

      <MomentMediaGallery
        moment={moment}
        onSelectImage={(index) => onSelectImage(moment, index)}
        onShowAll={() => onSelectMoment(moment)}
      />

      <footer className="flex items-center justify-between gap-2 border-border/50 border-t p-3 text-muted-foreground text-xs sm:px-5 sm:py-3.5">
        <div className="flex items-center gap-4">
          {(moment.likesCount ?? 0) > 0 && (
            <span className="flex items-center gap-1.5 font-bold">
              <Heart className="h-4 w-4 text-rose-500" />
              {moment.likesCount}
            </span>
          )}
          {(moment.commentsCount ?? 0) > 0 && (
            <span className="flex items-center gap-1.5 font-bold">
              <MessageCircle className="h-4 w-4" />
              {moment.commentsCount}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {isAuthor && handleToggleVisibility && (
            <button
              type="button"
              onClick={handleToggleVisibility}
              className={cn(
                'flex cursor-pointer items-center gap-1 rounded-xl border px-2.5 py-1 font-bold text-[11px] transition',
                isPublic
                  ? 'border-blue-500/30 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 dark:text-blue-400'
                  : 'border-border bg-muted/40 text-foreground hover:bg-primary/10 hover:text-primary'
              )}
              title={visibilityActionLabel}
            >
              <Globe
                className={cn('h-3.5 w-3.5', isPublic ? 'text-blue-500' : 'text-muted-foreground')}
              />
              <span>{isPublic ? 'Đang công khai' : 'Công khai'}</span>
            </button>
          )}

          {hasCoordinates && onViewOnMap && (
            <button
              type="button"
              onClick={() => onViewOnMap(moment)}
              className="flex cursor-pointer items-center gap-1 rounded-xl border border-border bg-muted/40 px-2.5 py-1 font-bold text-[11px] text-foreground transition hover:bg-primary/10 hover:text-primary"
            >
              <Compass className="h-3.5 w-3.5 text-primary" />
              Xem trên Bản đồ
            </button>
          )}

          <button
            type="button"
            onClick={() => onSelectMoment(moment)}
            className="flex cursor-pointer items-center gap-1 rounded-xl border border-border bg-background px-2.5 py-1 font-bold text-[11px] text-foreground transition hover:bg-muted"
          >
            <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
            Chi tiết
          </button>
        </div>
      </footer>

      {isDeleteOpen && onDelete ? (
        <ConfirmActionDialog
          title="Xóa khoảnh khắc"
          description="Khoảnh khắc và toàn bộ ảnh đính kèm sẽ bị xóa vĩnh viễn, không thể khôi phục."
          detail={moment.locationName || moment.caption || undefined}
          confirmLabel="Xóa khoảnh khắc"
          variant="destructive"
          onConfirm={() => {
            setIsDeleteOpen(false);
            onDelete(moment.momentId);
          }}
          onCancel={() => setIsDeleteOpen(false)}
        />
      ) : null}
    </article>
  );
}
