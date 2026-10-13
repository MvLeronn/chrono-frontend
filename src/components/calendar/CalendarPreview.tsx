import { CalendarDays } from "lucide-react";
import { formatCalendarDate } from "../../lib/calendar-date";
import { CalendarToolbar } from "./CalendarToolbar";

type CalendarPreviewProps = { selectedDate: string; today: string; timezone: string; invalidDate: boolean };

export function CalendarPreview({ selectedDate, today, timezone, invalidDate }: CalendarPreviewProps) {
  const isToday = selectedDate === today;

  return (
    <>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 id="calendar-title" className="text-2xl font-semibold leading-8">Calendário</h1>
          <p className="text-text-secondary">Seu espaço para eventos e tarefas.</p>
        </div>
        <span className="rounded-control border border-border px-3 py-1 text-xs font-semibold text-text-secondary">Prévia visual</span>
      </header>
      <section aria-labelledby="calendar-title" className="overflow-hidden rounded-surface border border-border bg-surface">
        <CalendarToolbar selectedDate={selectedDate} today={today} />
        {invalidDate && <p role="status" className="border-b border-border px-4 py-3 text-sm text-error sm:px-6">A data informada é inválida. Exibindo hoje.</p>}
        <div className="flex items-center gap-4 border-b border-border px-4 py-5 sm:px-6">
          <span aria-hidden="true" className={`flex size-12 shrink-0 items-center justify-center text-xl font-semibold tabular-nums ${isToday ? "rounded-full bg-primary text-text-on-primary" : "rounded-control border border-primary bg-primary-soft text-primary"}`}>
            {selectedDate.slice(8)}
          </span>
          <div className="min-w-0">
            <h2 className="font-semibold"><time dateTime={selectedDate}>{formatCalendarDate(selectedDate, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</time></h2>
            <p className="text-sm text-text-secondary">{isToday ? "Hoje" : "Data selecionada"}</p>
          </div>
        </div>
        <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center sm:min-h-96">
          <CalendarDays aria-hidden="true" className="mb-4 size-8 text-primary" strokeWidth={1.5} />
          <h3 className="text-lg font-semibold">Seu calendário está em preparação</h3>
          <p className="mt-2 max-w-96 text-sm leading-6 text-text-secondary">Você já pode navegar entre datas. As atividades ainda não são exibidas nesta prévia.</p>
        </div>
      </section>
      <p className="mt-4 break-words text-xs text-text-secondary">Fuso do planejamento: {timezone}</p>
    </>
  );
}
