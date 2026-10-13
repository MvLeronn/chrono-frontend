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
import { MonthToolbar } from "../components/calendar/MonthToolbar";
import { MonthView } from "../components/calendar/MonthView";
import { calendarHref, defaultRange, formatCalendarDate, isValidRange, monthHref, parseCalendarDate, todayInTimezone } from "../lib/calendar-date";

export default async function HomePage({ searchParams }: { searchParams: Promise<{ view?: string | string[]; date?: string | string[]; from?: string | string[]; to?: string | string[] }> }) {
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
    const isMonth = params.view === "month";
    const invalidMonthDate = params.date !== undefined && !(typeof params.date === "string" && parseCalendarDate(params.date));
    const viewLinkClass = "inline-flex min-h-11 items-center justify-center rounded-control px-4 text-sm font-semibold";

    return (
      <PrivateShell>
        <header className="mb-6 space-y-1">
          <h1 id="calendar-title" className="text-2xl font-semibold leading-8">Calendário</h1>
          <p className="text-text-secondary">Seus eventos e tarefas.</p>
        </header>
        <nav aria-label="Visualização do calendário" className="mb-4 flex gap-2">
          <Link href={calendarHref(isMonth ? defaultRange(legacyDate) : range)} prefetch={false} aria-current={!isMonth ? "page" : undefined} className={`${viewLinkClass} ${!isMonth ? "bg-primary text-text-on-primary" : "border border-text-secondary bg-surface hover:bg-background"}`}>Agenda</Link>
          <Link href={monthHref(isMonth ? legacyDate : range.from)} prefetch={false} aria-current={isMonth ? "page" : undefined} className={`${viewLinkClass} ${isMonth ? "bg-primary text-text-on-primary" : "border border-text-secondary bg-surface hover:bg-background"}`}>Mês</Link>
        </nav>
        <section aria-labelledby="calendar-title" className="overflow-hidden rounded-surface border border-border bg-surface">
          {isMonth ? <MonthToolbar date={legacyDate} today={today} /> : <CalendarToolbar range={range} today={today} />}
          {isMonth ? (
            invalidMonthDate ? <p role="alert" className="px-4 py-8 text-sm text-error sm:px-6">Data inválida. Escolha uma data entre 0001 e 9999 para consultar o mês.</p> : <Suspense key={`month:${legacyDate}`} fallback={<AgendaLoading />}><MonthView date={legacyDate} today={today} /></Suspense>
          ) : invalidRange ? (
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
