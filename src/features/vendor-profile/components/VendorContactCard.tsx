import { Mail, Phone } from 'lucide-react';
import type { VendorProfileDetail } from '../types';

interface VendorContactCardProps {
  profile: VendorProfileDetail;
}

export function VendorContactCard({ profile }: VendorContactCardProps) {
  const items = [
    { icon: Mail, label: 'Email hỗ trợ', value: profile.contactEmail },
    { icon: Phone, label: 'Số điện thoại', value: profile.contactPhone || 'Chưa cập nhật' },
  ];

  return (
    <div className="rounded-[32px] bg-muted/60 p-6 sm:p-8">
      <h3 className="text-lg font-bold text-foreground">
        Thông tin liên hệ
      </h3>

      <ul className="mt-5 space-y-4">
        {items.map(({ icon: Icon, label, value }) => (
          <li key={label} className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-border text-foreground">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {label}
              </p>
              <p className="truncate text-sm font-semibold text-foreground">
                {value}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
