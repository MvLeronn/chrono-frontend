import Link from "next/link";
import { newEventHref } from "../../lib/event-input";
import { redirect } from "next/navigation";
import { getCalendar } from "../../server/api/calendar";
import { calendarHref, dayHref, formatCalendarDate, monthGrid, monthHref } from "../../lib/calendar-date";
import { ActivityRow, activityStatuses } from "./ActivityRow";
import type { CalendarItem } from "../../models/calendar";

interface MonthViewProps {
  date: string;
  today: string;
}

const weekdays = ["segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado", "domingo"];

export async function MonthView({ date, today }: MonthViewProps) {
  const { days, range } = monthGrid(date);
  const result = await getCalendar(range);
  if (!result.ok) {
    if (result.status === 401) redirect(result.code === "NO_SESSION" ? "/login" : "/login?reason=expired");
    return (
      <div className="space-y-3 px-4 py-12 sm:px-6">
        <h2 className="text-lg font-semibold">Não foi possível carregar o mês</h2>
        <p role="alert" className="text-sm text-text-secondary">{result.code === "TIMEOUT" ? "O serviço demorou para responder." : result.code === "INVALID_RESPONSE" ? "O serviço retornou uma resposta inesperada." : "O serviço está indisponível no momento."} Tente novamente para consultar as atividades.</p>
        <a href={monthHref(date)} className="inline-flex min-h-11 items-center rounded-control font-semibold text-primary underline underline-offset-4">Tentar novamente</a>
      </div>
    );
  }
  const groups = new Map<string, CalendarItem[]>();
  for (const item of result.data.items) {
    const group = groups.get(item.date);
    if (group) group.push(item); else groups.set(item.date, [item]);
  }
  const selectedItems = groups.get(date) ?? [];
  const weeks = Array.from({ length: days.length / 7 }, (_, index) => days.slice(index * 7, index * 7 + 7));
  return (
    <>
      <table className="w-full table-fixed border-collapse text-left">
        <caption className="sr-only">{formatCalendarDate(date, { month: "long", year: "numeric" })}. Semanas começam na segunda-feira.</caption>
        <thead><tr>{weekdays.map((day) => <th key={day} scope="col" className="border-y border-border py-2 text-center text-xs font-semibold text-text-secondary"><abbr title={day} className="no-underline">{day.slice(0, 3)}</abbr></th>)}</tr></thead>
        <tbody>{weeks.map((week, index) => (
          <tr key={index}>
            {week.map((day, column) => {
              if (!day) return <td key={`blank-${column}`} className="border border-border bg-background" />;
              const items = groups.get(day) ?? [];
              const selected = day === date;
              const isToday = day === today;
              const adjacent = day.slice(0, 7) !== date.slice(0, 7);
              const fullDate = formatCalendarDate(day, { day: "numeric", month: "long", year: "numeric" });
              const href = `${monthHref(day)}#selected-day`;
              return (
                <td key={day} className={`align-top border border-border ${selected ? "bg-primary-soft shadow-[inset_0_0_0_2px_var(--color-primary)]" : adjacent ? "bg-background" : "bg-surface"}`}>
                  <div className="min-h-20 sm:h-28 sm:p-1">
                    <Link href={href} prefetch={false} aria-current={selected ? "date" : undefined} aria-label={`${fullDate}${isToday ? ", hoje" : ""}${selected ? ", selecionado" : ""}, ${items.length} atividades. Ver lista completa.`} className="flex min-h-11 items-center justify-center rounded-control sm:justify-start sm:px-1">
                      <span className={`flex size-8 items-center justify-center text-sm font-semibold tabular-nums ${isToday ? "rounded-full bg-primary text-text-on-primary" : adjacent ? "text-text-secondary" : "text-text-primary"}`}>{Number(day.slice(8))}</span>
                    </Link>
                    <p aria-hidden="true" className="pb-2 text-center text-xs tabular-nums text-text-secondary sm:hidden">{items.length > 0 ? items.length : "–"}</p>
                    <ul className="hidden space-y-1 sm:block">
                      {items.slice(0, 2).map((item) => (
                        <li key={item.calendarKey} title={`${item.title} · ${activityStatuses[item.status].label}`} className={`rounded-control px-2 py-1 text-xs ${activityStatuses[item.status].className}`}>
                          <p className="truncate font-semibold">{item.startTime && <span className="tabular-nums">{item.startTime} </span>}{item.title}</p>

                        </li>
                      ))}
                    </ul>
                    {items.length > 2 && <Link href={href} prefetch={false} aria-label={`Ver todas as ${items.length} atividades de ${fullDate}`} className="hidden min-h-6 items-center rounded-control px-2 text-xs font-semibold text-primary underline underline-offset-2 sm:flex">+{items.length - 2} atividades</Link>}
                  </div>
                </td>
              );
            })}
          </tr>
        ))}</tbody>
      </table>
      <section id="selected-day" tabIndex={-1} aria-labelledby="selected-day-title" className="scroll-mt-4 px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="mb-1 text-xs font-semibold text-primary">Dia selecionado{date === today ? " · Hoje" : ""}</p>
            <h2 id="selected-day-title" className="font-semibold"><time dateTime={date}>{formatCalendarDate(date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</time></h2>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href={newEventHref(date)} prefetch={false} className="inline-flex min-h-11 items-center rounded-control text-sm font-semibold text-primary underline underline-offset-4">Criar neste dia</Link>
            <Link href={dayHref(date)} prefetch={false} className="inline-flex min-h-11 items-center rounded-control text-sm font-semibold text-primary underline underline-offset-4">Ver grade do dia</Link>
            <Link href={calendarHref({ from: date, to: date })} prefetch={false} className="inline-flex min-h-11 items-center rounded-control text-sm font-semibold text-primary underline underline-offset-4">Abrir na agenda</Link>
          </div>
        </div>
        {selectedItems.length ? <ul className="mt-3">{selectedItems.map((item) => <ActivityRow key={item.calendarKey} item={item} />)}</ul> : <p className="py-6 text-sm text-text-secondary">Nenhuma atividade neste dia. Selecione outra data para continuar.</p>}
      </section>
      <p className="border-t border-border px-4 py-3 text-xs text-text-secondary sm:px-6">Fuso do planejamento: <span className="break-all">{result.data.timezone}</span></p>
    </>
  );
}
