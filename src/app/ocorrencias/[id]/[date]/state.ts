import type { EventDraft, EventFormErrors } from "../../../atividades/nova/state";

export type OverrideMode = "keep" | "custom" | "inherit";
export type OverrideField = "title" | "type" | "description" | "time";
export type OccurrenceModes = Record<OverrideField, OverrideMode>;
export type OccurrenceDraft = EventDraft;

export interface OccurrenceFormState {
  success?: boolean;
  errors?: EventFormErrors;
  message?: string;
  expired?: boolean;
  uncertain?: boolean;
}
