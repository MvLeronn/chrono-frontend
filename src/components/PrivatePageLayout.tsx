import { redirect } from "next/navigation";
import { getCurrentUser } from "../server/api/auth";
import { PrivateShell } from "./PrivateShell";
import type { ReactNode } from "react";

interface PrivatePageLayoutProps {
  children: ReactNode;
}

export async function PrivatePageLayout({ children }: PrivatePageLayoutProps) {
  const session = await getCurrentUser();
  if (!session.ok && session.status === 401) redirect(session.code === "NO_SESSION" ? "/login" : "/login?reason=expired");
  if (!session.ok) return <main className="mx-auto max-w-xl space-y-4 p-6"><h1 className="text-2xl font-medium tracking-tight">Não foi possível verificar seu acesso</h1><p role="alert">O serviço está indisponível. Tente novamente em instantes.</p><a href="" className="inline-flex min-h-11 items-center text-primary ">Tentar novamente</a></main>;
  return <PrivateShell><div className="min-h-[calc(100dvh-1.5rem)] rounded-surface border border-border bg-surface p-4 sm:p-8">{children}</div></PrivateShell>;
}
