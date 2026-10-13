import type { CreateEventInput, UpdateEventInput } from "../../models/event";
import type { ApplyTemplateInput, CreateTemplateInput, UpdateTemplateInput } from "../../models/template";
import type { UpdateOccurrenceInput } from "../../models/occurrence";
import type { CreateRecurringInput, SplitRecurringInput, EndRecurringInput } from "../../models/recurring";

export interface ApiFailure {
  ok: false;
  status: number | null;
  code: string;
  message: string;
  details?: unknown;
}

export type ApiResult<T> = {
  ok: true;
  status: number;
  data: T;
} | ApiFailure;

// Paths and payloads are selected by server wrappers, never by the browser.
export type ApiRequest = {
  path: "auth/login";
  password: string;
} | {
  path: "auth/me";
} | {
  path: "calendar";
  from: string;
  to: string;
} | {
  path: "events";
  input: CreateEventInput;
} | {
  path: "event-detail";
  id: string;
} | {
  path: "event-update";
  id: string;
  input: UpdateEventInput;
} | {
  path: "event-delete";
  id: string;
} | {
  path: "occurrence-detail" | "occurrence-reset";
  id: string;
  occurrenceDate: string;
} | {
  path: "occurrence-update";
  id: string;
  occurrenceDate: string;
  input: UpdateOccurrenceInput;
} | {
  path: "recurring-list";
  page: number;
  limit: number;
} | {
  path: "recurring-create";
  input: CreateRecurringInput;
} | {
  path: "recurring-detail";
  id: string;
} | {
  path: "recurring-split";
  id: string;
  input: SplitRecurringInput;
} | {
  path: "recurring-end";
  id: string;
  input: EndRecurringInput;
} | {
  path: "template-list";
  page: number;
  limit: number;
} | {
  path: "template-detail";
  id: string;
} | {
  path: "template-create";
  input: CreateTemplateInput;
} | {
  path: "template-update";
  id: string;
  input: UpdateTemplateInput;
} | {
  path: "template-apply";
  id: string;
  input: ApplyTemplateInput;
};
