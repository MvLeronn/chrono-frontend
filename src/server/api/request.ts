import "server-only";
import { getApiBaseUrl } from "../env";
import { readSessionToken } from "../auth/session";

export type ApiFailure = {
  ok: false;
  status: number | null;
  code: string;
  message: string;
  details?: unknown;
};

export type ApiResult<T> = { ok: true; status: number; data: T } | ApiFailure;

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function invalidResponse(status: number): ApiFailure {
  return { ok: false, status, code: "INVALID_RESPONSE", message: "O serviço retornou uma resposta inesperada. Tente novamente." };
}

// Paths and payloads are selected by server wrappers, never by the browser.
type ApiRequest =
  | { path: "auth/login"; password: string }
  | { path: "auth/me" }
  | { path: "calendar"; from: string; to: string };

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
  if (isLogin) headers.set("Content-Type", "application/json");
  const signal = AbortSignal.timeout(10_000);
  try {
    const url = new URL(request.path, base);
    if (request.path === "calendar") {
      url.searchParams.set("from", request.from);
      url.searchParams.set("to", request.to);
    }
    const response = await fetch(url, {
      method: isLogin ? "POST" : "GET",
      headers,
      body: isLogin ? JSON.stringify({ password: request.password }) : undefined,
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
