import { adjacentDate, parseCalendarDate } from "./calendar-date";

export function templateWeekEnd(weekStart: string): string | null {
  const date = parseCalendarDate(weekStart);
  return date?.getUTCDay() === 1 ? adjacentDate(weekStart, 6) : null;
}
