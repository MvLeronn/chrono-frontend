"use client";

import { useId, useRef, useState } from "react";
import { CircleStop, Pencil, X } from "lucide-react";
import { recurringDraft } from "../../lib/recurring-split";
import { RecurringForm } from "./nova/RecurringForm";
import { StopRecurringForm } from "./StopRecurringForm";
import { editRecurringFromListAction } from "./actions";
import type { RecurringEventResponse } from "../../models/recurring";

interface RecurringCardActionsProps {
  item: RecurringEventResponse;
  nextDate: string | null;
  stopFrom: string | null;
  historical: boolean;
}

export function RecurringCardActions({ item, nextDate, stopFrom, historical }: RecurringCardActionsProps) {
  const [mode, setMode] = useState<"edit" | "stop" | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const unavailable = historical ? "Este trecho é histórico e não possui próximas ocorrências editáveis." : "Não foi possível verificar as próximas ocorrências. Recarregue a página.";
  function open(value: "edit" | "stop") {
    setMode(value);
    dialog.current?.showModal();
  }
  function close() {
    if (!dialog.current?.querySelector('[aria-busy="true"]')) dialog.current?.close();
  }
  const initial = recurringDraft(item);
  const iconClass = "inline-flex size-11 shrink-0 items-center justify-center rounded-control disabled:cursor-not-allowed disabled:text-text-secondary/40";
  return <>
    <div className="flex shrink-0 items-center" role="group" aria-label={`Ações de ${item.title}`}>
      <span title={historical || !nextDate ? unavailable : "Editar"}><button type="button" disabled={historical || !nextDate} onClick={() => open("edit")} aria-label={`Editar ${item.title}${historical ? " — indisponível neste trecho histórico" : ""}`} className={`${iconClass} text-primary enabled:hover:bg-primary-soft`}><Pencil aria-hidden="true" className="size-4" /></button></span>
      <span title={historical || !stopFrom ? unavailable : "Parar de repetir"}><button type="button" disabled={historical || !stopFrom} onClick={() => open("stop")} aria-label={`Parar de repetir ${item.title}${historical ? " — indisponível neste trecho histórico" : ""}`} className={`${iconClass} text-danger enabled:hover:bg-danger-soft`}><CircleStop aria-hidden="true" className="size-4" /></button></span>
    </div>
    <dialog ref={dialog} aria-labelledby={titleId} onClose={() => setMode(null)} onCancel={(event) => { if (dialog.current?.querySelector('[aria-busy="true"]')) event.preventDefault(); }} onClick={(event) => { if (event.target === event.currentTarget) { const bounds = event.currentTarget.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close(); } }} className={`recurring-modal m-auto max-h-[85dvh] w-[calc(100%-2rem)] overscroll-contain overflow-y-auto rounded-surface border border-border bg-surface p-0 text-text-primary shadow-xl backdrop:bg-text-primary/40 ${mode === "edit" ? "max-w-xl" : "max-w-md"}`}>
      {mode && <div className="p-4 sm:p-5">
        <header className="sticky top-0 z-20 mb-2 flex items-start justify-between gap-3 bg-surface pb-2"><div className="min-w-0"><h2 id={titleId} className="text-lg font-semibold">{mode === "edit" ? "Editar recorrência" : "Parar de repetir"}</h2><p className="mt-1 wrap-anywhere text-sm text-text-secondary">{item.title}</p></div><button type="button" onClick={close} aria-label="Fechar modal" className="flex size-11 shrink-0 items-center justify-center rounded-control hover:bg-background"><X aria-hidden="true" className="size-5" /></button></header>
        {mode === "edit" && nextDate && <><RecurringForm date={initial.startDate} initialDraft={initial} splitFrom={nextDate} saveAction={editRecurringFromListAction.bind(null, item.id, nextDate, initial)} onCancel={close} /></>}
        {mode === "stop" && stopFrom && <StopRecurringForm id={item.id} version={item.updatedAt} fromDate={stopFrom} effectiveFrom={item.effectiveFrom} effectiveUntil={item.effectiveUntil} onCancel={close} />}
      </div>}
    </dialog>
  </>;
}
