import { redirect } from "next/navigation";
import Link from "next/link";
import { newEventHref } from "../../lib/event-input";
import { getCalendar } from "../../server/api/calendar";
import { dayHref } from "../../lib/calendar-date";
import { layoutDayActivities } from "../../lib/day-layout";
import { TimedActivityBlocks } from "./TimedActivityBlocks";
import { ActivityRow } from "./ActivityRow";

interface DayViewProps {
  date: string;
}

export async function DayView({ date }: DayViewProps) {
  const result = await getCalendar({ from: date, to: date });
  if (!result.ok) {
    if (result.status === 401) redirect(result.code === "NO_SESSION" ? "/login" : "/login?reason=expired");
    return (
      <div className="space-y-3 px-4 py-12 sm:px-6">
        <h2 className="text-lg font-semibold">Não foi possível carregar o dia</h2>
        <p role="alert" className="text-sm text-text-secondary">{result.code === "TIMEOUT" ? "O serviço demorou para responder." : result.code === "INVALID_RESPONSE" ? "O serviço retornou uma resposta inesperada." : "O serviço está indisponível no momento."} Tente novamente para consultar as atividades.</p>
        <a href={dayHref(date)} className="inline-flex min-h-11 items-center rounded-control font-semibold text-primary underline underline-offset-4">Tentar novamente</a>
      </div>
    );
  }
  const { items, timezone } = result.data;
  const untimed = items.filter((item) => item.startTime === null);
  const positioned = layoutDayActivities(items);
  const columns = positioned.reduce((max, entry) => Math.max(max, entry.columns), 1);
  return (
    <>
      {items.length === 0 && <p className="border-b border-border px-4 py-6 text-sm text-text-secondary sm:px-6">Nenhuma atividade neste dia. Use as setas ou escolha outra data para continuar.</p>}
      <section aria-labelledby="untimed-title" className="border-b border-border px-4 py-5 sm:px-6">
        <h2 id="untimed-title" className="font-semibold">Sem horário <span className="font-normal text-text-secondary">({untimed.length})</span></h2>
        {untimed.length ? <ul className="mt-2">{untimed.map((item) => <ActivityRow key={item.calendarKey} item={item} />)}</ul> : <p className="mt-2 text-sm text-text-secondary">Nenhuma atividade sem horário.</p>}
      </section>
      <section aria-labelledby="timeline-title">
        <div className="space-y-2 px-4 py-5 sm:px-6">
          <h2 id="timeline-title" tabIndex={-1} className="font-semibold">Com horário <span className="font-normal text-text-secondary">({positioned.length})</span></h2>
          <p className="text-sm text-text-secondary">{positioned.length ? "Selecione uma atividade para ler o conteúdo completo abaixo." : "Nenhuma atividade com horário."}</p>
          <p className="text-xs text-text-secondary">Selecione um espaço livre na grade para criar uma atividade naquele horário.</p>
          {columns > 1 && <p id="timeline-scroll-help" className="text-xs text-text-secondary">Se necessário, role a grade horizontalmente para ver as atividades simultâneas.</p>}
          {positioned.length > 0 && <a href="#day-activities" className="inline-flex min-h-11 items-center rounded-control text-sm font-semibold text-primary underline underline-offset-4">Ir para a lista de atividades com horário</a>}
        </div>
        <div role="region" aria-label="Grade horária do dia" aria-describedby={columns > 1 ? "timeline-scroll-help" : undefined} tabIndex={0} className="max-h-[70dvh] overflow-auto border-y border-border">
          <div className="relative" style={{ minWidth: 56 + columns * 176, height: (24 * 60 + 45) * 2 }}>
            <div aria-hidden="true" className="absolute inset-0">
              {Array.from({ length: 25 }, (_, hour) => <div key={hour} className="absolute right-0 left-0 flex border-t border-border" style={{ top: hour * 120 }}><span className="sticky left-0 z-10 w-14 shrink-0 bg-surface px-2 py-1 text-xs tabular-nums text-text-secondary">{String(hour).padStart(2, "0")}:00</span></div>)}
            </div>
            <div className="absolute top-0 right-2 bottom-0 left-14">
              {Array.from({ length: 24 }, (_, hour) => <Link key={hour} href={newEventHref(date, `${String(hour).padStart(2, "0")}:00`)} prefetch={false} aria-label={`Criar atividade às ${hour}:00`} className="absolute right-0 left-0 h-30 rounded-control text-xs text-text-secondary hover:bg-primary-soft focus-visible:bg-primary-soft" style={{ top: hour * 120 }}><span className="sr-only">Criar atividade às {hour}:00</span></Link>)}
            </div>
            <ol aria-label="Atividades posicionadas por horário" className="pointer-events-none absolute top-0 right-2 bottom-0 left-14 [&_a]:pointer-events-auto">
              <TimedActivityBlocks activities={positioned} detailPrefix="day-activity" />
            </ol>
          </div>
        </div>
      </section>
      {positioned.length > 0 && <section id="day-activities" tabIndex={-1} aria-labelledby="day-activities-title" className="scroll-mt-4 px-4 py-6 sm:px-6"><h2 id="day-activities-title" className="font-semibold">Atividades com horário — conteúdo completo</h2><ul className="mt-2">{positioned.map(({ item }, index) => <ActivityRow key={item.calendarKey} id={`day-activity-${index}`} item={item} />)}</ul><a href="#timeline-title" className="inline-flex min-h-11 items-center rounded-control text-sm font-semibold text-primary underline underline-offset-4">Voltar à grade horária</a></section>}
      <p className="border-t border-border px-4 py-3 text-xs text-text-secondary sm:px-6">Fuso do planejamento: <span className="break-all">{timezone}</span></p>
    </>
  );
}
