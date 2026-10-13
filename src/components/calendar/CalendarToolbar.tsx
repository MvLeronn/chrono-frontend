import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { calendarHref, defaultRange, shiftRange } from "../../lib/calendar-date";
import type { CalendarRange } from "../../lib/calendar-types";
import { Button } from "../ui/Button";
import { Label } from "../ui/Label";

const navigationClass = "inline-flex min-h-11 min-w-11 items-center justify-center rounded-control border border-text-secondary bg-surface px-3 text-sm font-semibold hover:bg-background";
const inputClass = "min-h-11 w-full min-w-0 rounded-control border border-text-secondary bg-surface px-3 py-2 text-base tabular-nums";

export function CalendarToolbar({ range, today }: { range: CalendarRange; today: string }) {
  const previous = shiftRange(range, -1);
  const next = shiftRange(range, 1);
  return (
    <div className="flex flex-col gap-4 border-b border-border p-4 sm:p-6 xl:flex-row xl:items-end xl:justify-between">
      <div className="flex items-center gap-2" role="group" aria-label="Navegar entre períodos">
        {previous ? <Link href={calendarHref(previous)} prefetch={false} aria-label="Período anterior" className={navigationClass}><ChevronLeft aria-hidden="true" className="size-4" /></Link> : <button disabled aria-label="Período anterior" className="size-11 text-text-secondary"><ChevronLeft aria-hidden="true" className="mx-auto size-4" /></button>}
        <Link href={calendarHref(defaultRange(today))} prefetch={false} className={navigationClass}>Hoje</Link>
        {next ? <Link href={calendarHref(next)} prefetch={false} aria-label="Próximo período" className={navigationClass}><ChevronRight aria-hidden="true" className="size-4" /></Link> : <button disabled aria-label="Próximo período" className="size-11 text-text-secondary"><ChevronRight aria-hidden="true" className="mx-auto size-4" /></button>}
      </div>
      <form action="/" className="min-w-0" key={`${range.from}:${range.to}`}>
        <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
          <div className="min-w-0 space-y-2"><Label htmlFor="calendar-from">De</Label><input id="calendar-from" name="from" type="date" required min="0001-01-01" max="9999-12-31" defaultValue={range.from} aria-describedby="range-help" className={inputClass} /></div>
          <div className="min-w-0 space-y-2"><Label htmlFor="calendar-to">Até</Label><input id="calendar-to" name="to" type="date" required min="0001-01-01" max="9999-12-31" defaultValue={range.to} aria-describedby="range-help" className={inputClass} /></div>
          <Button type="submit" variant="secondary">Mostrar período</Button>
        </div>
        <p id="range-help" className="mt-2 text-xs text-text-secondary">Até 366 dias, incluindo as datas de início e fim.</p>
      </form>
    </div>
  );
}
