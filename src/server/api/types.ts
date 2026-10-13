import type { CreateEventInput, UpdateEventInput } from "../../models/event";

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
};
