import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { adjacentMonth, formatCalendarDate, monthHref } from "../../lib/calendar-date";
import { Button } from "../ui/Button";
import { Label } from "../ui/Label";

const linkClass = "inline-flex min-h-11 min-w-11 items-center justify-center rounded-control border border-text-secondary px-3 text-sm font-semibold hover:bg-background";

export function MonthToolbar({ date, today }: { date: string; today: string }) {
  const previous = adjacentMonth(date, -1);
  const next = adjacentMonth(date, 1);
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border p-4 sm:p-6">
      <div className="space-y-3">
        <h2 className="text-lg font-semibold capitalize">{formatCalendarDate(date, { month: "long", year: "numeric" })}</h2>
        <div className="flex gap-2" role="group" aria-label="Navegar entre meses">
          {previous ? <Link href={monthHref(previous)} prefetch={false} aria-label="Mês anterior" className={linkClass}><ChevronLeft aria-hidden="true" className="size-4" /></Link> : <button disabled aria-label="Mês anterior" className="size-11 text-text-secondary"><ChevronLeft aria-hidden="true" className="mx-auto size-4" /></button>}
          <Link href={monthHref(today)} prefetch={false} className={linkClass}>Hoje</Link>
          {next ? <Link href={monthHref(next)} prefetch={false} aria-label="Próximo mês" className={linkClass}><ChevronRight aria-hidden="true" className="size-4" /></Link> : <button disabled aria-label="Próximo mês" className="size-11 text-text-secondary"><ChevronRight aria-hidden="true" className="mx-auto size-4" /></button>}
        </div>
      </div>
      <form action="/" key={date} className="min-w-0 max-w-full space-y-2">
        <input type="hidden" name="view" value="month" />
        <Label htmlFor="month-date">Ir para uma data</Label>
        <div className="flex flex-wrap gap-2">
          <input id="month-date" name="date" type="date" required min="0001-01-01" max="9999-12-31" defaultValue={date} className="min-h-11 min-w-0 max-w-full flex-1 rounded-control border border-text-secondary bg-surface px-3 py-2 text-base tabular-nums" />
          <Button type="submit" variant="secondary">Ir</Button>
        </div>
      </form>
    </div>
  );
}
