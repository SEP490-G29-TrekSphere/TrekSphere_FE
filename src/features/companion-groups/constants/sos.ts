import { AlertTriangle, Flame, HelpCircle, LifeBuoy, MapPin } from 'lucide-react';
import type { IncidentType } from '../types/sos';

export const INCIDENT_TYPE_OPTIONS: { id: IncidentType; label: string; icon: typeof LifeBuoy }[] = [
  { id: 'INJURY', label: 'Chấn thương / Sự cố sức khỏe', icon: LifeBuoy },
  { id: 'LOST', label: 'Lạc đường / Lệch tuyến trekking', icon: MapPin },
  { id: 'WEATHER', label: 'Thời tiết xấu / Sạt lở / Mưa lớn', icon: Flame },
  { id: 'SUPPLIES', label: 'Cần hỗ trợ nước & nhu yếu phẩm', icon: AlertTriangle },
  { id: 'OTHER', label: 'Sự cố Khác (Mô tả chi tiết)', icon: HelpCircle },
];

export function getIncidentTypeLabel(type: IncidentType): string {
  return INCIDENT_TYPE_OPTIONS.find((t) => t.id === type)?.label ?? 'Sự cố khẩn cấp';
}
