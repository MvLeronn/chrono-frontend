import "server-only";
import { isLocalTime } from "../../lib/event-input";
import { invalidResponse, isRecord, requestApi } from "./request";
import type { CreateTemplateInput, TemplateListResponse, TemplateResponse } from "../../models/template";
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
