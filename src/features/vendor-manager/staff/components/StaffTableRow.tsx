import {
  VENDOR_STAFF_ROLE_LABELS,
  VENDOR_STAFF_ROLES,
  type VendorStaffMember,
  type VendorStaffRole,
} from '../types';
import { StaffStatusBadge } from './StaffStatusBadge';

interface StaffTableRowProps {
  staff: VendorStaffMember;

  onLockClick: (staff: VendorStaffMember) => void;

  onUnlock: (staff: VendorStaffMember) => void;

  onRoleChange: (staff: VendorStaffMember, role: VendorStaffRole) => void;

  isRoleUpdating?: boolean;
}

const FALLBACK_AVATAR =
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face';

export function StaffTableRow({
  staff,
  onLockClick,
  onUnlock,
  onRoleChange,
  isRoleUpdating = false,
}: StaffTableRowProps) {
  const avatarSrc = staff.avatarUrl ?? FALLBACK_AVATAR;
  const initial = staff.fullName.charAt(0).toUpperCase();

  return (
    <tr className="border-b transition-colors last:border-b-0" style={{ borderColor: '#E6E2D1' }}>
      <td className="px-6 py-4" style={{ verticalAlign: 'middle' }}>
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-bold"
            style={{ backgroundColor: '#F0EEE6', color: '#06261D' }}
          >
            <img
              src={avatarSrc}
              alt={staff.fullName}
              className="h-full w-full object-cover"
              loading="lazy"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = 'none';
                const span = document.createElement('span');
                span.textContent = initial;
                target.parentElement?.appendChild(span);
              }}
            />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold" style={{ color: '#06261D' }}>
              {staff.fullName}
            </span>
            <span className="text-xs" style={{ color: '#6F7B75' }}>
              ID: {staff.shortId}
            </span>
          </div>
        </div>
      </td>

      <td className="px-6 py-4" style={{ verticalAlign: 'middle' }}>
        <span className="text-sm" style={{ color: '#6F7B75' }}>
          {staff.email}
        </span>
      </td>

      <td className="px-6 py-4" style={{ verticalAlign: 'middle' }}>
        <StaffStatusBadge isActive={staff.isActive} />
      </td>

      <td className="px-6 py-4" style={{ verticalAlign: 'middle' }}>
        <select
          aria-label={`Vai trò của ${staff.fullName}`}
          value={staff.role}
          disabled={isRoleUpdating}
          onChange={(e) => onRoleChange(staff, e.target.value as VendorStaffRole)}
          className="w-full max-w-[180px] rounded-full px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-1 disabled:opacity-60"
          style={{ backgroundColor: '#F0EEE6', color: '#06261D', border: '1px solid #E0DCD1' }}
        >
          {VENDOR_STAFF_ROLES.map((value) => (
            <option key={value} value={value}>
              {VENDOR_STAFF_ROLE_LABELS[value]}
            </option>
          ))}
        </select>
      </td>

      <td className="px-6 py-4 text-right" style={{ verticalAlign: 'middle' }}>
        {staff.isActive ? (
          <button
            type="button"
            onClick={() => onLockClick(staff)}
            className="inline-flex items-center rounded-full px-5 py-2 text-sm font-semibold transition-colors"
            style={{ backgroundColor: '#FFFFFF', color: '#DC2626', border: '1px solid #DC2626' }}
          >
            Khóa
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onUnlock(staff)}
            className="inline-flex items-center rounded-full px-5 py-2 text-sm font-semibold transition-colors"
            style={{ backgroundColor: '#06261D', color: '#FFFFFF' }}
          >
            Mở khóa
          </button>
        )}
      </td>
    </tr>
  );
}
