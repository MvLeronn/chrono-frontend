"use client";

import { useCallback, useEffect, useId, useRef, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Check, Circle, CircleCheck, CircleSlash, Clock3, LoaderCircle, X } from "lucide-react";
import { Button } from "../ui/Button";
import { formatCalendarDate } from "../../lib/calendar-date";
import { occurrenceDraft } from "../../lib/occurrence-input";
import { activityStatuses } from "./activity-status";
import { changeCalendarActivity } from "./actions";
import type { ActivityStatus, CalendarItem } from "../../models/calendar";

import { EventForm } from "../../app/atividades/nova/EventForm";
import { OccurrenceForm } from "../../app/ocorrencias/[id]/[date]/OccurrenceForm";
import { updateCalendarEventAction } from "../../app/atividades/[id]/actions";
import { updateCalendarOccurrenceAction } from "../../app/ocorrencias/[id]/[date]/actions";
import { eventDraft } from "../../lib/event-input";

const statusIcons = { PENDING: Clock3, IN_PROGRESS: Circle, COMPLETED: CircleCheck, CANCELED: CircleSlash };

export function ActivityDetails({ item, children, className, statusOnly = false }: { item: CalendarItem; children: ReactNode; className?: string; statusOnly?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const statusId = useId();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const editButton = useRef<HTMLButtonElement>(null);
  const [current, setCurrent] = useState(item);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const recurring = current.source === "RECURRING";
  const saved = useCallback(() => {
    dialog.current?.close();
    setEditing(false);
    router.refresh();
  }, [router]);
  useEffect(() => {
    if (editing) {
      dialog.current?.scrollTo(0, 0);
      dialog.current?.querySelector<HTMLElement>("input:not([type=hidden]), select")?.focus();
    }
  }, [editing]);
  function busy() { return pending || Boolean(dialog.current?.querySelector('[aria-busy="true"]')); }
  function open() {
    setEditing(false);
    setCurrent(item);
    setMessage("");
    setError("");
    dialog.current?.showModal();
  }
  function close() { if (!busy()) dialog.current?.close(); }
  function mutate(intent: "status" | "delete", value?: ActivityStatus) {
    setError("");
    setMessage("");
    startTransition(async () => {
      try {
        const target = current.source === "EVENT" ? { source: current.source, id: current.id } : { source: current.source, id: current.recurringEventId, date: current.occurrenceDate };
        const result = await changeCalendarActivity(target, intent, value);
        if (!result.ok) { setError(result.message); return; }
        if (result.item) {
          setCurrent(result.item);
          setMessage("Status atualizado.");
          dialog.current?.close();
        } else {
          dialog.current?.close();
        }
        router.refresh();
      } catch {
        setError("Não foi possível confirmar a alteração. Atualize o calendário antes de tentar novamente.");
      }
    });
  }
  return <>
    <button type="button" onClick={open} aria-haspopup="dialog" aria-label={`${statusOnly ? "Alterar status de" : "Ver detalhes de"} ${item.title}`} className={className}>{children}</button>
    <dialog ref={dialog} aria-labelledby={titleId} onClose={() => setEditing(false)} onCancel={(event) => { if (busy()) event.preventDefault(); }} onClick={(event) => {
      if (event.target !== event.currentTarget) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close();
    }} className="activity-modal pointer-events-auto m-auto max-h-[85dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto overscroll-contain rounded-surface border border-border bg-surface p-0 text-left text-base font-normal text-text-primary shadow-xl backdrop:bg-text-primary/40">
      <div className="space-y-5 p-4 sm:p-6">
        <header className="sticky top-0 z-30 flex items-start justify-between gap-3 bg-surface py-3">
          <div className="min-w-0">{!statusOnly && <p className="mb-1 text-xs font-semibold text-primary">{current.type === "TASK" ? "Tarefa" : "Evento"} · {recurring ? "Recorrência" : current.source === "EVENT" && current.templateApplicationId ? "Modelo semanal" : "Atividade avulsa"}</p>}<h2 id={titleId} className="wrap-anywhere text-xl font-semibold">{statusOnly ? "Alterar status" : editing ? "Editar informações" : current.title}</h2>{statusOnly && <p className="mt-1 wrap-anywhere text-sm text-text-secondary">{current.title}</p>}</div>
          <button type="button" onClick={close} disabled={pending} aria-label="Fechar detalhes" className="flex size-11 shrink-0 items-center justify-center rounded-control hover:bg-background disabled:opacity-50"><X aria-hidden="true" className="size-5" /></button>
        </header>
        {editing ? current.source === "EVENT" ? <EventForm date={current.date} time={current.startTime ?? ""} initialDraft={eventDraft(current)} saveAction={updateCalendarEventAction.bind(null, current.id, eventDraft(current))} onCancel={() => { setEditing(false); requestAnimationFrame(() => editButton.current?.focus()); }} onSuccess={saved} /> : <OccurrenceForm id={current.recurringEventId} originalDate={current.occurrenceDate} initial={occurrenceDraft(current)} hasState={current.id !== null} saveAction={updateCalendarOccurrenceAction.bind(null, current.recurringEventId, current.occurrenceDate, occurrenceDraft(current))} onCancel={() => { setEditing(false); requestAnimationFrame(() => editButton.current?.focus()); }} onSuccess={saved} /> : <>
        {!statusOnly && <div className="rounded-control bg-background p-3 text-sm"><p className="font-semibold"><time dateTime={current.date}>{formatCalendarDate(current.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</time></p><p className="mt-1 tabular-nums text-text-secondary">{current.startTime ? `${current.startTime}${current.endTime ? ` – ${current.endTime}` : " · Sem horário de fim"}` : "Sem horário"}</p>{current.source === "RECURRING" && current.date !== current.occurrenceDate && <p className="mt-2 text-text-secondary">Reagendada da ocorrência de {formatCalendarDate(current.occurrenceDate, { day: "numeric", month: "long", year: "numeric" })}.</p>}</div>}
        <section aria-labelledby={statusId}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 id={statusId} className="text-sm font-semibold">Status</h3>
            <span className="flex items-center gap-1.5 text-xs text-text-secondary">
              {pending ? <><LoaderCircle aria-hidden="true" className="size-3.5 animate-spin motion-reduce:animate-none" />Salvando…</> : recurring ? "Só neste dia" : null}
            </span>
          </div>
          <div role="group" aria-labelledby={statusId} aria-busy={pending} className="grid grid-cols-2 gap-2">
            {(Object.keys(activityStatuses) as ActivityStatus[]).map((value) => {
              const presentation = activityStatuses[value];
              const Icon = statusIcons[value];
              const selected = current.status === value;
              return <button key={value} type="button" aria-pressed={selected} disabled={pending} onClick={() => { if (!selected) mutate("status", value); }} className={`flex min-h-14 items-center gap-2 rounded-control border px-3 py-3 text-left text-sm font-semibold transition-colors motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-60 ${presentation.className} ${selected ? "border-current ring-1 ring-current" : "border-transparent enabled:hover:border-current"}`}>
                <Icon aria-hidden="true" className="size-4 shrink-0" />
                <span className="min-w-0 flex-1">{presentation.label}</span>
                <Check aria-hidden="true" className={`size-4 shrink-0 ${selected ? "visible" : "invisible"}`} />
              </button>;
            })}
          </div>
          <p role="status" className="sr-only">{pending ? "Salvando…" : message}</p>
        </section>
        {!statusOnly && <div><h3 className="text-sm font-semibold">Descrição</h3><p className="mt-2 whitespace-pre-wrap wrap-anywhere text-sm text-text-secondary">{current.description || "Nenhuma descrição adicionada."}</p></div>}
        {error && <p role="alert" className="rounded-control bg-error-soft p-3 text-sm text-error">{error}</p>}
        {!statusOnly && <footer className="border-t border-border pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2"><button ref={editButton} type="button" disabled={pending} onClick={() => setEditing(true)} className="inline-flex min-h-11 items-center rounded-control text-sm font-semibold text-primary   disabled:opacity-50">Editar informações</button><Button variant="danger" disabled={pending} onClick={() => mutate("delete")}>{recurring ? "Excluir apenas este dia" : "Excluir atividade"}</Button></div>
        </footer>}
        </>}
      </div>
    </dialog>
  </>;
}
