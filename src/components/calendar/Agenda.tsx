import { redirect } from "next/navigation";
import { ActivityRow } from "./ActivityRow";
import { CalendarDays } from "lucide-react";
import { getCalendar } from "../../server/api/calendar";
import { calendarHref, formatCalendarDate } from "../../lib/calendar-date";
import type { CalendarItem } from "../../models/calendar";
import type { CalendarRange } from "../../models/calendar";

interface AgendaProps {
  range: CalendarRange;
  today: string;
}

export async function Agenda({ range, today }: AgendaProps) {
  const result = await getCalendar(range);
  if (!result.ok) {
    if (result.status === 401) redirect(result.code === "NO_SESSION" ? "/login" : "/login?reason=expired");
    return (
      <div className="space-y-3 px-4 py-12 sm:px-6">
        <h2 className="text-lg font-semibold">Não foi possível carregar a agenda</h2>
        <p role="alert" className="text-sm text-text-secondary">{result.code === "TIMEOUT" ? "O serviço demorou para responder." : result.code === "INVALID_RESPONSE" ? "O serviço retornou uma resposta inesperada." : "O serviço está indisponível no momento."} Tente novamente para consultar este período.</p>
        <a href={calendarHref(range)} className="inline-flex min-h-11 items-center rounded-control font-semibold text-primary underline underline-offset-4">Tentar novamente</a>
      </div>
    );
  }
  const { items, timezone } = result.data;
  const groups = new Map<string, CalendarItem[]>();
  for (const item of items) {
    const group = groups.get(item.date);
    if (group) group.push(item); else groups.set(item.date, [item]);
  }
  return (
    <>
      {items.length === 0 ? (
        <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
          <CalendarDays aria-hidden="true" className="mb-4 size-8 text-primary" strokeWidth={1.5} />
          <h2 className="text-lg font-semibold">Nenhuma atividade neste período</h2>
          <p className="mt-2 max-w-96 text-sm leading-6 text-text-secondary">Escolha outras datas ou use as setas para consultar o período anterior ou seguinte.</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {Array.from(groups, ([date, activities]) => (
            <section key={date} aria-labelledby={`day-${date}`} className="px-4 py-5 sm:px-6">
              <div className="mb-2 flex items-center gap-3">
                <span aria-hidden="true" className={`flex size-11 shrink-0 items-center justify-center text-lg font-semibold tabular-nums ${date === today ? "rounded-full bg-primary text-text-on-primary" : "rounded-control bg-background text-text-primary"}`}>{date.slice(8)}</span>
                <h2 id={`day-${date}`} className="text-sm font-semibold"><time dateTime={date}>{formatCalendarDate(date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</time>{date === today && <span className="ml-2 text-primary">Hoje</span>}</h2>
              </div>
              <ul>{activities.map((item) => <ActivityRow key={item.calendarKey} item={item} />)}</ul>
            </section>
          ))}
        </div>
      )}
      <p className="border-t border-border px-4 py-3 text-xs text-text-secondary sm:px-6">Fuso do planejamento: <span className="break-all">{timezone}</span></p>
    </>
  );
}
