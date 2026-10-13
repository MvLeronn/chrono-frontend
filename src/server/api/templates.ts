import "server-only";
import { isLocalTime } from "../../lib/event-input";
import { templateWeekEnd } from "../../lib/template-apply";
import { isCalendarItem } from "./calendar";
import { invalidResponse, isRecord, requestApi } from "./request";
import type { ApplyTemplateResponse, CreateTemplateInput, TemplateListResponse, TemplateResponse, UpdateTemplateInput } from "../../models/template";
import type { EventResponse } from "../../models/calendar";
import type { ApiResult } from "./types";

const uuid = (value: unknown): value is string => typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
const integer = (value: unknown, min: number, max: number): value is number => typeof value === "number" && Number.isSafeInteger(value) && value >= min && value <= max;
const instant = (value: unknown) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value) && Number.isFinite(Date.parse(value));
const time = (value: unknown): value is string | null => value === null || typeof value === "string" && isLocalTime(value);

function isTemplate(value: unknown): value is TemplateResponse {
  if (!isRecord(value) || !uuid(value.id) || !uuid(value.userId) || typeof value.name !== "string" || !value.name.trim() || value.name.length > 100) return false;
  if (value.archivedAt !== null || !instant(value.createdAt) || !instant(value.updatedAt) || !Array.isArray(value.items) || value.items.length > 200) return false;
  return value.items.every((item: unknown) => {
    if (!isRecord(item) || !uuid(item.id) || item.templateId !== value.id || !integer(item.weekday, 1, 7)) return false;
    if (item.type !== "TASK" && item.type !== "EVENT") return false;
    if (typeof item.title !== "string" || !item.title.trim() || item.title.length > 200 || !(item.description === null || typeof item.description === "string" && item.description.length <= 10000)) return false;
    return time(item.startTime) && time(item.endTime) && (item.endTime === null || item.startTime !== null && item.endTime > item.startTime);
  }) && new Set(value.items.map((item) => item.id)).size === value.items.length;
}

export async function listTemplates(page: number, limit: number): Promise<ApiResult<TemplateListResponse>> {
  if (!integer(page, 1, 100000) || !integer(limit, 1, 100)) return { ok: false, status: 400, code: "INVALID_PAGINATION", message: "Paginação inválida." };
  const result = await requestApi({ path: "template-list", page, limit });
  if (!result.ok) return result;
  const data = result.data;
  if (result.status !== 200 || !isRecord(data) || data.page !== page || data.limit !== limit || !integer(data.total, 0, Number.MAX_SAFE_INTEGER) || !Array.isArray(data.items) || data.items.length > limit || !data.items.every(isTemplate) || new Set(data.items.map((item) => item.id)).size !== data.items.length) return invalidResponse(result.status);
  return { ok: true, status: 200, data: { items: data.items, total: data.total, page, limit } };
}

export async function getTemplate(id: string): Promise<ApiResult<TemplateResponse>> {
  if (!uuid(id)) return { ok: false, status: 404, code: "NOT_FOUND", message: "Modelo não encontrado." };
  const result = await requestApi({ path: "template-detail", id });
  if (!result.ok) return result;
  if (result.status !== 200 || !isTemplate(result.data) || result.data.id !== id) return invalidResponse(result.status);
  return { ok: true, status: 200, data: result.data };
}

export async function createTemplate(input: CreateTemplateInput): Promise<ApiResult<TemplateResponse>> {
  const result = await requestApi({ path: "template-create", input });
  if (!result.ok) return result;
  if (result.status !== 201 || !isTemplate(result.data)) return invalidResponse(result.status);
  return { ok: true, status: 201, data: result.data };
}

export async function updateTemplate(id: string, input: UpdateTemplateInput): Promise<ApiResult<TemplateResponse>> {
  const result = await requestApi({ path: "template-update", id, input });
  if (!result.ok) return result;
  if (result.status !== 200 || !isTemplate(result.data) || result.data.id !== id) return invalidResponse(result.status);
  return { ok: true, status: 200, data: result.data };
}

export async function archiveTemplate(id: string): Promise<ApiResult<null>> {
  const result = await requestApi({ path: "template-archive", id });
  if (!result.ok) return result;
  if (result.status !== 204) return invalidResponse(result.status);
  return { ok: true, status: 204, data: null };
}

export async function applyTemplate(id: string, weekStart: string): Promise<ApiResult<ApplyTemplateResponse>> {
  const weekEnd = templateWeekEnd(weekStart);
  if (!weekEnd) return { ok: false, status: 400, code: "INVALID_WEEK_START", message: "Escolha uma segunda-feira cuja semana termine até 31/12/9999." };
  const result = await requestApi({ path: "template-apply", id, input: { weekStart } });
  if (!result.ok) return result;
  const data = result.data;
  if (!isRecord(data) || !uuid(data.id) || data.weekStart !== weekStart || !(result.status === 201 && data.alreadyApplied === false || result.status === 200 && data.alreadyApplied === true) || !Array.isArray(data.events)) return invalidResponse(result.status);
  const events = data.events;
  if (!events.every((event: unknown): event is EventResponse => isCalendarItem(event) && event.source === "EVENT" && event.templateApplicationId === data.id && (event.status === "COMPLETED") === (event.completedAt !== null))) return invalidResponse(result.status);
  if (new Set(events.map((event) => event.id)).size !== events.length) return invalidResponse(result.status);
  if (!data.alreadyApplied && events.some((event) => event.status !== "PENDING" || event.date < weekStart || event.date > weekEnd)) return invalidResponse(result.status);
  events.sort((a, b) => a.date.localeCompare(b.date) || (a.startTime ?? "").localeCompare(b.startTime ?? "") || a.id.localeCompare(b.id));
  return { ok: true, status: result.status, data: { id: data.id, weekStart, alreadyApplied: data.alreadyApplied, events } };
}
