import type { CalendarItem } from "../models/calendar";

export interface PositionedActivity {
  item: CalendarItem;
  start: number;
  visualEnd: number;
  column: number;
  columns: number;
}

function minutes(time: string): number {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

// Minimum visual height is for readability only; it never changes an activity's endTime.
export function layoutDayActivities(items: CalendarItem[]): PositionedActivity[] {
  const timed = items.filter((item) => item.startTime !== null).map((item) => {
    const start = minutes(item.startTime!);
    return { item, start, visualEnd: Math.max(start + 45, item.endTime ? minutes(item.endTime) : start) };
  }).sort((a, b) => a.start - b.start || a.item.calendarKey.localeCompare(b.item.calendarKey));
  const positioned: PositionedActivity[] = [];
  let group: PositionedActivity[] = [];
  let columnEnds: number[] = [];
  let groupEnd = -1;
  const flush = () => {
    for (const entry of group) entry.columns = columnEnds.length;
    positioned.push(...group);
    group = [];
    columnEnds = [];
  };
  for (const entry of timed) {
    if (entry.start >= groupEnd) flush();
    let column = columnEnds.findIndex((end) => end <= entry.start);
    if (column === -1) column = columnEnds.length;
    columnEnds[column] = entry.visualEnd;
    group.push({ ...entry, column, columns: 1 });
    groupEnd = Math.max(groupEnd, entry.visualEnd);
  }
  flush();
  return positioned;
}
