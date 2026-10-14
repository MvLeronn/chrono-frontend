import { PlanningOverlay } from "../components/PlanningOverlay";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getCurrentUser } from "../server/api/auth";
import { logoutAction } from "./actions/session";
import { Button } from "../components/ui/Button";
import { PrivateShell } from "../components/PrivateShell";
import { Suspense } from "react";
import { Agenda } from "../components/calendar/Agenda";
import { AgendaLoading } from "../components/calendar/AgendaLoading";
import { CalendarToolbar } from "../components/calendar/CalendarToolbar";
import { CalendarDateToolbar } from "../components/calendar/CalendarDateToolbar";
import { CalendarDatePicker } from "../components/calendar/CalendarDatePicker";
import { DayView } from "../components/calendar/DayView";
import { MonthView } from "../components/calendar/MonthView";
import { WeekView } from "../components/calendar/WeekView";
import { newEventHref } from "../lib/event-input";
import { calendarHref, dayHref, defaultRange, formatCalendarDate, isValidRange, monthHref, parseCalendarDate, todayInTimezone, weekHref, weekRange } from "../lib/calendar-date";

interface HomePageProps {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
    view?: string | string[];
    date?: string | string[];
    from?: string | string[];
    to?: string | string[];
    deleted?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const session = await getCurrentUser();
  if (!session.ok && session.status === 401) {
    redirect(session.code === "NO_SESSION" ? "/login" : "/login?reason=expired");
  }

  if (session.ok) {
    const params = await searchParams;
    const fullHours = (await cookies()).get("chrono-hours")?.value === "full";
    const today = todayInTimezone(session.data.timezone);
    const legacyDate = typeof params.date === "string" && parseCalendarDate(params.date) ? params.date : today;
    const candidate = typeof params.from === "string" && typeof params.to === "string" ? { from: params.from, to: params.to } : null;
    const hasRange = params.from !== undefined || params.to !== undefined;
    const invalidRange = hasRange ? !candidate || !isValidRange(candidate) : params.date !== undefined && legacyDate === today && params.date !== today;
    const range = candidate && isValidRange(candidate) ? candidate : defaultRange(legacyDate);
    const isMonth = params.view === "month" || (params.view === undefined && !hasRange);
    const isDay = params.view === "day";
    const isWeek = params.view === "week";
    const isDateView = isMonth || isDay || isWeek;
    const invalidDate = params.date !== undefined && !(typeof params.date === "string" && parseCalendarDate(params.date));
    const viewLinkClass = "inline-flex min-h-11 items-center justify-center rounded-full px-3 text-sm font-medium";

    const controls = (
      <div className="contents">
        <nav aria-label="Visualização do calendário" className="md:ml-auto flex max-w-full flex-wrap gap-0.5 rounded-full border border-border p-0.5">
          <Link href={calendarHref(isWeek ? weekRange(legacyDate) : isDateView ? defaultRange(legacyDate) : range)} prefetch={false} aria-current={!isDateView ? "page" : undefined} className={`${viewLinkClass} ${!isDateView ? "bg-primary text-text-on-primary" : "text-text-secondary hover:bg-surface hover:text-primary"}`}>Agenda</Link>
          <Link href={monthHref(isDateView ? legacyDate : range.from)} prefetch={false} aria-current={isMonth ? "page" : undefined} className={`${viewLinkClass} ${isMonth ? "bg-primary text-text-on-primary" : "text-text-secondary hover:bg-surface hover:text-primary"}`}>Mês</Link>
          <Link href={weekHref(isDateView ? legacyDate : range.from)} prefetch={false} aria-current={isWeek ? "page" : undefined} className={`${viewLinkClass} ${isWeek ? "bg-primary text-text-on-primary" : "text-text-secondary hover:bg-surface hover:text-primary"}`}>Semana</Link>
          <Link href={dayHref(isDateView ? legacyDate : range.from)} prefetch={false} aria-current={isDay ? "page" : undefined} className={`${viewLinkClass} ${isDay ? "bg-primary text-text-on-primary" : "text-text-secondary hover:bg-surface hover:text-primary"}`}>Dia</Link>
        </nav>
        <Link href={newEventHref(isDateView ? legacyDate : range.from)} prefetch={false} className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-text-on-primary hover:bg-primary-hover"><Plus aria-hidden="true" className="size-5 shrink-0" />Criar atividade</Link>
      </div>
    );

    return (
      <PrivateShell sidebar={<CalendarDatePicker key={isDateView ? legacyDate : range.from} date={isDateView ? legacyDate : range.from} today={today} view={isWeek ? "week" : isDay ? "day" : "month"} inline />}>
        {params.deleted === "1" && <p role="status" className="mb-4 rounded-control bg-status-completed-soft p-3 text-status-completed">Atividade excluída.</p>}
        <PlanningOverlay query={params} base="/" />
        <h1 id="calendar-title" className="sr-only">Calendário</h1>
        <section aria-labelledby="calendar-title" className="calendar-surface @container overflow-hidden rounded-3xl border border-border bg-surface">
          {isDateView ? <CalendarDateToolbar date={legacyDate} today={today} view={isMonth ? "month" : isWeek ? "week" : "day"}>{controls}</CalendarDateToolbar> : <CalendarToolbar range={range} today={today}>{controls}</CalendarToolbar>}
          {isDateView ? (
            invalidDate ? <p role="alert" className="px-4 py-8 text-sm text-error sm:px-6">Data inválida. Escolha uma data entre 0001 e 9999 para consultar o calendário.</p> : <Suspense key={`${params.view}:${legacyDate}`} fallback={<AgendaLoading />}>{isMonth ? <MonthView date={legacyDate} today={today} /> : isWeek ? <WeekView date={legacyDate} today={today} fullHours={fullHours} /> : <DayView date={legacyDate} fullHours={fullHours} />}</Suspense>
          ) : invalidRange ? (
            <p role="alert" className="px-4 py-8 text-sm text-error sm:px-6">Período inválido. Escolha datas entre 0001 e 9999, com o fim igual ou posterior ao início e no máximo 366 dias. Ajuste os campos acima para consultar a agenda.</p>
          ) : (
            <>
              <p className="border-b border-border px-4 py-2 text-sm font-semibold tabular-nums sm:px-6">{formatCalendarDate(range.from, { day: "numeric", month: "long", year: "numeric" })} a {formatCalendarDate(range.to, { day: "numeric", month: "long", year: "numeric" })}</p>
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
        <h1 className="text-2xl font-medium tracking-tight leading-8">Não foi possível verificar seu acesso.</h1>
        <p role="alert" className="text-text-secondary">O serviço está indisponível no momento. Tente novamente em instantes.</p>
        <Link href="/" prefetch={false} className="inline-flex min-h-11 items-center rounded-control font-semibold text-primary  ">Tentar novamente</Link>
        <form action={logoutAction}>
          <Button type="submit" variant="secondary" className="w-full">Sair</Button>
        </form>
      </section>
    </main>
  );
}
