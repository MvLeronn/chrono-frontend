import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { adjacentDate } from "../../lib/calendar-date";
import { Button } from "../ui/Button";
import { Label } from "../ui/Label";

type CalendarToolbarProps = { selectedDate: string; today: string };

const navigationClass = "inline-flex min-h-11 min-w-11 items-center justify-center rounded-control border border-text-secondary bg-surface px-3 text-sm font-semibold hover:bg-background";

export function CalendarToolbar({ selectedDate, today }: CalendarToolbarProps) {
  const previous = adjacentDate(selectedDate, -1);
  const next = adjacentDate(selectedDate, 1);

  return (
    <div className="flex flex-col gap-6 border-b border-border p-4 sm:p-6 xl:flex-row xl:items-end xl:justify-between">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex items-center gap-2" role="group" aria-label="Navegar entre datas">
          {previous ? (
            <Link href={`/?date=${previous}`} prefetch={false} aria-label="Dia anterior" className={navigationClass}><ChevronLeft aria-hidden="true" className="size-4" /></Link>
          ) : <span aria-label="Dia anterior indisponível" className="flex size-11 items-center justify-center text-text-secondary"><ChevronLeft aria-hidden="true" className="size-4" /></span>}
          <Link href={`/?date=${today}`} prefetch={false} className={navigationClass}>Hoje</Link>
          {next ? (
            <Link href={`/?date=${next}`} prefetch={false} aria-label="Próximo dia" className={navigationClass}><ChevronRight aria-hidden="true" className="size-4" /></Link>
          ) : <span aria-label="Próximo dia indisponível" className="flex size-11 items-center justify-center text-text-secondary"><ChevronRight aria-hidden="true" className="size-4" /></span>}
        </div>
        <form action="/" className="min-w-0 space-y-2">
          <Label htmlFor="calendar-date">Ir para uma data</Label>
          <div className="flex flex-wrap gap-2">
            <input id="calendar-date" name="date" type="date" required min="0001-01-01" max="9999-12-31" defaultValue={selectedDate} key={selectedDate} className="min-h-11 min-w-0 max-w-full flex-1 rounded-control border border-text-secondary bg-surface px-3 py-2 text-base tabular-nums sm:w-44" />
            <Button type="submit" variant="secondary">Ir</Button>
          </div>
        </form>
      </div>
      <div className="space-y-2">
        <Button disabled className="w-full"><Plus aria-hidden="true" className="size-4" />Nova atividade</Button>
        <p className="text-xs text-text-secondary">Criação disponível em breve.</p>
      </div>
    </div>
  );
}
