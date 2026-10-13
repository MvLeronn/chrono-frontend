"use server";

import { redirect } from "next/navigation";
import { authenticate } from "../../server/api/auth";
import { clearSession, saveSession } from "../../server/auth/session";
import { passwordError } from "../../lib/password-validation";
import type { LoginState } from "./state";

export async function loginAction(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const password = formData.get("password");
  const error = passwordError(password);
  if (error || typeof password !== "string") return { passwordError: error ?? "Digite sua senha." };
  const result = await authenticate(password);
  if (!result.ok) {
    if (result.status === 401 && result.code === "INVALID_CREDENTIALS") {
      await clearSession();
      return { passwordError: "Senha incorreta. Confira e tente novamente." };
    }
    if (result.status === 401 && result.code === "UNAUTHORIZED") {
      await clearSession();
      return { message: "Sua sessão expirou. Entre novamente para continuar." };
    }
    if (result.code === "VALIDATION_ERROR") return { passwordError: "Confira a senha informada e tente novamente." };
    // Never return raw upstream errors, the password, or a login response to the client.
    return { message: result.code === "TIMEOUT" ? "O serviço demorou para responder. Tente novamente." : "O serviço de acesso está indisponível. Tente novamente em instantes." };
  }
  await saveSession(result.data.token, result.data.expiresIn);
  redirect("/");
}
