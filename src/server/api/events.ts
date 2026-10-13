import "server-only";
import type { EventResponse } from "../../lib/calendar-types";
import type { CreateEventInput } from "../../lib/event-input";
import { isCalendarItem } from "./calendar";
import { invalidResponse, requestApi, type ApiResult } from "./request";

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
