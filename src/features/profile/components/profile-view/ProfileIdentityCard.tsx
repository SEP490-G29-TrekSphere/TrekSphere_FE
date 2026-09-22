import {
  KeyRound,
  Loader2,
  MessageCircle,
  MoreHorizontal,
  NotebookPen,
  PencilLine,
  ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiService } from '@/config/apiClient';
import {
  getRoleChatPath,
  HIKING_EXPERIENCE_LEVEL_META,
  type HikingExperienceLevel,
  PATHS,
} from '@/constants';
import { useToggleFollow } from '@/features/news';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import { getSafeImageUrl } from '@/utils/sanitize';

interface ProfileIdentityCardProps {
  name: string;
  avatarUrl?: string;

  email?: string;

  roleLabel?: string;

  blogCount?: number;
  isOwnProfile: boolean;

  editPath: string;

  changePasswordPath?: string;

  userId?: string;

  experienceLevel?: HikingExperienceLevel;

  trustScore?: number;
  trustReviewCount?: number;
}

interface StatProps {
  label: string;
  value: string;
}

function Stat({ label, value }: StatProps) {
  return (
    <div className="min-w-0 flex-1 text-center">
      <p className="text-lg font-bold text-primary">{value}</p>
      <p className="truncate text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export function ProfileIdentityCard({
  name,
  avatarUrl,
  email,
  roleLabel,
  blogCount,
  isOwnProfile,
  editPath,
  changePasswordPath = PATHS.CHANGE_PASSWORD,
  userId,
  experienceLevel,
  trustScore,
  trustReviewCount,
}: ProfileIdentityCardProps) {
  const navigate = useNavigate();
  const currentUser = useAppStore((state) => state.user);
  const [isConnectingChat, setIsConnectingChat] = useState(false);
  const followMutation = useToggleFollow();
  const socialEnabled = followMutation.isAvailable;

  const experience = experienceLevel ? HIKING_EXPERIENCE_LEVEL_META[experienceLevel] : null;
  const safeAvatar = getSafeImageUrl(avatarUrl);
  const initial = name?.trim()?.[0]?.toUpperCase() || '?';

  async function handleChat() {
    if (!currentUser) {
      toast.warning('Vui lòng đăng nhập để nhắn tin với người dùng này.');
      return;
    }
    if (!userId) return;

    setIsConnectingChat(true);
    try {
      const response = await ApiService<{ conversationId?: string }>(
        '/chat/conversations/check',
        'POST',
        {
          conversationType: 'DIRECT',
          participantIds: [userId],
        }
      );

      if (response.data?.conversationId) {
        navigate(getRoleChatPath(currentUser.roles), {
          state: { conversationId: response.data.conversationId },
        });
      } else {
        navigate(getRoleChatPath(currentUser.roles), {
          state: {
            virtualConversation: {
              type: 'DIRECT',
              participantIds: [userId],
              userName: name || 'Người dùng',
              title: name || 'Người dùng',
            },
          },
        });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể kết nối đến cuộc trò chuyện');
    } finally {
      setIsConnectingChat(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="relative flex flex-col items-center rounded-3xl bg-card p-6 shadow-sm">
        <button
          type="button"
          aria-label="Tuỳ chọn hồ sơ"
          disabled
          title="Sắp ra mắt"
          className="absolute right-4 top-4 cursor-pointer rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          <MoreHorizontal className="size-5" />
        </button>

        {/* Avatar */}
        <div className="size-[120px] overflow-hidden rounded-full bg-muted ring-4 ring-muted">
          {safeAvatar ? (
            <img src={safeAvatar} alt={name} className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-primary text-4xl font-bold text-primary-foreground">
              {initial}
            </span>
          )}
        </div>

        {roleLabel || experience ? (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
            {roleLabel ? (
              <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary">
                {roleLabel}
              </span>
            ) : null}
            {experience ? (
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${experience.className}`}
              >
                {experience.label}
              </span>
            ) : null}
          </div>
        ) : null}

        <h1 className="mt-3 text-center text-2xl font-bold leading-tight text-primary">{name}</h1>

        {isOwnProfile && email ? (
          <p className="mt-1 max-w-full truncate text-sm text-muted-foreground">{email}</p>
        ) : null}

        <div className="mt-5 flex w-full items-center justify-center rounded-2xl bg-muted/50 py-3">
          <Stat
            label="Bài viết"
            value={typeof blogCount === 'number' ? blogCount.toLocaleString('vi-VN') : '—'}
          />
        </div>

        {typeof trustScore === 'number' ? (
          <div className="mt-4 flex w-full items-center justify-between rounded-2xl bg-muted px-4 py-2.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <ShieldCheck className="size-4 text-primary" />
              Điểm uy tín
            </span>
            <span className="text-sm font-bold text-primary">
              {trustScore}
              <span className="ml-1 text-xs font-medium text-muted-foreground">
                · {trustReviewCount ?? 0} đánh giá
              </span>
            </span>
          </div>
        ) : null}

        {isOwnProfile ? (
          <Link
            to={editPath}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            <PencilLine className="size-4" />
            Chỉnh sửa hồ sơ
          </Link>
        ) : (
          <div className="mt-5 flex w-full flex-col gap-2">
            <button
              type="button"
              onClick={handleChat}
              disabled={isConnectingChat}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isConnectingChat ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <MessageCircle className="size-4" />
              )}
              Nhắn tin
            </button>

            {socialEnabled && (
              <button
                type="button"
                onClick={() => userId && followMutation.mutate({ userId, following: true })}
                className="inline-flex w-full cursor-pointer items-center justify-center rounded-full bg-muted px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-accent"
              >
                Theo dõi
              </button>
            )}
          </div>
        )}

        {isOwnProfile ? (
          <div className="mt-3 flex w-full flex-col gap-2">
            <Link
              to={PATHS.TREKKER_BLOG_LIST}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-muted px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-accent"
            >
              <NotebookPen className="size-4" />
              Bài viết của tôi
            </Link>
            <Link
              to={changePasswordPath}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-muted px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-accent"
            >
              <KeyRound className="size-4" />
              Đổi mật khẩu
            </Link>
          </div>
        ) : null}
      </section>
    </div>
  );
}
