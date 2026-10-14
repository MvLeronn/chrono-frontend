"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { calendarHref, defaultRange, isValidRange, shiftRange } from "../../lib/calendar-date";
import { Label } from "../ui/Label";
import type { CalendarRange } from "../../models/calendar";

interface CalendarToolbarProps {
  children?: ReactNode;
  range: CalendarRange;
  today: string;
}

const navigationClass = "inline-flex min-h-11 min-w-11 items-center justify-center rounded-control bg-surface px-3 text-sm font-semibold hover:bg-background";
const inputClass = "min-h-11 w-36 min-w-0 max-w-full rounded-control border border-border bg-surface px-2 py-2 text-sm tabular-nums";

export function CalendarToolbar({ range, today, children }: CalendarToolbarProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [invalidRange, setInvalidRange] = useState(false);
  const previous = shiftRange(range, -1);
  const next = shiftRange(range, 1);
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border p-3 md:gap-3 md:px-4">
      <h2 className="text-lg font-semibold">Agenda</h2>
      <div className="flex items-center gap-1" role="group" aria-label="Navegar entre períodos">
        {previous ? <Link href={calendarHref(previous)} prefetch={false} aria-label="Período anterior" className={navigationClass}><ChevronLeft aria-hidden="true" className="size-4" /></Link> : <button disabled aria-label="Período anterior" className="size-11 text-text-secondary"><ChevronLeft aria-hidden="true" className="mx-auto size-4" /></button>}
        <Link href={calendarHref(defaultRange(today))} prefetch={false} className={navigationClass}>Hoje</Link>
        {next ? <Link href={calendarHref(next)} prefetch={false} aria-label="Próximo período" className={navigationClass}><ChevronRight aria-hidden="true" className="size-4" /></Link> : <button disabled aria-label="Próximo período" className="size-11 text-text-secondary"><ChevronRight aria-hidden="true" className="mx-auto size-4" /></button>}
      </div>
      <form action="/" aria-busy={pending} onSubmit={(event) => event.preventDefault()} onChange={(event) => {
        const form = event.currentTarget;
        if (!form.checkValidity()) return;
        const data = new FormData(form);
        const selected = { from: String(data.get("from")), to: String(data.get("to")) };
        const valid = isValidRange(selected);
        setInvalidRange(!valid);
        if (valid && (selected.from !== range.from || selected.to !== range.to)) {
          startTransition(() => router.push(calendarHref(selected), { scroll: false }));
        }
      }} className="order-last w-full min-w-0" key={`${range.from}:${range.to}`}>
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <div className="flex min-w-0 items-center gap-2"><Label htmlFor="calendar-from">De</Label><input id="calendar-from" name="from" type="date" required min="0001-01-01" max="9999-12-31" defaultValue={range.from} className={inputClass} /></div>
          <div className="flex min-w-0 items-center gap-2"><Label htmlFor="calendar-to">Até</Label><input id="calendar-to" name="to" type="date" required min="0001-01-01" max="9999-12-31" defaultValue={range.to} className={inputClass} /></div>
        </div>
        {invalidRange && <p role="status" className="mt-2 text-sm text-text-secondary">Selecione uma data final igual ou posterior à inicial, com período de até 366 dias.</p>}
      </form>
      {children}
    </div>
  );
}
