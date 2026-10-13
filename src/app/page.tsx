import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "../server/api/auth";
import { logoutAction } from "./actions/session";
import { Button } from "../components/ui/Button";
import { PrivateShell } from "../components/PrivateShell";
import { Suspense } from "react";
import { Agenda } from "../components/calendar/Agenda";
import { AgendaLoading } from "../components/calendar/AgendaLoading";
import { CalendarToolbar } from "../components/calendar/CalendarToolbar";
import { defaultRange, formatCalendarDate, isValidRange, parseCalendarDate, todayInTimezone } from "../lib/calendar-date";

export default async function HomePage({ searchParams }: { searchParams: Promise<{ date?: string | string[]; from?: string | string[]; to?: string | string[] }> }) {
  const session = await getCurrentUser();
  if (!session.ok && session.status === 401) {
    redirect(session.code === "NO_SESSION" ? "/login" : "/login?reason=expired");
  }

  if (session.ok) {
    const params = await searchParams;
    const today = todayInTimezone(session.data.timezone);
    const legacyDate = typeof params.date === "string" && parseCalendarDate(params.date) ? params.date : today;
    const candidate = typeof params.from === "string" && typeof params.to === "string" ? { from: params.from, to: params.to } : null;
    const hasRange = params.from !== undefined || params.to !== undefined;
    const invalidRange = hasRange ? !candidate || !isValidRange(candidate) : params.date !== undefined && legacyDate === today && params.date !== today;
    const range = candidate && isValidRange(candidate) ? candidate : defaultRange(legacyDate);

    return (
      <PrivateShell>
        <header className="mb-6 space-y-1">
          <h1 id="calendar-title" className="text-2xl font-semibold leading-8">Calendário</h1>
          <p className="text-text-secondary">Agenda de eventos e tarefas.</p>
        </header>
        <section aria-labelledby="calendar-title" className="overflow-hidden rounded-surface border border-border bg-surface">
          <CalendarToolbar range={range} today={today} />
          {invalidRange ? (
            <p role="alert" className="px-4 py-8 text-sm text-error sm:px-6">Período inválido. Escolha datas entre 0001 e 9999, com o fim igual ou posterior ao início e no máximo 366 dias. Ajuste os campos acima para consultar a agenda.</p>
          ) : (
            <>
              <p className="border-b border-border px-4 py-4 text-sm font-semibold tabular-nums sm:px-6">{formatCalendarDate(range.from, { day: "numeric", month: "long", year: "numeric" })} a {formatCalendarDate(range.to, { day: "numeric", month: "long", year: "numeric" })}</p>
              <Suspense key={`${range.from}:${range.to}`} fallback={<AgendaLoading />}><Agenda range={range} today={today} /></Suspense>
            </>
          )}
        </section>
      </PrivateShell>
    );
  }

  return (
    <main className="flex min-h-dvh flex-col px-4 py-8 sm:px-6">
      <section className="mx-auto my-auto w-full max-w-100 space-y-6 rounded-surface border border-border bg-surface p-4 sm:p-6">
        <p className="text-sm font-semibold text-primary">Chrono</p>
        <h1 className="text-2xl font-semibold leading-8">Não foi possível verificar seu acesso.</h1>
        <p role="alert" className="text-text-secondary">O serviço está indisponível no momento. Tente novamente em instantes.</p>
        <Link href="/" prefetch={false} className="inline-flex min-h-11 items-center rounded-control font-semibold text-primary underline underline-offset-4">Tentar novamente</Link>
        <form action={logoutAction}>
          <Button type="submit" variant="secondary" className="w-full">Sair</Button>
        </form>
      </section>
    </main>
  );
}
