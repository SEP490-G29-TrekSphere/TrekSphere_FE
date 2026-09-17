export type MarkdownActionType = 'bold' | 'italic' | 'list' | 'link';

export interface MarkdownActionResult {
  next: string;
  selectionStart: number;
  selectionEnd: number;
}

const PLACEHOLDER_TEXT = 'văn bản';
const PLACEHOLDER_URL = 'url';

function wrapSelection(
  value: string,
  start: number,
  end: number,
  marker: string
): MarkdownActionResult {
  const selected = value.slice(start, end) || PLACEHOLDER_TEXT;
  const next = value.slice(0, start) + marker + selected + marker + value.slice(end);
  return {
    next,
    selectionStart: start + marker.length,
    selectionEnd: start + marker.length + selected.length,
  };
}

function prefixLines(value: string, start: number, end: number): MarkdownActionResult {
  // Mở rộng vùng chọn ra trọn các dòng đang chạm tới, để "- " được thêm vào đầu MỖI dòng.
  const lineStart = value.lastIndexOf('\n', start - 1) + 1;
  const nextNewline = value.indexOf('\n', end);
  const lineEnd = nextNewline === -1 ? value.length : nextNewline;

  const block = value.slice(lineStart, lineEnd);
  const prefixedBlock = block
    .split('\n')
    .map((line) => (line.startsWith('- ') ? line : `- ${line}`))
    .join('\n');

  const next = value.slice(0, lineStart) + prefixedBlock + value.slice(lineEnd);
  return {
    next,
    selectionStart: lineStart,
    selectionEnd: lineStart + prefixedBlock.length,
  };
}

function insertLink(value: string, start: number, end: number): MarkdownActionResult {
  const selected = value.slice(start, end) || PLACEHOLDER_TEXT;
  const inserted = `[${selected}](${PLACEHOLDER_URL})`;
  const next = value.slice(0, start) + inserted + value.slice(end);
  // Chọn sẵn phần "url" trong dấu ngoặc đơn để vendor gõ đè ngay, không cần tự bôi đen.
  const urlStart = start + selected.length + 3; // "[" + selected + "]("
  const urlEnd = urlStart + PLACEHOLDER_URL.length;
  return { next, selectionStart: urlStart, selectionEnd: urlEnd };
}

/**
 * Áp dụng thao tác định dạng markdown (Bold/Italic/List/Link) lên chuỗi `value` tại vùng
 * [start, end], trả về chuỗi kết quả + vị trí con trỏ mới để đặt lại `selectionRange` trên
 * textarea. Nếu không có vùng chọn (start === end), chèn placeholder để vendor gõ đè.
 */
export function applyMarkdownAction(
  type: MarkdownActionType,
  value: string,
  start: number,
  end: number
): MarkdownActionResult {
  switch (type) {
    case 'bold':
      return wrapSelection(value, start, end, '**');
    case 'italic':
      return wrapSelection(value, start, end, '_');
    case 'list':
      return prefixLines(value, start, end);
    case 'link':
      return insertLink(value, start, end);
    default:
      return { next: value, selectionStart: start, selectionEnd: end };
  }
}
