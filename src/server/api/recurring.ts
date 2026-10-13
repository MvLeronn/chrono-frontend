import "server-only";
import { parseCalendarDate } from "../../lib/calendar-date";
import { isLocalTime } from "../../lib/event-input";
import { invalidResponse, isRecord, requestApi } from "./request";
import type { CreateRecurringInput, RecurringEventListResponse, RecurringEventResponse } from "../../models/recurring";
import type { ApiResult } from "./types";

const uuid = (value: unknown): value is string => typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
const date = (value: unknown): value is string => typeof value === "string" && parseCalendarDate(value) !== null;
const time = (value: unknown): value is string | null => value === null || typeof value === "string" && isLocalTime(value);
const instant = (value: unknown): value is string => typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value) && Number.isFinite(Date.parse(value));
const integer = (value: unknown, min: number, max: number): value is number => typeof value === "number" && Number.isSafeInteger(value) && value >= min && value <= max;

function isRecurring(value: unknown): value is RecurringEventResponse {
  if (!isRecord(value) || !uuid(value.id) || !uuid(value.userId) || !uuid(value.seriesId) || !(value.previousId === null || uuid(value.previousId))) return false;
  if (typeof value.title !== "string" || !value.title.trim() || value.title.length > 200 || !(value.description === null || typeof value.description === "string" && value.description.length <= 10000)) return false;
  if (value.type !== "TASK" && value.type !== "EVENT") return false;
  if (typeof value.frequency !== "string" || !["DAILY", "WEEKLY", "MONTHLY", "YEARLY"].includes(value.frequency) || !integer(value.interval, 1, 10000)) return false;
  if (!date(value.startDate) || !date(value.effectiveFrom) || !(value.effectiveUntil === null || date(value.effectiveUntil))) return false;
  if (!(value.until === null || date(value.until) && value.until >= value.startDate) || !(value.count === null || integer(value.count, 1, 1000000)) || value.until !== null && value.count !== null) return false;
  if (!time(value.startTime) || !time(value.endTime) || value.endTime !== null && (value.startTime === null || value.endTime <= value.startTime)) return false;
  return value.invalidDatePolicy === "LAST_VALID_DAY" && instant(value.createdAt) && instant(value.updatedAt);
}

export async function listRecurring(page: number, limit: number): Promise<ApiResult<RecurringEventListResponse>> {
  if (!integer(page, 1, 100000) || !integer(limit, 1, 100)) return { ok: false, status: 400, code: "INVALID_PAGINATION", message: "Paginação inválida." };
  const result = await requestApi({ path: "recurring-list", page, limit });
  if (!result.ok) return result;
  const data = result.data;
  if (result.status !== 200 || !isRecord(data) || data.page !== page || data.limit !== limit || !integer(data.total, 0, Number.MAX_SAFE_INTEGER) || !Array.isArray(data.items) || data.items.length > limit || !data.items.every(isRecurring) || new Set(data.items.map((item) => item.id)).size !== data.items.length) return invalidResponse(result.status);
  return { ok: true, status: 200, data: { items: data.items, total: data.total, page, limit } };
}

export async function getRecurring(id: string): Promise<ApiResult<RecurringEventResponse>> {
  if (!uuid(id)) return { ok: false, status: 404, code: "NOT_FOUND", message: "Recorrência não encontrada." };
  const result = await requestApi({ path: "recurring-detail", id });
  if (!result.ok) return result;
  if (result.status !== 200 || !isRecurring(result.data) || result.data.id !== id) return invalidResponse(result.status);
  return { ok: true, status: 200, data: result.data };
}

export async function createRecurring(input: CreateRecurringInput): Promise<ApiResult<RecurringEventResponse>> {
  const result = await requestApi({ path: "recurring-create", input });
  if (!result.ok) return result;
  if (result.status !== 201 || !isRecurring(result.data) || result.data.previousId !== null || result.data.effectiveFrom !== input.startDate || result.data.effectiveUntil !== null) return invalidResponse(result.status);
  return { ok: true, status: 201, data: result.data };
}
