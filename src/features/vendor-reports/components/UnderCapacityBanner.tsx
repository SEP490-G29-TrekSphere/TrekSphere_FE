import { AlertTriangle, CalendarClock, Users } from 'lucide-react';
import type { UnderCapacityAlert } from '../types';

interface UnderCapacityBannerProps {
  alerts?: UnderCapacityAlert[];
  daysThreshold: number;
  onViewManifest: (scheduleId: string) => void;
}

function formatDate(value: string): string {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('vi-VN');
}

export function UnderCapacityBanner({
  alerts,
  daysThreshold,
  onViewManifest,
}: UnderCapacityBannerProps) {
  // Không có cảnh báo thì ẩn hẳn banner — đây là tin tốt, không cần chiếm chỗ.
  if (!alerts?.length) return null;
}
