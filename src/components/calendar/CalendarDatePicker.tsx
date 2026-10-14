"use client";

import { useRouter } from "next/navigation";
import { useId, useRef, useState, useTransition } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { adjacentMonth, dayHref, formatCalendarDate, monthGrid, monthHref, weekHref } from "../../lib/calendar-date";

export function CalendarDatePicker({ date, view, inline = false, today }: { date: string; view: "month" | "week" | "day"; inline?: boolean; today?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [month, setMonth] = useState(date);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const picker = useRef<HTMLDivElement>(null);
  const id = useId();
  const { days } = monthGrid(month);
  const previous = adjacentMonth(month, -1);
  const next = adjacentMonth(month, 1);
  return <div className="min-w-0">
    {!inline && <button type="button" popoverTarget={id} disabled={pending} aria-busy={pending} aria-label="Escolher data" title="Escolher data" onClick={(event) => {
      const bounds = event.currentTarget.getBoundingClientRect();
      setMonth(date);
      setPosition({ top: Math.max(8, Math.min(bounds.bottom + 8, window.innerHeight - 360)), left: Math.max(8, Math.min(bounds.left, window.innerWidth - 328)) });
    }} className="inline-flex size-11 items-center justify-center rounded-full text-text-secondary hover:bg-background disabled:opacity-60">
      <CalendarDays aria-hidden="true" className="size-5" />
    </button>}
    <div ref={picker} id={id} popover={inline ? undefined : "auto"} aria-label="Escolher data" aria-busy={pending} style={inline ? undefined : position} className={inline ? "py-3 text-text-primary" : "fixed m-0 max-h-[calc(100dvh-1rem)] w-80 max-w-[calc(100vw-1rem)] overflow-y-auto rounded-surface border border-border bg-surface p-3 text-text-primary shadow-lg"}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <button type="button" disabled={!previous} aria-label="Mês anterior no seletor" onClick={() => previous && setMonth(previous)} className="flex size-11 shrink-0 items-center justify-center rounded-control hover:bg-background disabled:opacity-40"><ChevronLeft aria-hidden="true" className="size-4" /></button>
        <p aria-live="polite" className="text-center text-xs font-semibold first-letter:uppercase">{formatCalendarDate(month, { month: "long", year: "numeric" })}</p>
        <button type="button" disabled={!next} aria-label="Próximo mês no seletor" onClick={() => next && setMonth(next)} className="flex size-11 shrink-0 items-center justify-center rounded-control hover:bg-background disabled:opacity-40"><ChevronRight aria-hidden="true" className="size-4" /></button>
      </div>
      <div className="grid grid-cols-7 text-center">
        {["seg", "ter", "qua", "qui", "sex", "sáb", "dom"].map((day) => <span key={day} className="py-2 text-xs text-text-secondary">{day}</span>)}
        {days.map((day, index) => day ? <button key={day} type="button" disabled={pending} aria-label={formatCalendarDate(day, { day: "numeric", month: "long", year: "numeric" })} aria-current={day === date ? "date" : undefined} onClick={() => {
          if (!inline) picker.current?.hidePopover();
          if (day === date) return;
          const href = view === "month" ? monthHref : view === "week" ? weekHref : dayHref;
          startTransition(() => router.push(href(day), { scroll: false }));
        }} className={`${inline ? "min-h-8 text-xs" : "min-h-10 text-sm"} rounded-full tabular-nums ${day === today ? "bg-primary text-text-on-primary" : day === date ? "bg-primary-soft text-primary" : day.slice(0, 7) === month.slice(0, 7) ? "hover:bg-primary-soft" : "text-text-secondary hover:bg-background"}`}>{Number(day.slice(8))}</button> : <span key={`empty-${index}`} />)}
      </div>
    </div>
  </div>;
}
