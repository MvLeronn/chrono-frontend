import "server-only";
import { isValidRange, parseCalendarDate } from "../../lib/calendar-date";
import { invalidResponse, isRecord, requestApi } from "./request";
import type { CalendarRange, CalendarItem, CalendarResponse } from "../../models/calendar";
import type { ApiResult } from "./types";

const isUuid = (value: unknown): value is string => typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
const isDate = (value: unknown): value is string => typeof value === "string" && parseCalendarDate(value) !== null;
const isTime = (value: unknown): value is string | null => value === null || (typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value));
const isInstant = (value: unknown): value is string => typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value) && Number.isFinite(Date.parse(value));

export function isCalendarItem(value: unknown): value is CalendarItem {
  if (!isRecord(value) || !isDate(value.date) || typeof value.title !== "string" || !value.title.trim() || value.title.length > 200 || !(value.description === null || typeof value.description === "string") || !isTime(value.startTime) || !isTime(value.endTime)) return false;
  if (value.type !== "EVENT" && value.type !== "TASK") return false;
  if (typeof value.status !== "string" || !["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELED"].includes(value.status)) return false;
  if (!(value.completedAt === null || isInstant(value.completedAt))) return false;
  if (value.endTime !== null && (value.startTime === null || value.endTime <= value.startTime)) return false;
  if (value.source === "EVENT") return isUuid(value.id) && value.calendarKey === `event:${value.id}` && (value.templateApplicationId === null || isUuid(value.templateApplicationId)) && isInstant(value.createdAt) && isInstant(value.updatedAt);
  return value.source === "RECURRING" && (value.id === null || isUuid(value.id)) && isUuid(value.recurringEventId) && isUuid(value.seriesId) && isDate(value.occurrenceDate) && value.calendarKey === `recurring:${value.seriesId}:${value.occurrenceDate}`;
}

export async function getCalendar(range: CalendarRange): Promise<ApiResult<CalendarResponse>> {
  if (!isValidRange(range)) return { ok: false, status: 400, code: "INVALID_RANGE", message: "Escolha um período de 1 a 366 dias." };
  const result = await requestApi({ path: "calendar", from: range.from, to: range.to });
  if (!result.ok) return result;
  const data = result.data;
  if (result.status !== 200 || !isRecord(data) || data.from !== range.from || data.to !== range.to || typeof data.timezone !== "string" || !data.timezone || !Array.isArray(data.items) || !data.items.every(isCalendarItem)) return invalidResponse(result.status);
  try { new Intl.DateTimeFormat("pt-BR", { timeZone: data.timezone }); } catch { return invalidResponse(result.status); }
  const items = data.items;
  if (items.some((item) => item.date < range.from || item.date > range.to) || new Set(items.map((item) => item.calendarKey)).size !== items.length) return invalidResponse(result.status);
  items.sort((a, b) => a.date.localeCompare(b.date) || (a.startTime ?? "").localeCompare(b.startTime ?? "") || a.calendarKey.localeCompare(b.calendarKey));
  return { ok: true, status: 200, data: { from: range.from, to: range.to, timezone: data.timezone, items } };
}
