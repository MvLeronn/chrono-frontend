import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { adjacentDate, adjacentMonth, adjacentWeek, dayHref, formatCalendarDate, monthHref, weekHref, weekRange } from "../../lib/calendar-date";
import { CalendarDatePicker } from "./CalendarDatePicker";

interface CalendarDateToolbarProps {
  children?: ReactNode;
  date: string;
  today: string;
  view: "month" | "day" | "week";
}

const linkClass = "inline-flex min-h-11 min-w-11 items-center justify-center rounded-control px-3 text-sm font-semibold hover:bg-background";

export function CalendarDateToolbar({ date, today, view, children }: CalendarDateToolbarProps) {
  const isMonth = view === "month";
  const isWeek = view === "week";
  const shift = isMonth ? adjacentMonth : isWeek ? adjacentWeek : adjacentDate;
  const href = isMonth ? monthHref : isWeek ? weekHref : dayHref;
  const previous = shift(date, -1);
  const next = shift(date, 1);
  const previousLabel = isMonth ? "Mês anterior" : isWeek ? "Semana anterior" : "Dia anterior";
  const nextLabel = isMonth ? "Próximo mês" : isWeek ? "Próxima semana" : "Próximo dia";
  const range = isWeek ? weekRange(date) : null;
  return (
    <div className="flex flex-wrap items-center gap-2 p-3 md:gap-x-3 md:px-4">
        <h2 className="mr-auto min-w-0 basis-full text-lg md:basis-auto md:text-xl font-medium first-letter:uppercase">{range ? `${formatCalendarDate(range.from, { day: "numeric", month: "short", year: "numeric" })} a ${formatCalendarDate(range.to, { day: "numeric", month: "short", year: "numeric" })}` : formatCalendarDate(date, isMonth ? { month: "long", year: "numeric" } : { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</h2>
        <div className="flex shrink-0 gap-0.5" role="group" aria-label={isMonth ? "Navegar entre meses" : isWeek ? "Navegar entre semanas" : "Navegar entre dias"}>
          <Link href={href(today)} prefetch={false} className="mr-2 inline-flex min-h-11 items-center rounded-full border border-border px-5 text-sm font-medium hover:bg-background">Hoje</Link>
          {previous ? <Link href={href(previous)} prefetch={false} aria-label={previousLabel} className={linkClass}><ChevronLeft aria-hidden="true" className="size-4" /></Link> : <button disabled aria-label={previousLabel} className="size-11 text-text-secondary"><ChevronLeft aria-hidden="true" className="mx-auto size-4" /></button>}
          {next ? <Link href={href(next)} prefetch={false} aria-label={nextLabel} className={linkClass}><ChevronRight aria-hidden="true" className="size-4" /></Link> : <button disabled aria-label={nextLabel} className="size-11 text-text-secondary"><ChevronRight aria-hidden="true" className="mx-auto size-4" /></button>}
        </div>
      <CalendarDatePicker date={date} view={view} />
      {children}
    </div>
  );
}
