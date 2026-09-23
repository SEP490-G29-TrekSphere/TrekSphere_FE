/**
 * Chuẩn hoá số điện thoại về định dạng chuẩn 10 chữ số bắt đầu bằng 0 (ví dụ: 0837319199).
 * Loại bỏ khoảng trắng, dấu chấm, dấu gạch ngang, ngoặc đơn và đổi tiền tố +84 / 84 / 0084 thành 0.
 */
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

/**
 * Kiểm tra xem chuỗi số điện thoại sau khi chuẩn hoá có phải là số điện thoại di động Việt Nam hợp lệ (10 chữ số) hay không.
 * Các đầu số hợp lệ: 03x, 05x, 07x, 08x, 09x.
 */
export const isValidVietnamesePhone = (phone?: string | null): boolean => {
  if (!phone) return false;
  const normalized = normalizePhoneNumber(phone);
  return /^0((3[2-9])|(5[689])|(7[06-9])|(8[1-689])|(9[0-46-9]))\d{7}$/.test(normalized);
};
