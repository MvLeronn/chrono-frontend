import { redirect } from "next/navigation";
import { getCurrentUser } from "../../server/api/auth";
import { PrivateShell } from "../../components/PrivateShell";
import type { ReactNode } from "react";

interface ActivitiesLayoutProps {
  children: ReactNode;
}

export default async function ActivitiesLayout({ children }: ActivitiesLayoutProps) {
  const session = await getCurrentUser();
  if (!session.ok && session.status === 401) redirect(session.code === "NO_SESSION" ? "/login" : "/login?reason=expired");
  if (!session.ok) return <main className="mx-auto max-w-xl space-y-4 p-6"><h1 className="text-2xl font-semibold">Não foi possível verificar seu acesso</h1><p role="alert">O serviço está indisponível. Tente novamente em instantes.</p><a href="" className="inline-flex min-h-11 items-center text-primary underline">Tentar novamente</a></main>;
  return <PrivateShell>{children}</PrivateShell>;
}
