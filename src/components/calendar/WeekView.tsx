import Link from "next/link";
import { newEventHref } from "../../lib/event-input";
import { redirect } from "next/navigation";
import { getCalendar } from "../../server/api/calendar";
import { adjacentDate, calendarHref, dayHref, formatCalendarDate, rangeLength, weekHref, weekRange } from "../../lib/calendar-date";
import { layoutDayActivities } from "../../lib/day-layout";
import { ActivityRow, activityStatuses } from "./ActivityRow";
import { TimedActivityBlocks } from "./TimedActivityBlocks";

interface WeekViewProps {
  date: string;
  fullHours: boolean;
  today: string;
}

export async function WeekView({ date, today, fullHours }: WeekViewProps) {
  const range = weekRange(date);
  const startHour = fullHours ? 0 : 8;
  const endHour = fullHours ? 24 : 22;
  const hours = Array.from({ length: endHour - startHour }, (_, index) => startHour + index);
  const gridHeight = (endHour - startHour) * 60;
  const result = await getCalendar(range);
  if (!result.ok) {
    if (result.status === 401) redirect(result.code === "NO_SESSION" ? "/login" : "/login?reason=expired");
    return (
      <div className="space-y-3 px-4 py-12 sm:px-6">
        <h2 className="text-lg font-semibold">Não foi possível carregar a semana</h2>
        <p role="alert" className="text-sm text-text-secondary">{result.code === "TIMEOUT" ? "O serviço demorou para responder." : result.code === "INVALID_RESPONSE" ? "O serviço retornou uma resposta inesperada." : "O serviço está indisponível no momento."} Tente novamente para consultar as atividades.</p>
        <a href={weekHref(date)} className="inline-flex min-h-11 items-center rounded-control font-semibold text-primary underline underline-offset-4">Tentar novamente</a>
      </div>
    );
  }
  const days = Array.from({ length: rangeLength(range) }, (_, index) => {
    const value = adjacentDate(range.from, index)!;
    const items = result.data.items.filter((item) => item.date === value);
    const activities = layoutDayActivities(items);
    return { date: value, untimed: items.filter((item) => item.startTime === null), activities, columns: activities.reduce((max, item) => Math.max(max, item.columns), 1) };
  });
  const gridColumns = `56px ${days.map((day) => `minmax(${Math.max(120, day.columns * 112)}px, 1fr)`).join(" ")}`;
  return (
    <>
      <div className="px-4 py-2">
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          <Link href={dayHref(date)} prefetch={false} className="inline-flex min-h-11 items-center rounded-control text-sm font-semibold text-primary underline underline-offset-4">Abrir dia selecionado</Link>
          <Link href={calendarHref(range)} prefetch={false} className="inline-flex min-h-11 items-center rounded-control text-sm font-semibold text-primary underline underline-offset-4">Abrir semana na agenda</Link>
          <a href="#week-details" className="inline-flex min-h-11 items-center rounded-control text-sm font-semibold text-primary underline underline-offset-4">Ir para a lista da semana</a>
        </div>
        {result.data.items.length === 0 && <p className="text-sm text-text-secondary">Nenhuma atividade nesta semana. Escolha outro período para continuar.</p>}
        {days.length < 7 && <p className="text-xs text-text-secondary">Exibindo os dias disponíveis até 31 de dezembro de 9999.</p>}
      </div>
      <div id="week-grid" role="region" aria-label="Grade semanal" tabIndex={0} className="max-h-[calc(100dvh-19rem)] min-h-64 overflow-auto border-y border-border">
        <div className="grid" style={{ gridTemplateColumns: gridColumns }}>
          <div className="sticky top-0 left-0 z-30 border-b border-border bg-surface" />
          {days.map((day) => <div key={`header-${day.date}`} className={`sticky top-0 z-20 border-b border-l border-border px-2 py-1 ${day.date === date ? "bg-primary-soft" : "bg-surface"}`}>
            <Link href={dayHref(day.date)} prefetch={false} aria-label={`Abrir dia ${formatCalendarDate(day.date, { day: "numeric", month: "long", year: "numeric" })}`} className="flex min-h-11 items-center gap-2 rounded-control text-sm font-semibold">
              <span className={`flex size-8 shrink-0 items-center justify-center tabular-nums ${day.date === today ? "rounded-full bg-primary text-text-on-primary" : "text-primary"}`}>{Number(day.date.slice(8))}</span>
              <time dateTime={day.date}>{formatCalendarDate(day.date, { weekday: "short", day: "2-digit", month: "2-digit" })}</time>
            </Link>
            <p className="sr-only">{[day.date === today ? "Hoje" : "", day.date === date ? "Dia selecionado" : ""].filter(Boolean).join(" · ")}</p>
          </div>)}
          <div className="sticky left-0 z-10 border-b border-border bg-surface px-1 py-3 text-center text-xs font-semibold text-text-secondary">Sem horário</div>
          {days.map((day) => <div key={`untimed-${day.date}`} className="border-b border-l border-border p-2">
            {day.untimed.length ? <ul className="space-y-2">{day.untimed.map((item, index) => <li key={item.calendarKey}><a href={`#week-${day.date}-untimed-${index}`} className={`block min-h-11 rounded-control p-2 text-xs ${activityStatuses[item.status].className}`}><p className="truncate font-semibold">{item.title}</p></a></li>)}</ul> : <p className="py-2 text-xs text-text-secondary">—</p>}
          </div>)}
          <div aria-hidden="true" className="sticky left-0 z-10 bg-surface" style={{ height: gridHeight }}>
            {[...hours, endHour].map((hour) => <span key={hour} className="absolute right-0 left-0 border-t border-border px-2 py-1 text-xs tabular-nums text-text-secondary" style={{ top: (hour - startHour) * 60 }}>{String(hour).padStart(2, "0")}:00</span>)}
          </div>
          {days.map((day) => <div key={`timed-${day.date}`} className="relative border-l border-border" style={{ height: gridHeight }}>
            <div aria-hidden="true" className="absolute inset-0">{[...hours, endHour].map((hour) => <div key={hour} className="absolute right-0 left-0 border-t border-border" style={{ top: (hour - startHour) * 60 }} />)}</div>
            {hours.map((hour) => <Link key={hour} href={newEventHref(day.date, `${String(hour).padStart(2, "0")}:00`)} prefetch={false} aria-label={`Criar atividade em ${formatCalendarDate(day.date, { day: "numeric", month: "long" })} às ${hour}:00`} className="absolute right-0 left-0 h-15 rounded-control hover:bg-primary-soft focus-visible:bg-primary-soft" style={{ top: (hour - startHour) * 60 }}><span className="sr-only">Criar atividade às {hour}:00</span></Link>)}
            <ol aria-label={`Atividades com horário de ${formatCalendarDate(day.date, { day: "numeric", month: "long", year: "numeric" })}`} className="pointer-events-none absolute inset-0 [&_a]:pointer-events-auto"><TimedActivityBlocks activities={day.activities} detailPrefix={`week-${day.date}-timed`} startHour={startHour} endHour={endHour} /></ol>
          </div>)}
        </div>
      </div>
      {!fullHours && <p className="px-4 py-2 text-xs text-text-secondary">Grade das 08h às 22h. A lista abaixo inclui todos os horários.</p>}
      <section id="week-details" tabIndex={-1} aria-labelledby="week-details-title" className="scroll-mt-4 px-4 py-6 sm:px-6">
        <h2 id="week-details-title" className="text-lg font-semibold">Atividades da semana</h2>
        {days.filter((day) => day.untimed.length + day.activities.length > 0).map((day) => <section key={day.date} aria-labelledby={`week-detail-${day.date}`} className="mt-2 border-t border-border pt-2">
          <div className="flex flex-wrap items-center justify-between gap-2"><h3 id={`week-detail-${day.date}`} className="font-semibold"><time dateTime={day.date}>{formatCalendarDate(day.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</time></h3><Link href={dayHref(day.date)} prefetch={false} className="inline-flex min-h-11 items-center rounded-control text-sm font-semibold text-primary underline underline-offset-4">Abrir dia</Link></div>
          {day.untimed.length + day.activities.length ? <ul>{day.untimed.map((item, index) => <ActivityRow key={item.calendarKey} item={item} id={`week-${day.date}-untimed-${index}`} />)}{day.activities.map(({ item }, index) => <ActivityRow key={item.calendarKey} item={item} id={`week-${day.date}-timed-${index}`} />)}</ul> : <p className="mt-2 text-sm text-text-secondary">Nenhuma atividade neste dia.</p>}
        </section>)}
        <a href="#week-grid" className="mt-4 inline-flex min-h-11 items-center rounded-control text-sm font-semibold text-primary underline underline-offset-4">Voltar à grade semanal</a>
      </section>
      <p className="border-t border-border px-4 py-3 text-xs text-text-secondary sm:px-6">Fuso do planejamento: <span className="break-all">{result.data.timezone}</span></p>
    </>
  );
}
