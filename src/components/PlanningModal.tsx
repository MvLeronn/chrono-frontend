import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "../server/api/auth";
import { RouteModal } from "./ui/RouteModal";

export async function PlanningModal({ children, closeHref }: { children: ReactNode; closeHref: string }) {
  const session = await getCurrentUser();
  if (!session.ok && session.status === 401) redirect(session.code === "NO_SESSION" ? "/login" : "/login?reason=expired");
  return <RouteModal closeHref={closeHref}>{session.ok ? children : <div className="space-y-4"><h1 className="text-2xl font-medium">Não foi possível verificar seu acesso</h1><p role="alert">O serviço está indisponível. Feche e tente novamente em instantes.</p></div>}</RouteModal>;
}
