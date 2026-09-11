import { Compass, MapPin, Mountain, PencilLine, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HIKING_EXPERIENCE_LEVEL_META, HIKING_PREFERRED_DIFFICULTY_LABELS } from '@/constants';
import type { HikingProfileView } from '../../types';

interface ProfileHikingPanelProps {
  summary: HikingProfileView | null;
  isOwnProfile: boolean;
  /** Đường dẫn trang chỉnh sửa — chỉ dùng khi là hồ sơ của chính mình. */
  editPath: string;
}

function StatCard({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-muted/40 p-4">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function ChipSection({
  icon,
  title,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
}) {
  return (
    <div>
      <h3 className="flex items-center gap-1.5 text-sm font-bold text-primary">
        {icon}
        {title}
      </h3>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-semibold text-primary"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Tab "Hồ sơ leo núi" — phần công khai của một Trekker: kinh nghiệm, độ khó ưa
 * thích, điểm uy tín, khu vực, kỹ năng và lời giới thiệu.
 *
 * Dùng chung cho hồ sơ của mình (`GET /users/me`) và hồ sơ người khác
 * (`GET /users/{id}/hiking-summary`) vì hai response có cùng các field này.
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
      <section className="rounded-2xl bg-card p-10 text-center shadow-sm">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-accent text-primary">
          <Mountain className="size-7" />
        </span>
        <h2 className="mt-4 text-base font-bold text-primary">Chưa có hồ sơ leo núi</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          {isOwnProfile
            ? 'Bổ sung kinh nghiệm, kỹ năng và khu vực ưa thích để trưởng nhóm dễ chấp nhận đơn xin tham gia của bạn hơn.'
            : 'Người dùng này chưa chia sẻ kinh nghiệm leo núi của họ.'}
        </p>
        {isOwnProfile ? (
          <Link
            to={editPath}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            <PencilLine className="size-4" />
            Cập nhật hồ sơ leo núi
          </Link>
        ) : null}
      </section>
    );
  }

  return (
    <section className="space-y-6 rounded-2xl bg-card p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-primary">Hồ sơ leo núi</h2>
          <p className="text-xs text-muted-foreground">
            Thông tin công khai giúp nhóm ghép đánh giá năng lực đồng hành.
          </p>
        </div>
        {isOwnProfile ? (
          <Link
            to={editPath}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-muted px-4 py-2 text-xs font-semibold text-primary transition-colors hover:bg-accent"
          >
            <PencilLine className="size-3.5" />
            Chỉnh sửa
          </Link>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard icon={<Mountain className="size-3.5 text-primary" />} label="Kinh nghiệm">
          {experience ? (
            <span
              className={`inline-block rounded-full border px-3 py-1 text-xs font-bold ${experience.className}`}
            >
              {experience.label}
            </span>
          ) : (
            <p className="text-sm font-semibold text-muted-foreground">Chưa cập nhật</p>
          )}
        </StatCard>

        <StatCard icon={<Compass className="size-3.5 text-primary" />} label="Độ khó ưa thích">
          <p className="text-sm font-bold text-primary">
            {summary?.preferredDifficulty
              ? HIKING_PREFERRED_DIFFICULTY_LABELS[summary.preferredDifficulty]
              : 'Chưa cập nhật'}
          </p>
        </StatCard>

        <StatCard icon={<ShieldCheck className="size-3.5 text-primary" />} label="Điểm uy tín">
          {typeof summary?.trustScore === 'number' ? (
            <p className="text-sm font-bold text-primary">
              {summary.trustScore}
              <span className="ml-1.5 text-xs font-medium text-muted-foreground">
                · {summary.trustReviewCount ?? 0} đánh giá
              </span>
            </p>
          ) : (
            <p className="text-sm font-semibold text-muted-foreground">Chưa có</p>
          )}
        </StatCard>
      </div>

      {areas.length > 0 && (
        <ChipSection
          icon={<MapPin className="size-4 text-primary" />}
          title="Khu vực ưa thích"
          items={areas}
        />
      )}

      {skills.length > 0 && (
        <ChipSection
          icon={<Sparkles className="size-4 text-primary" />}
          title="Kỹ năng"
          items={skills}
        />
      )}

      {summary?.bio ? (
        <div>
          <h3 className="text-sm font-bold text-primary">Giới thiệu</h3>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {summary.bio}
          </p>
        </div>
      ) : null}
    </section>
  );
}
