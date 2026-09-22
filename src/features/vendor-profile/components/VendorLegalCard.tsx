import { Building2, Copy, FileText } from 'lucide-react';
import { toast } from '@/store/useToastStore';
import type { VendorProfileDetail } from '../types';

interface VendorLegalCardProps {
  profile: VendorProfileDetail;
}

export function VendorLegalCard({ profile }: VendorLegalCardProps) {
  const handleCopyTaxCode = async () => {
    if (!profile.taxCode) return;
    try {
      await navigator.clipboard.writeText(profile.taxCode);
      toast.success('Đã sao chép mã số thuế.');
    } catch {
      toast.error('Không thể sao chép. Vui lòng thử lại.');
    }
  };

  const fileName = profile.businessLicenseUrl?.split('/').pop() || 'giay-phep-kinh-doanh';

  return (
    <div className="rounded-[32px] bg-muted/60 p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-border text-foreground">
          <Building2 className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-bold text-foreground">
          Pháp lý &amp; Giấy phép
        </h3>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Mã số thuế
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">
              {profile.taxCode || 'Chưa cập nhật'}
            </span>
            {profile.taxCode && (
              <button
                type="button"
                onClick={handleCopyTaxCode}
                aria-label="Sao chép mã số thuế"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Giấy phép kinh doanh
          </p>
          {profile.businessLicenseUrl ? (
            <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border p-3">
              <FileText className="h-6 w-6 shrink-0 text-foreground" />
              <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground">
                {fileName}
              </span>
              <a
                href={profile.businessLicenseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
              >
                Xem
              </a>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Chưa có giấy phép kinh doanh.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
