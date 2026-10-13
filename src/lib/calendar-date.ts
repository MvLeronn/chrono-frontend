import type { CalendarRange } from "./calendar-types";

// Civil dates use UTC only for arithmetic and formatting, never as local instants.
export function parseCalendarDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < "0001-01-01" || value > "9999-12-31") return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value ? date : null;
}

export function todayInTimezone(timezone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: string) => parts.find((item) => item.type === type)!.value;
  return `${part("year").padStart(4, "0")}-${part("month")}-${part("day")}`;
}

export function adjacentDate(value: string, offset: number): string | null {
  const date = parseCalendarDate(value);
  if (!date) return null;
  date.setUTCDate(date.getUTCDate() + offset);
  if (date.getUTCFullYear() < 1 || date.getUTCFullYear() > 9999) return null;
  return date.toISOString().slice(0, 10);
}

export function formatCalendarDate(value: string, options: Intl.DateTimeFormatOptions): string {
  const date = parseCalendarDate(value);
  if (!date) return "";
  return new Intl.DateTimeFormat("pt-BR", { ...options, timeZone: "UTC" }).format(date);
}

export function rangeLength(range: CalendarRange): number {
  const from = parseCalendarDate(range.from);
  const to = parseCalendarDate(range.to);
  return from && to ? (to.getTime() - from.getTime()) / 86_400_000 + 1 : 0;
}

export function isValidRange(range: CalendarRange): boolean {
  const length = rangeLength(range);
  return length >= 1 && length <= 366;
}

export function defaultRange(date: string): CalendarRange {
  return { from: date, to: adjacentDate(date, 6) ?? "9999-12-31" };
}

export function shiftRange(range: CalendarRange, direction: -1 | 1): CalendarRange | null {
  const length = rangeLength(range);
  if (direction === -1) {
    const to = adjacentDate(range.from, -1);
    return to ? { from: adjacentDate(to, -(length - 1)) ?? "0001-01-01", to } : null;
  }
  const from = adjacentDate(range.to, 1);
  return from ? { from, to: adjacentDate(from, length - 1) ?? "9999-12-31" } : null;
}

export function calendarHref(range: CalendarRange): string {
  return `/?from=${range.from}&to=${range.to}`;
}

export function monthHref(date: string): string {
  return `/?view=month&date=${date}`;
}

export function adjacentMonth(value: string, direction: -1 | 1): string | null {
  const date = parseCalendarDate(value);
  if (!date) return null;
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + direction);
  if (date.getUTCFullYear() < 1 || date.getUTCFullYear() > 9999) return null;
  return date.toISOString().slice(0, 10);
}

export function monthGrid(value: string): { days: (string | null)[]; range: CalendarRange } {
  const first = `${value.slice(0, 7)}-01`;
  const date = parseCalendarDate(first);
  if (!date) throw new Error("Invalid month");
  const leading = (date.getUTCDay() + 6) % 7;
  date.setUTCMonth(date.getUTCMonth() + 1);
  date.setUTCDate(0);
  const count = date.getUTCDate();
  const length = Math.ceil((leading + count) / 7) * 7;
  const days = Array.from({ length }, (_, index) => adjacentDate(first, index - leading));
  return {
    days,
    range: { from: days.find((day) => day !== null)!, to: days.findLast((day) => day !== null)! },
  };
}
