import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "../server/api/auth";
import { logoutAction } from "./actions/session";
import { Button } from "../components/ui/Button";

export default async function HomePage() {
  const session = await getCurrentUser();
  if (!session.ok && session.status === 401) {
    redirect(session.code === "NO_SESSION" ? "/login" : "/login?reason=expired");
  }

  return (
    <main className="flex min-h-dvh flex-col px-4 py-8 sm:px-6">
      <section className="mx-auto my-auto w-full max-w-100 space-y-6 rounded-surface border border-border bg-surface p-4 sm:p-6">
        <p className="text-sm font-semibold text-primary">Chrono</p>
        {session.ok ? (
          <>
            <h1 className="text-2xl font-semibold leading-8">Você entrou no Chrono.</h1>
            <p className="text-text-secondary">Seu acesso foi confirmado. O calendário ainda está em preparação.</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold leading-8">Não foi possível verificar seu acesso.</h1>
            <p role="alert" className="text-text-secondary">O serviço está indisponível no momento. Tente novamente em instantes.</p>
            <Link href="/" prefetch={false} className="inline-flex min-h-11 items-center rounded-control font-semibold text-primary underline underline-offset-4">Tentar novamente</Link>
          </>
        )}
        <form action={logoutAction}>
          <Button type="submit" variant="secondary" className="w-full">Sair</Button>
        </form>
      </section>
    </main>
  );
}
