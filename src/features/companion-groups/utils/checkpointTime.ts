/**
 * BE nhận `plannedStartAt` / `plannedEndAt` của checkpoint dưới dạng
 * `LocalDateTime` ISO (`2026-09-21T08:00:00`), còn form chỉ cho nhập giờ trong
 * ngày. Phần ngày được suy ra từ ngày bắt đầu hành trình + (dayNo - 1) để hai
 * mốc giờ của cùng một checkpoint luôn nằm trên cùng một ngày — BE có so sánh
 * `plannedEndAt` phải sau `plannedStartAt`.
 */

const TIME_PATTERN = /^(\d{1,2}):(\d{2})$/;
const DATE_TIME_PATTERN = /^(?:\d{4}-\d{2}-\d{2}[T ])?(\d{1,2}):(\d{2})/;

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

/** Ngày bắt đầu hành trình cộng thêm (dayNo - 1) ngày, trả về `YYYY-MM-DD`. */
function resolveCheckpointDate(
  journeyStartDate: string | null | undefined,
  dayNo: number | null | undefined
): string {
  const [year, month, day] = (journeyStartDate ?? '').split('-').map(Number);
  const base =
    Number.isFinite(year) && Number.isFinite(month) && Number.isFinite(day)
      ? new Date(year, month - 1, day)
      : new Date();

  const offset = Number.isFinite(dayNo) && (dayNo as number) > 0 ? (dayNo as number) - 1 : 0;
  base.setDate(base.getDate() + offset);

  return `${base.getFullYear()}-${pad(base.getMonth() + 1)}-${pad(base.getDate())}`;
}

/**
 * Ghép giờ người dùng nhập (`8:00`, `08:00`) với ngày tương ứng của chặng thành
 * chuỗi `LocalDateTime` mà BE parse được. Trả `null` khi bỏ trống hoặc sai định dạng.
 */
export function toCheckpointDateTime(
  journeyStartDate: string | null | undefined,
  dayNo: number | null | undefined,
  time: string | null | undefined
): string | null {
  const trimmed = time?.trim();
  if (!trimmed) return null;

  const matched = TIME_PATTERN.exec(trimmed);
  if (!matched) return null;

  const hours = Number(matched[1]);
  const minutes = Number(matched[2]);
  if (hours > 23 || minutes > 59) return null;

  return `${resolveCheckpointDate(journeyStartDate, dayNo)}T${pad(hours)}:${pad(minutes)}:00`;
}

/**
 * Rút `HH:mm` từ giá trị BE trả về để đổ vào input `type="time"` và để hiển thị.
 * Trả chuỗi rỗng khi không đọc được, hợp lệ cho cả input lẫn chỗ hiển thị.
 */
export function formatCheckpointTime(value: string | null | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed) return '';

  const matched = DATE_TIME_PATTERN.exec(trimmed);
  if (!matched) return '';

  return `${pad(Number(matched[1]))}:${matched[2]}`;
}
