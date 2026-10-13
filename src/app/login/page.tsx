import type { Metadata } from "next";
import { Clock3 } from "lucide-react";
import { LoginForm } from "./LoginForm";
import { redirect } from "next/navigation";
import { getCurrentUser } from "../../server/api/auth";

interface LoginPageProps {
  searchParams: Promise<{
    reason?: string | string[];
  }>;
}

export const metadata: Metadata = { title: "Entrar | Chrono" };

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getCurrentUser();
  if (session.ok) redirect("/");
  const params = await searchParams;
  const expired = session.status === 401 && (session.code !== "NO_SESSION" || params.reason === "expired");
  const notice = expired
    ? "Sua sessão expirou. Entre novamente para continuar."
    : session.status !== 401
      ? "Não foi possível verificar sua sessão. O serviço está indisponível no momento."
      : undefined;
  return (
    <main className="flex min-h-dvh flex-col px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto my-auto w-full max-w-100 space-y-8">
        <div className="flex items-center justify-center gap-2 text-primary">
          <Clock3 aria-hidden="true" className="size-6" />
          <span className="text-xl font-semibold tracking-tight">Chrono</span>
        </div>
        <section aria-labelledby="login-title" className="rounded-surface border border-border bg-surface p-4 sm:p-6">
          <header className="mb-6 space-y-2">
            <h1 id="login-title" className="text-2xl font-semibold leading-8">Seu tempo, organizado.</h1>
            <p className="text-base leading-6 text-text-secondary">Entre para cuidar dos seus eventos e tarefas.</p>
          </header>
          <LoginForm notice={notice} />
        </section>
      </div>
    </main>
  );
}
