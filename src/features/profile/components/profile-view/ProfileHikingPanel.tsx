import { Compass, MapPin, Mountain, PencilLine, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HIKING_EXPERIENCE_LEVEL_META, HIKING_PREFERRED_DIFFICULTY_LABELS } from '@/constants';
import type { HikingProfileView } from '../../types';

interface ProfileHikingPanelProps {
  summary: HikingProfileView | null;
  isOwnProfile: boolean;
  /** Đường dẫn trang chỉnh sửa — chỉ dùng khi là hồ sơ của chính mình. */
  editPath: string;
}

/**
 * Thẻ "Hồ sơ leo núi" ở cột trái (Sidebar Info Card) — thiết kế dạng Intro giống Facebook:
 * Lời giới thiệu (Bio), Cấp độ kinh nghiệm, Độ khó ưa thích, Khu vực và Kỹ năng.
 */
export function ProfileHikingPanel({ summary, isOwnProfile, editPath }: ProfileHikingPanelProps) {
  const experience = summary?.experienceLevel
    ? HIKING_EXPERIENCE_LEVEL_META[summary.experienceLevel]
    : null;
  const areas = summary?.preferredAreas?.filter(Boolean) ?? [];
  const skills = summary?.skills?.filter(Boolean) ?? [];
  const hasContent = Boolean(
    summary?.bio ||
      experience ||
      summary?.preferredDifficulty ||
      areas.length > 0 ||
      skills.length > 0
  );

  if (!hasContent) {
    return (
      <section className="rounded-3xl bg-card p-6 shadow-sm border border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">Hồ sơ leo núi</h2>
          {isOwnProfile && (
            <Link
              to={editPath}
              aria-label="Cập nhật hồ sơ leo núi"
              className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-primary transition-colors"
            >
              <PencilLine className="size-4" />
            </Link>
          )}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {isOwnProfile
            ? 'Bổ sung kinh nghiệm, kỹ năng và khu vực ưa thích để tăng độ uy tín khi ghép nhóm.'
            : 'Người dùng này chưa cập nhật hồ sơ leo núi.'}
        </p>
        {isOwnProfile && (
          <Link
            to={editPath}
            className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-2xl bg-muted px-4 py-2 text-xs font-semibold text-primary transition-colors hover:bg-accent"
          >
            <PencilLine className="size-3.5" />
            Cập nhật hồ sơ
          </Link>
        )}
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-3xl bg-card p-6 shadow-sm border border-border">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-foreground">Hồ sơ leo núi</h2>
        {isOwnProfile && (
          <Link
            to={editPath}
            aria-label="Chỉnh sửa hồ sơ leo núi"
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-primary transition-colors"
          >
            <PencilLine className="size-4" />
          </Link>
        )}
      </div>

      {summary?.bio && (
        <p className="whitespace-pre-line text-xs leading-relaxed text-muted-foreground border-b border-border pb-3">
          {summary.bio}
        </p>
      )}

      <div className="space-y-3 pt-1 text-xs">
        {experience && (
          <div className="flex items-start gap-2.5 text-foreground">
            <Mountain className="size-4 shrink-0 text-primary mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-muted-foreground">Cấp độ kinh nghiệm</p>
              <span
                className={`mt-0.5 inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${experience.className}`}
              >
                {experience.label}
              </span>
            </div>
          </div>
        )}

        {summary?.preferredDifficulty && (
          <div className="flex items-start gap-2.5 text-foreground">
            <Compass className="size-4 shrink-0 text-primary mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-muted-foreground">Độ khó ưa thích</p>
              <p className="mt-0.5 font-semibold text-foreground">
                {HIKING_PREFERRED_DIFFICULTY_LABELS[summary.preferredDifficulty]}
              </p>
            </div>
          </div>
        )}

        {areas.length > 0 && (
          <div className="flex items-start gap-2.5 text-foreground">
            <MapPin className="size-4 shrink-0 text-primary mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-muted-foreground">Khu vực ưa thích</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {areas.map((area) => (
                  <span
                    key={area}
                    className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-foreground"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {skills.length > 0 && (
          <div className="flex items-start gap-2.5 text-foreground">
            <Sparkles className="size-4 shrink-0 text-primary mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-muted-foreground">Kỹ năng</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-foreground"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
