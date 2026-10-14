export interface EventDraft {
  title: string;
  type: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  status: string;
}

export type EventFormErrors = Partial<Record<keyof EventDraft, string>>;

export interface EventFormState {
  success?: boolean;
  errors?: EventFormErrors;
  message?: string;
  uncertain?: boolean;
  expired?: boolean;
}
