import type { UserProfile } from '@/features/auth';
import { formatDate } from '@/utils/format';
import { GENDER_LABELS } from '../../types';

interface ProfileInfoPanelProps {
  profile: UserProfile;
}

function InfoCell({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-xl bg-muted p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1.5 text-sm font-semibold text-primary">{value || '—'}</p>
    </div>
  );
}

/**
 * Tab "Thông tin" — chỉ hiển thị ở hồ sơ của chính mình.
 * Giữ nguyên nội dung màn ViewProfile cũ để không mất chức năng khi đổi giao diện.
 */
export function ProfileInfoPanel({ profile }: ProfileInfoPanelProps) {
  const displayGender = profile.gender ? GENDER_LABELS[profile.gender] : '—';
  const displayDob = profile.dateOfBirth
    ? formatDate(profile.dateOfBirth) || profile.dateOfBirth
    : '—';

  return (
    <section className="rounded-2xl bg-card p-6 shadow-sm">
      <h2 className="mb-5 text-lg font-bold text-primary">Thông tin cá nhân</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <InfoCell label="Họ và tên" value={profile.name} />
        <InfoCell label="Số điện thoại" value={profile.phone} />
        <InfoCell label="Email" value={profile.email} />
        <InfoCell label="Ngày sinh" value={displayDob} />
        <InfoCell label="Giới tính" value={displayGender} />
      </div>
    </section>
  );
}
