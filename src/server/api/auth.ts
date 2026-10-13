import "server-only";
import { invalidResponse, isRecord, requestApi } from "./request";
import type { PublicUser, LoginResponse } from "../../models/auth";
import type { ApiResult } from "./types";

function isUser(value: unknown): value is PublicUser {
  if (!isRecord(value) || typeof value.id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value.id) || typeof value.timezone !== "string" || !value.timezone) return false;
  try {
    new Intl.DateTimeFormat("pt-BR", { timeZone: value.timezone });
    return true;
  } catch {
    return false;
  }
}

export async function authenticate(password: string): Promise<ApiResult<LoginResponse>> {
  const result = await requestApi({ path: "auth/login", password });
  if (!result.ok) return result;
  const value = result.data;
  if (result.status !== 200 || !isRecord(value) || typeof value.token !== "string" || value.token.length > 3800 || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(value.token) || value.tokenType !== "Bearer" || typeof value.expiresIn !== "number" || !Number.isSafeInteger(value.expiresIn) || value.expiresIn < 60 || value.expiresIn > 2592000 || !isUser(value.user)) return invalidResponse(result.status);
  return { ok: true, status: 200, data: { token: value.token, tokenType: "Bearer", expiresIn: value.expiresIn, user: { id: value.user.id, timezone: value.user.timezone } } };
}

export async function getCurrentUser(): Promise<ApiResult<PublicUser>> {
  const result = await requestApi({ path: "auth/me" });
  if (!result.ok) return result;
  if (result.status !== 200 || !isUser(result.data)) return invalidResponse(result.status);
  return { ok: true, status: 200, data: { id: result.data.id, timezone: result.data.timezone } };
}
