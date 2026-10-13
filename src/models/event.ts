import type { ActivityType, ActivityStatus } from "./calendar";

export interface CreateEventInput {
  title: string;
  type: ActivityType;
  date: string;
  startTime: string | null;
  endTime: string | null;
  description: string | null;
  status: ActivityStatus;
}
