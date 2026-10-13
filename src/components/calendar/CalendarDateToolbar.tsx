import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { adjacentDate, adjacentMonth, dayHref, formatCalendarDate, monthHref } from "../../lib/calendar-date";
import { Button } from "../ui/Button";
import { Label } from "../ui/Label";

const linkClass = "inline-flex min-h-11 min-w-11 items-center justify-center rounded-control border border-text-secondary px-3 text-sm font-semibold hover:bg-background";

export function CalendarDateToolbar({ date, today, view }: { date: string; today: string; view: "month" | "day" }) {
  const isMonth = view === "month";
  const shift = isMonth ? adjacentMonth : adjacentDate;
  const href = isMonth ? monthHref : dayHref;
  const previous = shift(date, -1);
  const next = shift(date, 1);
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border p-4 sm:p-6">
      <div className="space-y-3">
        <h2 className="text-lg font-semibold capitalize">{formatCalendarDate(date, isMonth ? { month: "long", year: "numeric" } : { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</h2>
        {!isMonth && date === today && <p className="text-sm font-semibold text-primary">Hoje</p>}
        <div className="flex gap-2" role="group" aria-label={isMonth ? "Navegar entre meses" : "Navegar entre dias"}>
          {previous ? <Link href={href(previous)} prefetch={false} aria-label={isMonth ? "Mês anterior" : "Dia anterior"} className={linkClass}><ChevronLeft aria-hidden="true" className="size-4" /></Link> : <button disabled aria-label={isMonth ? "Mês anterior" : "Dia anterior"} className="size-11 text-text-secondary"><ChevronLeft aria-hidden="true" className="mx-auto size-4" /></button>}
          <Link href={href(today)} prefetch={false} className={linkClass}>Hoje</Link>
          {next ? <Link href={href(next)} prefetch={false} aria-label={isMonth ? "Próximo mês" : "Próximo dia"} className={linkClass}><ChevronRight aria-hidden="true" className="size-4" /></Link> : <button disabled aria-label={isMonth ? "Próximo mês" : "Próximo dia"} className="size-11 text-text-secondary"><ChevronRight aria-hidden="true" className="mx-auto size-4" /></button>}
        </div>
      </div>
      <form action="/" key={date} className="min-w-0 max-w-full space-y-2">
        <input type="hidden" name="view" value={view} />
        <Label htmlFor="calendar-date">Ir para uma data</Label>
        <div className="flex flex-wrap gap-2">
          <input id="calendar-date" name="date" type="date" required min="0001-01-01" max="9999-12-31" defaultValue={date} className="min-h-11 min-w-0 max-w-full flex-1 rounded-control border border-text-secondary bg-surface px-3 py-2 text-base tabular-nums" />
          <Button type="submit" variant="secondary">Ir</Button>
        </div>
      </form>
    </div>
  );
}
