import type { ActivityStatus, ActivityType } from "./calendar";

export interface UpdateOccurrenceInput {
  scheduledDate?: string;
  status?: ActivityStatus;
  typeOverride?: ActivityType | null;
  titleOverride?: string | null;
  descriptionOverride?: string | null;
  timeOverride?: {
    startTime: string | null;
    endTime: string | null;
  } | null;
}
