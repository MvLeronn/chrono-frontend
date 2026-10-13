import "server-only";
import { isCalendarItem } from "./calendar";
import { invalidResponse, requestApi } from "./request";
import type { EventResponse } from "../../models/calendar";
import type { CreateEventInput, UpdateEventInput } from "../../models/event";
import type { ApiResult } from "./types";

export async function createEvent(input: CreateEventInput): Promise<ApiResult<EventResponse>> {
  const result = await requestApi({ path: "events", input });
  if (!result.ok) return result;
  if (result.status !== 201 || !isCalendarItem(result.data) || result.data.source !== "EVENT") return invalidResponse(result.status);
  return { ok: true, status: 201, data: result.data };
}

export async function getEvent(id: string): Promise<ApiResult<EventResponse>> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return { ok: false, status: 404, code: "NOT_FOUND", message: "Atividade não encontrada." };
  const result = await requestApi({ path: "event-detail", id });
  if (!result.ok) return result;
  if (result.status !== 200 || !isCalendarItem(result.data) || result.data.source !== "EVENT" || result.data.id !== id) return invalidResponse(result.status);
  return { ok: true, status: 200, data: result.data };
}

export async function updateEvent(id: string, input: UpdateEventInput): Promise<ApiResult<EventResponse>> {
  const result = await requestApi({ path: "event-update", id, input });
  if (!result.ok) return result;
  if (result.status !== 200 || !isCalendarItem(result.data) || result.data.source !== "EVENT" || result.data.id !== id) return invalidResponse(result.status);
  return { ok: true, status: 200, data: result.data };
}

export async function deleteEvent(id: string): Promise<ApiResult<null>> {
  const result = await requestApi({ path: "event-delete", id });
  if (!result.ok) return result;
  if (result.status !== 204) return invalidResponse(result.status);
  return { ok: true, status: 204, data: null };
}
