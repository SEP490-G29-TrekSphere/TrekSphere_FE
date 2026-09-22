import { ShieldCheck } from 'lucide-react';
import { VENDOR_PROFILE_STATUS_LABELS, type VendorProfileStatus } from '../types';

interface VendorAccountStatusCardProps {
  status: VendorProfileStatus;
}

export function VendorAccountStatusCard({ status }: VendorAccountStatusCardProps) {
  return (
    <div className="flex flex-col rounded-[32px] bg-primary p-6 text-white sm:p-8">
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
        Trạng thái tài khoản
      </p>

      <div className="mt-4 flex items-center gap-3">
        <ShieldCheck className="h-7 w-7 text-secondary" />
        <span className="text-xl font-extrabold">{VENDOR_PROFILE_STATUS_LABELS[status]}</span>
      </div>

      <div className="my-5 h-px w-full bg-white/15" />

      <blockquote className="text-sm leading-relaxed italic text-white/80">
        "Cập nhật đầy đủ thông tin liên hệ và pháp lý giúp tăng độ tin cậy với khách hàng."
      </blockquote>
    </div>
  );
}
