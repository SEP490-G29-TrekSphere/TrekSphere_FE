
export const normalizePhoneNumber = (phone?: string | null): string => {
  if (!phone) return '';
  let cleaned = phone.trim().replace(/[\s.\-()]/g, '');
  if (cleaned.startsWith('+84')) {
    cleaned = `0${cleaned.slice(3)}`;
  } else if (cleaned.startsWith('84') && cleaned.length === 11) {
    cleaned = `0${cleaned.slice(2)}`;
  } else if (cleaned.startsWith('0084')) {
    cleaned = `0${cleaned.slice(4)}`;
  }
  return cleaned;
};

export const isValidVietnamesePhone = (phone?: string | null): boolean => {
  if (!phone) return false;
  const normalized = normalizePhoneNumber(phone);
  return /^0((3[2-9])|(5[689])|(7[06-9])|(8[1-689])|(9[0-46-9]))\d{7}$/.test(normalized);
};
