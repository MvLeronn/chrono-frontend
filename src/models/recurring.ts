import type { ActivityType } from "./calendar";

export type RecurringListStatus = "active" | "history" | "all";

export type Frequency = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

export interface EndRecurringInput {
  fromDate: string;
}

export interface SplitRecurringInput {
  fromDate: string;
  changes: Partial<CreateRecurringInput>;
}

export interface CreateRecurringInput {
  title: string;
  type: ActivityType;
  description: string | null;
  startDate: string;
  startTime: string | null;
  endTime: string | null;
  frequency: Frequency;
  interval: number;
  until: string | null;
  count: number | null;
}

export interface RecurringEventResponse extends CreateRecurringInput {
  id: string;
  userId: string;
  seriesId: string;
  previousId: string | null;
  effectiveFrom: string;
  effectiveUntil: string | null;
  invalidDatePolicy: "LAST_VALID_DAY";
  createdAt: string;
  updatedAt: string;
}

export interface RecurringEventDetailResponse extends RecurringEventResponse {
  isActive: boolean;
}

export interface RecurringEventListResponse {
  items: RecurringEventResponse[];
  total: number;
  page: number;
  limit: number;
}
