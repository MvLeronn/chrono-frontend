import Link from "next/link";
import { ActivityDetails } from "./ActivityDetails";
import { CreateActivity } from "./CreateActivity";
import { redirect } from "next/navigation";
import { getCalendar } from "../../server/api/calendar";
import { formatCalendarDate, monthGrid, monthHref } from "../../lib/calendar-date";
import { ActivityRow } from "./ActivityRow";
import { activityStatuses } from "./activity-status";
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
        <a href={monthHref(date)} className="inline-flex min-h-11 items-center rounded-control font-semibold text-primary  ">Tentar novamente</a>
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
      <table className="w-full table-fixed border-collapse text-left" style={{ "--week-count": weeks.length } as React.CSSProperties}>
        <caption className="sr-only">{formatCalendarDate(date, { month: "long", year: "numeric" })}. Semanas começam na segunda-feira.</caption>
        <thead><tr>{weekdays.map((day) => <th key={day} scope="col" className="border-b border-border py-3 text-center text-[11px] font-medium uppercase tracking-wide text-text-secondary"><abbr title={day} className="no-underline">{day.slice(0, 3)}</abbr></th>)}</tr></thead>
        <tbody>{weeks.map((week, index) => (
          <tr key={index} className="group/week">
            {week.map((day, column) => {
              if (!day) return <td key={`blank-${column}`} className="border border-border bg-background first:border-l-0 last:border-r-0 group-last/week:border-b-0" />;
              const items = groups.get(day) ?? [];
              const selected = day === date;
              const isToday = day === today;
              const adjacent = day.slice(0, 7) !== date.slice(0, 7);
              const fullDate = formatCalendarDate(day, { day: "numeric", month: "long", year: "numeric" });
              const href = monthHref(day);
              return (
                <td key={day} className={`group/day align-top border border-border first:border-l-0 last:border-r-0 group-last/week:border-b-0 ${adjacent ? "bg-background/50" : "bg-surface"}`}>
                  <div className="relative isolate min-h-30 p-1 md:min-h-[max(144px,calc((100dvh-144px)/var(--week-count,5)))]">
                    <Link href={href} scroll={false} prefetch={false} aria-current={selected ? "date" : undefined} aria-label={`${fullDate}${isToday ? ", hoje" : ""}${selected ? ", selecionado" : ""}, ${items.length} atividades. Ver lista completa.`} className="absolute inset-0 rounded-control hover:bg-primary/5" />
                    <div className="pointer-events-none relative flex h-10 items-center justify-center">
                      <span className={`flex size-7 items-center justify-center rounded-full text-xs font-medium tabular-nums ${isToday ? "bg-primary text-text-on-primary" : selected ? "bg-primary-soft text-primary" : adjacent ? "text-text-secondary" : "text-text-primary"}`}>{Number(day.slice(8))}</span>
                      <div className="pointer-events-auto absolute right-0 hidden sm:block [@media(hover:hover)_and_(pointer:fine)]:opacity-0 group-hover/day:opacity-100 group-focus-within/day:opacity-100"><CreateActivity date={day} compact /></div>
                    </div>
                    <div className="pointer-events-auto relative flex justify-center sm:hidden"><CreateActivity date={day} compact /></div>
                    <p aria-hidden="true" className="pointer-events-none relative pb-2 text-center text-xs tabular-nums text-text-secondary sm:hidden">{items.length > 0 ? items.length : "–"}</p>
                    <ul className="pointer-events-none relative hidden space-y-1 sm:block">
                      {items.slice(0, 4).map((item) => (
                        <li key={item.calendarKey} title={`${item.title} · ${activityStatuses[item.status].label}`}>
                          <ActivityDetails item={item} className={`pointer-events-auto block min-h-6 w-full rounded-md px-2 py-1 text-left text-xs ${activityStatuses[item.status].className} transition-[filter,box-shadow] hover:brightness-95 hover:ring-1 hover:ring-current motion-reduce:transition-none`}><span className="block truncate font-medium">{item.startTime && <span className="tabular-nums">{item.startTime} </span>}{item.title}</span></ActivityDetails>

                        </li>
                      ))}
                    </ul>
                    {items.length > 4 && <Link href={href} scroll={false} prefetch={false} aria-label={`Ver todas as ${items.length} atividades de ${fullDate}`} className="relative hidden min-h-6 items-center rounded-control px-2 text-xs font-medium text-text-secondary hover:bg-background sm:flex">+{items.length - 4} atividades</Link>}
                  </div>
                </td>
              );
            })}
          </tr>
        ))}</tbody>
      </table>
      <section id="selected-day" tabIndex={-1} aria-labelledby="selected-day-title" className="scroll-mt-4 border-t border-border px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 id="selected-day-title" className="font-semibold first-letter:uppercase"><time dateTime={date}>{formatCalendarDate(date, { weekday: "long", day: "numeric", month: "long" }).replace("-feira", "")}</time></h2>
          </div>
        </div>
        {selectedItems.length ? <ul className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(min(100%,16rem),19rem))] gap-3">{selectedItems.map((item) => <ActivityRow key={item.calendarKey} item={item} />)}</ul> : <p className="py-6 text-sm text-text-secondary">Nenhuma atividade neste dia. Selecione outra data para continuar.</p>}
      </section>
    </>
  );
}
