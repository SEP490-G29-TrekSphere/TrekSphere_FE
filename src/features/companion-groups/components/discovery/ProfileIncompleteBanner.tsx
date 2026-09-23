import { AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PATHS } from '@/constants/paths';

export interface ProfileIncompleteBannerProps {
  missingCount: number;
  returnPath?: string;
}

export function ProfileIncompleteBanner({
  missingCount,
  returnPath,
}: ProfileIncompleteBannerProps) {
  const targetPath = returnPath
    ? `${PATHS.EDIT_PROFILE}?returnUrl=${encodeURIComponent(returnPath)}`
    : PATHS.EDIT_PROFILE;

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="size-5" />
          </div>
          <div>
            <h4 className="flex items-center gap-1.5 font-bold text-foreground text-sm sm:text-base">
              Hồ sơ của bạn còn {missingCount} thông tin chưa hoàn thiện
              <Sparkles className="size-4 text-amber-500" />
            </h4>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Hãy bổ sung đầy đủ thông tin cá nhân và hồ sơ leo núi để có thể tham gia hoặc tạo nhóm
              ghép đồng hành.
            </p>
          </div>
        </div>

        <Link
          to={targetPath}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 sm:text-sm"
        >
          Hoàn tất hồ sơ
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
