import {
  Bus,
  CircleDollarSign,
  Compass,
  type LucideIcon,
  ShieldCheck,
  Tent,
  UtensilsCrossed,
} from 'lucide-react';
import type { CostItemCategory } from '../../../types/matchingGroup';

export interface CategoryMetaItem {
  label: string;
  icon: LucideIcon;
  colorClass: string;
}

export const CATEGORY_META: Record<
  CostItemCategory | 'trans' | 'food' | 'gear' | 'other',
  CategoryMetaItem
> = {
  PERMIT: {
    label: 'Giấy phép & Phí',
    icon: ShieldCheck,
    colorClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
  },
  GUIDE: {
    label: 'HDV & Porter',
    icon: Compass,
    colorClass: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
  },
  FOOD: {
    label: 'Ăn Uống BBQ',
    icon: UtensilsCrossed,
    colorClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
  },
  TRANSPORT: {
    label: 'Di Chuyển',
    icon: Bus,
    colorClass: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
  },
  GEAR: {
    label: 'Dụng Cụ Lều',
    icon: Tent,
    colorClass: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20',
  },
  OTHER: {
    label: 'Chi Phí Khác',
    icon: CircleDollarSign,
    colorClass: 'bg-muted text-muted-foreground border-border',
  },
  trans: {
    label: 'Di Chuyển',
    icon: Bus,
    colorClass: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
  },
  food: {
    label: 'Ăn Uống BBQ',
    icon: UtensilsCrossed,
    colorClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
  },
  gear: {
    label: 'Dụng Cụ Lều',
    icon: Tent,
    colorClass: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20',
  },
  other: {
    label: 'Chi Phí Khác',
    icon: CircleDollarSign,
    colorClass: 'bg-muted text-muted-foreground border-border',
  },
};
