export type DateOnly = string;
export type LocalTime = string;
export type ActivityType = "EVENT" | "TASK";
export type ActivityStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELED";
export type CalendarRange = { from: DateOnly; to: DateOnly };
type ResolvedActivityFields = {
  type: ActivityType;
  title: string;
  description: string | null;
  date: DateOnly;
  startTime: LocalTime | null;
  endTime: LocalTime | null;
  status: ActivityStatus;
  completedAt: string | null;
};
export type EventResponse = ResolvedActivityFields & {
  id: string;
  calendarKey: `event:${string}`;
  source: "EVENT";
  templateApplicationId: string | null;
  createdAt: string;
  updatedAt: string;
};
export type ResolvedOccurrence = ResolvedActivityFields & {
  id: string | null;
  calendarKey: `recurring:${string}:${DateOnly}`;
  source: "RECURRING";
  recurringEventId: string;
  seriesId: string;
  occurrenceDate: DateOnly;
};
export type CalendarItem = EventResponse | ResolvedOccurrence;
export type CalendarResponse = CalendarRange & { timezone: string; items: CalendarItem[] };
