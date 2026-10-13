import "server-only";
import { parseCalendarDate } from "../../lib/calendar-date";
import { isCalendarItem } from "./calendar";
import { invalidResponse, requestApi } from "./request";
import type { ResolvedOccurrence } from "../../models/calendar";
import type { UpdateOccurrenceInput } from "../../models/occurrence";
import type { ApiRequest, ApiResult } from "./types";

async function requestOccurrence(request: Extract<ApiRequest, { occurrenceDate: string }>): Promise<ApiResult<ResolvedOccurrence>> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(request.id) || !parseCalendarDate(request.occurrenceDate)) {
    return { ok: false, status: 404, code: "OCCURRENCE_NOT_FOUND", message: "Ocorrência não encontrada." };
  }
  const result = await requestApi(request);
  if (!result.ok) return result;
  const item = result.data;
  if (result.status !== 200 || !isCalendarItem(item) || item.source !== "RECURRING" || item.recurringEventId !== request.id || item.occurrenceDate !== request.occurrenceDate) return invalidResponse(result.status);
  if (request.path === "occurrence-update" && item.id === null) return invalidResponse(result.status);
  if (request.path === "occurrence-reset" && (item.id !== null || item.date !== request.occurrenceDate || item.status !== "PENDING" || item.completedAt !== null)) return invalidResponse(result.status);
  return { ok: true, status: 200, data: item };
}

export function getOccurrence(id: string, occurrenceDate: string) {
  return requestOccurrence({ path: "occurrence-detail", id, occurrenceDate });
}

export function updateOccurrence(id: string, occurrenceDate: string, input: UpdateOccurrenceInput) {
  return requestOccurrence({ path: "occurrence-update", id, occurrenceDate, input });
}

export function resetOccurrence(id: string, occurrenceDate: string) {
  return requestOccurrence({ path: "occurrence-reset", id, occurrenceDate });
}
