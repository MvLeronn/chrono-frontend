import type { ActivityStatus } from "../../../../models/calendar";

export interface EndRecurringState {
  dateError?: string;
  message?: string;
  expired?: boolean;
  uncertain?: boolean;
  conflicts?: Array<{
    occurrenceDate: string;
    status: ActivityStatus;
  }>;
}
