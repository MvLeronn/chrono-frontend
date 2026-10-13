import "server-only";
import { cookies } from "next/headers";

const SESSION_COOKIE = "chrono_session";
const options = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function readSessionToken() {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

// Call only from a Server Action, never while rendering a Server Component.
export async function saveSession(token: string, expiresIn: number) {
  (await cookies()).set(SESSION_COOKIE, token, { ...options, maxAge: expiresIn });
}

export async function clearSession() {
  (await cookies()).set(SESSION_COOKIE, "", { ...options, maxAge: 0 });
}
