import { CheckCircle2 } from 'lucide-react';
import { AppAvatar, type AppAvatarSize } from '@/shared/ui';

interface MemberAvatarProps {
  fullName: string;
  avatarUrl?: string;
  isLeader?: boolean;
  size?: AppAvatarSize;
  className?: string;
}

const BADGE_SIZE_STYLES: Record<AppAvatarSize, string> = {
  xs: 'h-3 w-3',
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

/** Ảnh đại diện thành viên nhóm ghép — `AppAvatar` kèm huy hiệu Trưởng nhóm. */
export function MemberAvatar({
  fullName = '',
  avatarUrl,
  isLeader = false,
  size = 'md',
  className,
}: MemberAvatarProps) {
  return (
    <AppAvatar
      name={fullName}
      src={avatarUrl}
      size={size}
      className={className}
      badge={
        isLeader ? (
          <CheckCircle2 className={`fill-secondary text-primary ${BADGE_SIZE_STYLES[size]}`} />
        ) : null
      }
    />
  );
}
