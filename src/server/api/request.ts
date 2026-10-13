import "server-only";
import { getApiBaseUrl } from "../env";
import { readSessionToken } from "../auth/session";
import type { ApiFailure, ApiResult, ApiRequest } from "./types";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function invalidResponse(status: number): ApiFailure {
  return { ok: false, status, code: "INVALID_RESPONSE", message: "O serviço retornou uma resposta inesperada. Tente novamente." };
}

export async function requestApi(request: ApiRequest): Promise<ApiResult<unknown>> {
  const headers = new Headers({ Accept: "application/json" });
  const isLogin = request.path === "auth/login";
  if (!isLogin) {
    const token = await readSessionToken();
    if (!token) return { ok: false, status: 401, code: "NO_SESSION", message: "Entre para continuar." };
    if (!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)) {
      return { ok: false, status: 401, code: "UNAUTHORIZED", message: "Sua sessão expirou. Entre novamente." };
    }
    headers.set("Authorization", `Bearer ${token}`);
  }
  const base = getApiBaseUrl();
  if (!base) return { ok: false, status: null, code: "CONFIGURATION_ERROR", message: "O serviço de acesso não está configurado. Tente novamente mais tarde." };
  const body = isLogin ? { password: request.password } : "input" in request ? request.input : undefined;
  if (body) headers.set("Content-Type", "application/json");
  const signal = AbortSignal.timeout(10_000);
  try {
    const path = "occurrenceDate" in request
      ? `recurring-events/${encodeURIComponent(request.id)}/occurrences/${encodeURIComponent(request.occurrenceDate)}${request.path === "occurrence-reset" ? "/state" : ""}`
      : request.path === "recurring-end" ? `recurring-events/${encodeURIComponent(request.id)}/end`
      : request.path === "recurring-split" ? `recurring-events/${encodeURIComponent(request.id)}/split`
      : request.path === "recurring-detail" ? `recurring-events/${encodeURIComponent(request.id)}`
      : request.path === "recurring-list" || request.path === "recurring-create" ? "recurring-events"
      : request.path === "template-apply" ? `week-templates/${encodeURIComponent(request.id)}/apply`
      : request.path === "template-detail" || request.path === "template-update" || request.path === "template-archive" ? `week-templates/${encodeURIComponent(request.id)}`
      : request.path === "template-list" || request.path === "template-create" ? "week-templates"
      : "id" in request ? `events/${encodeURIComponent(request.id)}` : request.path;
    const url = new URL(path, base);
    if (request.path === "calendar") {
      url.searchParams.set("from", request.from);
      url.searchParams.set("to", request.to);
    }
    if (request.path === "recurring-list" || request.path === "template-list") {
      url.searchParams.set("page", String(request.page));
      url.searchParams.set("limit", String(request.limit));
    }
    if (request.path === "recurring-list") url.searchParams.set("status", request.status);
    const response = await fetch(url, {
      method: request.path === "event-update" || request.path === "occurrence-update" || request.path === "template-update" ? "PATCH" : request.path === "event-delete" || request.path === "occurrence-reset" || request.path === "template-archive" ? "DELETE" : body ? "POST" : "GET",
      headers,
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
      redirect: "error",
      signal,
    });
    if (response.status === 204) return { ok: true, status: 204, data: null };
    const text = await response.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      return invalidResponse(response.status);
    }
    if (!response.ok) {
      if (!isRecord(data) || !isRecord(data.error) || typeof data.error.code !== "string" || typeof data.error.message !== "string") {
        return invalidResponse(response.status);
      }
      return { ok: false, status: response.status, code: data.error.code, message: data.error.message, details: data.error.details };
    }
    return { ok: true, status: response.status, data };
  } catch {
    return {
      ok: false,
      status: null,
      code: signal.aborted ? "TIMEOUT" : "NETWORK_ERROR",
      message: signal.aborted ? "O serviço demorou para responder. Tente novamente." : "Não foi possível conectar ao serviço. Tente novamente em instantes.",
    };
  }
}
