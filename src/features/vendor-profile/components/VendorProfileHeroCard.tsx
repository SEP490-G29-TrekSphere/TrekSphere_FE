import { Pencil } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RichTextContent } from '@/shared/ui';
import type { VendorProfileDetail } from '../types';

interface VendorProfileHeroCardProps {
  profile: VendorProfileDetail;
  isManager: boolean;
  editPath: string;
}

export function VendorProfileHeroCard({
  profile,
  isManager,
  editPath,
}: VendorProfileHeroCardProps) {
  const initial = profile.companyName.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col gap-5 rounded-[32px] bg-muted/60 p-6 sm:flex-row sm:items-start sm:p-8">
      {/* Logo */}
      <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-border text-2xl font-extrabold text-foreground">
        {profile.logoUrl ? (
          <img
            src={profile.logoUrl}
            alt={profile.companyName}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <span>{initial}</span>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <h2 className="text-2xl font-extrabold text-foreground">{profile.companyName}</h2>

        {profile.description && (
          <div className="mt-2 text-sm leading-relaxed text-muted-foreground">
            <RichTextContent content={profile.description} />
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {isManager && (
            <Link
              to={editPath}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              <Pencil className="h-4 w-4" />
              Chỉnh sửa hồ sơ
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
