export interface TemplateItemDraft {
  key: string;
  weekday: string;
  type: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
}

export interface TemplateDraft {
  name: string;
  items: TemplateItemDraft[];
}

export interface TemplateFormState {
  errors?: Record<string, string>;
  message?: string;
  expired?: boolean;
  uncertain?: boolean;
  stale?: boolean;
}
