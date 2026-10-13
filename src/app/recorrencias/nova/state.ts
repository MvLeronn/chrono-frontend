export interface RecurringDraft {
  title: string;
  type: string;
  description: string;
  startDate: string;
  startTime: string;
  endTime: string;
  frequency: string;
  interval: string;
  termination: string;
  until: string;
  count: string;
}

export type RecurringFormErrors = Partial<Record<keyof RecurringDraft, string>>;

export interface RecurringFormState {
  errors?: RecurringFormErrors;
  message?: string;
  expired?: boolean;
  uncertain?: boolean;
}
