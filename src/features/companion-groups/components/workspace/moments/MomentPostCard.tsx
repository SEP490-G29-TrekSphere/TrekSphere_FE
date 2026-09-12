import {
  Compass,
  Eye,
  EyeOff,
  Globe,
  Heart,
  ImageIcon,
  Lock,
  MapPin,
  MessageCircle,
  MoreVertical,
  Mountain,
  Navigation,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { MomentItem } from '../../../services/momentService';
import { MemberAvatar } from '../../detail/MemberAvatar';

interface MomentPostCardProps {
  moment: MomentItem;
  currentUserId?: string;
  isLeader: boolean;
  onSelectMoment: (moment: MomentItem) => void;
  onPreviewImage: (imageUrl: string) => void;
  onHide: (momentId: string) => void;
  onUnhide: (momentId: string) => void;
  onDelete: (momentId: string) => void;
  onToggleVisibility?: (momentId: string, visibility: 'GROUP_ONLY' | 'PUBLIC_PROFILE') => void;
  onViewOnMap?: (moment: MomentItem) => void;
}

export function MomentPostCard({
  moment,
  currentUserId,
  isLeader,
  onSelectMoment,
  onPreviewImage,
  onHide,
  onUnhide,
  onDelete,
  onToggleVisibility,
  onViewOnMap,
}: MomentPostCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(moment.likesCount ?? 0);

  const isAuthor = moment.userId === currentUserId || moment.authorUserId === currentUserId;
  const isHidden = moment.status === 'HIDDEN';
  const mediaList = moment.mediaList ?? [];
  const mediaCount = mediaList.length;

  const handleToggleLike = () => {
    if (isLiked) {
      setIsLiked(false);
      setLikeCount((prev) => Math.max(0, prev - 1));
    } else {
      setIsLiked(true);
      setLikeCount((prev) => prev + 1);
    }
  };

  const getMediaUrl = (idx: number) => {
    const item = mediaList[idx];
    return item?.imageUrl || item?.mediaUrl || '';
  };

  return (
    <div
      className={cn(
        'rounded-3xl border bg-card shadow-xs transition hover:shadow-md overflow-hidden flex flex-col',
        isHidden ? 'border-rose-500/40 bg-rose-500/5 ring-1 ring-rose-500/20' : 'border-border/80'
      )}
    >
      {/* 1. POST HEADER */}
      <div className="p-4 sm:p-5 flex items-center justify-between gap-3 border-b border-border/40">
        <div className="flex items-center gap-3">
          <MemberAvatar fullName={moment.authorName} avatarUrl={moment.authorAvatarUrl} size="md" />
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-extrabold text-foreground">{moment.authorName}</h4>
              {moment.visibility === 'PUBLIC_PROFILE' ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                  <Globe className="h-2.5 w-2.5" /> Công khai Profile
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-zinc-500/10 px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                  <Lock className="h-2.5 w-2.5" /> Chỉ trong nhóm
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {new Date(moment.createdAt).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>

        {/* Action Controls & Status */}
        <div className="flex items-center gap-1.5 relative">
          {isHidden && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-100 dark:bg-rose-950/50 px-2.5 py-1 rounded-full">
              <EyeOff className="h-3 w-3" /> Bị ẩn kiểm duyệt
            </span>
          )}

          {(isLeader || isAuthor) && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="h-8 w-8 rounded-xl border border-border/60 hover:bg-muted/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition cursor-pointer"
                title="Tùy chọn bài viết"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {isMenuOpen && (
                <>
                  <button
                    type="button"
                    aria-label="Đóng tùy chọn"
                    className="fixed inset-0 z-20 cursor-default bg-transparent border-0 p-0"
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-9 z-30 w-52 rounded-2xl border border-border bg-popover p-1.5 shadow-xl space-y-1 text-xs font-semibold">
                    {isAuthor && onToggleVisibility && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          const targetVis =
                            moment.visibility === 'PUBLIC_PROFILE'
                              ? 'GROUP_ONLY'
                              : 'PUBLIC_PROFILE';
                          onToggleVisibility(moment.momentId, targetVis);
                        }}
                        className="w-full flex items-center gap-2 rounded-xl px-2.5 py-2 text-foreground hover:bg-muted transition cursor-pointer text-left"
                      >
                        {moment.visibility === 'PUBLIC_PROFILE' ? (
                          <>
                            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>Thu về chỉ trong nhóm</span>
                          </>
                        ) : (
                          <>
                            <Globe className="h-3.5 w-3.5 text-blue-500" />
                            <span>Chia sẻ lên Trang cá nhân</span>
                          </>
                        )}
                      </button>
                    )}
                    {isLeader && !isHidden && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          onHide(moment.momentId);
                        }}
                        className="w-full flex items-center gap-2 rounded-xl px-2.5 py-2 text-rose-600 hover:bg-rose-500/10 transition cursor-pointer text-left"
                      >
                        <ShieldAlert className="h-3.5 w-3.5" /> Ẩn bài vi phạm
                      </button>
                    )}
                    {isLeader && isHidden && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          onUnhide(moment.momentId);
                        }}
                        className="w-full flex items-center gap-2 rounded-xl px-2.5 py-2 text-emerald-600 hover:bg-emerald-500/10 transition cursor-pointer text-left"
                      >
                        <Eye className="h-3.5 w-3.5" /> Bỏ ẩn bài viết
                      </button>
                    )}
                    {isAuthor && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          if (confirm('Bạn có chắc chắn muốn xóa khoảnh khắc này?')) {
                            onDelete(moment.momentId);
                          }
                        }}
                        className="w-full flex items-center gap-2 rounded-xl px-2.5 py-2 text-destructive hover:bg-destructive/10 transition cursor-pointer text-left border-t border-border/40"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Xóa khoảnh khắc
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. POST LOCATION & GEO BADGES */}
      {(moment.locationName ||
        moment.placeName ||
        moment.altitude ||
        (moment.latitude && moment.longitude)) && (
        <div className="px-4 sm:px-5 pt-3 flex flex-wrap items-center gap-2 text-xs">
          {(moment.locationName || moment.placeName) && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-bold text-primary">
              <MapPin className="h-3.5 w-3.5" />
              {moment.locationName || moment.placeName}
            </span>
          )}

          {moment.altitude && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 font-bold text-emerald-600 dark:text-emerald-400">
              <Mountain className="h-3.5 w-3.5" />
              {moment.altitude}
            </span>
          )}

          {moment.latitude !== undefined && moment.longitude !== undefined && (
            <button
              type="button"
              onClick={() => onViewOnMap?.(moment)}
              className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/30 px-2.5 py-1 text-[11px] font-mono text-muted-foreground hover:text-primary hover:border-primary/40 transition cursor-pointer"
              title="Bấm để xem vị trí trên Bản đồ"
            >
              <Navigation className="h-3 w-3 text-primary" />
              {moment.latitude.toFixed(4)}°, {moment.longitude.toFixed(4)}°
            </button>
          )}
        </div>
      )}

      {/* 3. POST CAPTION */}
      {moment.caption && (
        <div className="px-4 sm:px-5 py-3">
          <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-line font-medium">
            {moment.caption}
          </p>
        </div>
      )}

      {/* 4. MEDIA GALLERY GRID */}
      {mediaCount > 0 && (
        <div className="w-full bg-black/5">
          {mediaCount === 1 ? (
            /* Single Image */
            <button
              type="button"
              onClick={() => onPreviewImage(getMediaUrl(0))}
              className="relative w-full aspect-16/9 sm:aspect-21/9 max-h-[460px] overflow-hidden group cursor-pointer block border-0 p-0 text-left bg-black/10"
            >
              <img
                src={getMediaUrl(0)}
                alt={moment.caption || 'Khoảnh khắc TrekSphere'}
                className="w-full h-full object-cover group-hover:scale-103 transition duration-300"
              />
            </button>
          ) : mediaCount === 2 ? (
            /* 2 Images Grid */
            <div className="grid grid-cols-2 gap-1 max-h-[380px] overflow-hidden">
              {[0, 1].map((idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => onPreviewImage(getMediaUrl(idx))}
                  className="relative aspect-square w-full overflow-hidden group cursor-pointer border-0 p-0 bg-black/10"
                >
                  <img
                    src={getMediaUrl(idx)}
                    alt={`Khoảnh khắc ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </button>
              ))}
            </div>
          ) : mediaCount === 3 ? (
            /* 3 Images Grid (1 large left, 2 stacked right) */
            <div className="grid grid-cols-3 gap-1 max-h-[380px] overflow-hidden">
              <button
                type="button"
                onClick={() => onPreviewImage(getMediaUrl(0))}
                className="col-span-2 relative aspect-square sm:aspect-auto w-full h-full overflow-hidden group cursor-pointer border-0 p-0 bg-black/10"
              >
                <img
                  src={getMediaUrl(0)}
                  alt="Khoảnh khắc 1"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </button>
              <div className="col-span-1 grid grid-rows-2 gap-1 h-full">
                {[1, 2].map((idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => onPreviewImage(getMediaUrl(idx))}
                    className="relative w-full h-full aspect-square overflow-hidden group cursor-pointer border-0 p-0 bg-black/10"
                  >
                    <img
                      src={getMediaUrl(idx)}
                      alt={`Khoảnh khắc ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* 4+ Images Grid */
            <div className="grid grid-cols-2 gap-1 max-h-[400px] overflow-hidden">
              {[0, 1, 2, 3].map((idx) => {
                const isLast = idx === 3 && mediaCount > 4;
                return (
                  <button
                    type="button"
                    key={idx}
                    onClick={() =>
                      isLast ? onSelectMoment(moment) : onPreviewImage(getMediaUrl(idx))
                    }
                    className="relative aspect-4/3 sm:aspect-video w-full overflow-hidden group cursor-pointer border-0 p-0 bg-black/10"
                  >
                    <img
                      src={getMediaUrl(idx)}
                      alt={`Khoảnh khắc ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    {isLast && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-2xs flex items-center justify-center text-white font-extrabold text-base sm:text-lg">
                        +{mediaCount - 3} ảnh
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. INTERACTION & ACTION BAR */}
      <div className="p-3 sm:px-5 sm:py-3.5 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleToggleLike}
            className={cn(
              'flex items-center gap-1.5 font-bold transition cursor-pointer',
              isLiked ? 'text-rose-500' : 'hover:text-rose-500'
            )}
          >
            <Heart className={cn('h-4 w-4', isLiked && 'fill-rose-500')} />
            <span>{likeCount}</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectMoment(moment)}
            className="flex items-center gap-1.5 font-bold hover:text-primary transition cursor-pointer"
          >
            <MessageCircle className="h-4 w-4" />
            <span>{moment.commentsCount ?? 0}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {isAuthor && onToggleVisibility && (
            <button
              type="button"
              onClick={() => {
                const targetVis =
                  moment.visibility === 'PUBLIC_PROFILE' ? 'GROUP_ONLY' : 'PUBLIC_PROFILE';
                onToggleVisibility(moment.momentId, targetVis);
              }}
              className={cn(
                'flex items-center gap-1 rounded-xl px-2.5 py-1 text-[11px] font-bold transition cursor-pointer border',
                moment.visibility === 'PUBLIC_PROFILE'
                  ? 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20'
                  : 'border-border bg-muted/40 text-foreground hover:bg-primary/10 hover:text-primary'
              )}
              title={
                moment.visibility === 'PUBLIC_PROFILE'
                  ? 'Đang công khai trên Profile cá nhân. Bấm để thu về chỉ trong nhóm.'
                  : 'Bấm để chia sẻ bài viết này lên Profile cá nhân'
              }
            >
              <Globe
                className={cn(
                  'h-3.5 w-3.5',
                  moment.visibility === 'PUBLIC_PROFILE' ? 'text-blue-500' : 'text-muted-foreground'
                )}
              />
              <span>
                {moment.visibility === 'PUBLIC_PROFILE' ? 'Đã share Profile' : 'Share Profile'}
              </span>
            </button>
          )}

          {moment.latitude !== undefined && moment.longitude !== undefined && (
            <button
              type="button"
              onClick={() => onViewOnMap?.(moment)}
              className="flex items-center gap-1 rounded-xl border border-border bg-muted/40 px-2.5 py-1 text-[11px] font-bold text-foreground hover:bg-primary/10 hover:text-primary transition cursor-pointer"
            >
              <Compass className="h-3.5 w-3.5 text-primary" />
              Xem trên Bản đồ
            </button>
          )}

          <button
            type="button"
            onClick={() => onSelectMoment(moment)}
            className="flex items-center gap-1 rounded-xl border border-border bg-background px-2.5 py-1 text-[11px] font-bold text-foreground hover:bg-muted transition cursor-pointer"
          >
            <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
            Chi tiết
          </button>
        </div>
      </div>
    </div>
  );
}
