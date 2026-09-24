import {
  AlertTriangle,
  CloudLightning,
  Compass,
  HeartPulse,
  type LucideIcon,
  PackageOpen,
} from 'lucide-react';
import type { IncidentType } from '../types/sos';

export interface IncidentMetaItem {
  id: IncidentType;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  colorClass: string;
  badgeClass: string;
  borderClass: string;
}

export const INCIDENT_TYPE_META: Record<IncidentType, IncidentMetaItem> = {
  INJURY: {
    id: 'INJURY',
    label: 'Chấn thương / Sự cố sức khỏe',
    shortLabel: 'Chấn thương',
    icon: HeartPulse,
    colorClass: 'text-rose-600 dark:text-rose-400',
    badgeClass: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
    borderClass: 'border-rose-500/40 bg-rose-500/5',
  },
  LOST: {
    id: 'LOST',
    label: 'Lạc đường / Lệch tuyến trekking',
    shortLabel: 'Lạc đường',
    icon: Compass,
    colorClass: 'text-amber-600 dark:text-amber-400',
    badgeClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
    borderClass: 'border-amber-500/40 bg-amber-500/5',
  },
  WEATHER: {
    id: 'WEATHER',
    label: 'Thời tiết xấu / Sạt lở / Mưa lũ',
    shortLabel: 'Thời tiết xấu',
    icon: CloudLightning,
    colorClass: 'text-purple-600 dark:text-purple-400',
    badgeClass: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
    borderClass: 'border-purple-500/40 bg-purple-500/5',
  },
  SUPPLIES: {
    id: 'SUPPLIES',
    label: 'Cần hỗ trợ nước & nhu yếu phẩm',
    shortLabel: 'Thiếu vật tư',
    icon: PackageOpen,
    colorClass: 'text-yellow-600 dark:text-yellow-400',
    badgeClass: 'bg-yellow-500/15 text-yellow-800 dark:text-yellow-300 border-yellow-500/30',
    borderClass: 'border-yellow-500/40 bg-yellow-500/5',
  },
  OTHER: {
    id: 'OTHER',
    label: 'Sự cố khác (Mô tả chi tiết)',
    shortLabel: 'Sự cố khác',
    icon: AlertTriangle,
    colorClass: 'text-slate-600 dark:text-slate-400',
    badgeClass: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30',
    borderClass: 'border-slate-500/40 bg-slate-500/5',
  },
};

export const INCIDENT_TYPE_OPTIONS = Object.values(INCIDENT_TYPE_META);

export function getIncidentTypeLabel(type: IncidentType): string {
  return INCIDENT_TYPE_META[type]?.label ?? 'Sự cố khẩn cấp';
}

export function getIncidentTypeMeta(type: IncidentType): IncidentMetaItem {
  return INCIDENT_TYPE_META[type] ?? INCIDENT_TYPE_META.OTHER;
}

export interface NationalHotline {
  name: string;
  number: string;
  desc: string;
  badge: string;
}

export const NATIONAL_HOTLINES: NationalHotline[] = [
  {
    name: 'Tổng đài Tìm kiếm Cứu nạn Quốc gia',
    number: '112',
    desc: 'Yêu cầu trợ giúp khẩn cấp toàn quốc 24/7',
    badge: 'Quốc gia (24/7)',
  },
  {
    name: 'Cấp cứu Y tế Quốc gia',
    number: '115',
    desc: 'Hỗ trợ sự cố sức khỏe, chấn thương',
    badge: 'Y tế khẩn cấp',
  },
];
