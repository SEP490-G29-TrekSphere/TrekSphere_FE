import { Compass, MapPin, Mountain, PencilLine, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  HIKING_EXPERIENCE_LEVEL_META,
  HIKING_PREFERRED_DIFFICULTY_LABELS,
  PATHS,
} from '@/constants';
import type { UserProfile } from '@/features/auth';
import { formatDate } from '@/utils/format';
import { GENDER_LABELS } from '../../types';

interface ProfileInfoPanelProps {
  profile: UserProfile;
  editPath?: string;
}

function InfoCell({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-xl bg-muted/60 p-4 border border-border/50">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value || '—'}</p>
    </div>
  );
}

export function ProfileInfoPanel({
  profile,
  editPath = PATHS.EDIT_PROFILE,
}: ProfileInfoPanelProps) {
  const displayGender = profile.gender ? GENDER_LABELS[profile.gender] : '—';
  const displayDob = profile.dateOfBirth
    ? formatDate(profile.dateOfBirth) || profile.dateOfBirth
    : '—';

  const experience = profile.experienceLevel
    ? HIKING_EXPERIENCE_LEVEL_META[profile.experienceLevel]
    : null;
  const areas = profile.preferredAreas?.filter(Boolean) ?? [];
  const skills = profile.skills?.filter(Boolean) ?? [];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-card p-6 shadow-sm border border-border">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-foreground">Thông tin cá nhân</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Thông tin riêng tư của bạn dùng cho hệ thống và liên lạc.
            </p>
          </div>
          <Link
            to={editPath}
            className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3.5 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-accent"
          >
            <PencilLine className="size-3.5" />
            Chỉnh sửa
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-3">
          <InfoCell label="Họ và tên" value={profile.name} />
          <InfoCell label="Số điện thoại" value={profile.phone} />
          <InfoCell label="Email" value={profile.email} />
          <InfoCell label="Ngày sinh" value={displayDob} />
          <InfoCell label="Giới tính" value={displayGender} />
        </div>
      </section>

      <section className="rounded-3xl bg-card p-6 shadow-sm border border-border space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground">Hồ sơ & Năng lực leo núi</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Thông tin công khai giúp trưởng đoàn đánh giá năng lực khi ghép nhóm.
            </p>
          </div>
          <Link
            to={editPath}
            className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3.5 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-accent"
          >
            <PencilLine className="size-3.5" />
            Cập nhật
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-2xl bg-muted/60 p-4 border border-border/50">
            <Mountain className="size-5 shrink-0 text-primary mt-0.5" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Cấp độ kinh nghiệm
              </p>
              <div className="mt-1">
                {experience ? (
                  <span
                    className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-bold ${experience.className}`}
                  >
                    {experience.label}
                  </span>
                ) : (
                  <p className="text-sm font-semibold text-muted-foreground">Chưa cập nhật</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-muted/60 p-4 border border-border/50">
            <Compass className="size-5 shrink-0 text-primary mt-0.5" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Độ khó ưa thích
              </p>
              <p className="mt-1 text-sm font-bold text-foreground">
                {profile.preferredDifficulty
                  ? HIKING_PREFERRED_DIFFICULTY_LABELS[profile.preferredDifficulty]
                  : 'Chưa cập nhật'}
              </p>
            </div>
          </div>
        </div>

        {areas.length > 0 && (
          <div>
            <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              <MapPin className="size-4 text-primary" />
              Khu vực ưa thích
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {areas.map((area) => (
                <span
                  key={area}
                  className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-foreground"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        )}

        {skills.length > 0 && (
          <div>
            <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              <Sparkles className="size-4 text-primary" />
              Kỹ năng & Sở trường
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-foreground"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {profile.bio && (
          <div className="border-t border-border pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Giới thiệu bản thân
            </h3>
            <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-foreground">
              {profile.bio}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
