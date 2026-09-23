const TIME_PATTERN = /^(\d{1,2}):(\d{2})$/;
const DATE_TIME_PATTERN = /^(?:\d{4}-\d{2}-\d{2}[T ])?(\d{1,2}):(\d{2})/;

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

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

export function formatCheckpointTime(value: string | null | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed) return '';

  const matched = DATE_TIME_PATTERN.exec(trimmed);
  if (!matched) return '';

  return `${pad(Number(matched[1]))}:${matched[2]}`;
}
