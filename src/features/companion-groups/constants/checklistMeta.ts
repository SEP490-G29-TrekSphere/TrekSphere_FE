import type { GroupChecklistItemType } from '../types/workspace';

export const ITEM_TYPE_OPTIONS: Array<{ label: string; value: GroupChecklistItemType }> = [
  { label: 'Lều trại & Dã ngoại', value: 'TENT' },
  { label: 'Y tế & Cấp cứu', value: 'MEDICAL' },
  { label: 'Điện tử & Đèn pin', value: 'ELECTRONICS' },
  { label: 'Trang phục & Giày dép', value: 'CLOTHING' },
  { label: 'Khác', value: 'OTHER' },
];

export function getItemTypeLabel(type?: GroupChecklistItemType): string {
  if (!type) return 'Khác';
  const found = ITEM_TYPE_OPTIONS.find((opt) => opt.value === type);
  return found ? found.label : type;
}
