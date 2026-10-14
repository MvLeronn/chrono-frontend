"use client";

import { useCallback, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { EventForm } from "../../app/atividades/nova/EventForm";
import { createCalendarEventAction } from "../../app/atividades/nova/actions";
import { formatCalendarDate } from "../../lib/calendar-date";

export function CreateActivity({ date, compact = false }: { date: string; compact?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const router = useRouter();
  const label = formatCalendarDate(date, { day: "numeric", month: "long", year: "numeric" });
  function busy() { return Boolean(dialog.current?.querySelector('[aria-busy="true"]')); }
  function close() { if (!busy()) dialog.current?.close(); }
  const saved = useCallback(() => {
    dialog.current?.close();
    router.refresh();
  }, [router]);
  return <>
    <button type="button" aria-haspopup="dialog" aria-label={`Criar tarefa ou evento em ${label}`} title="Criar tarefa ou evento" onClick={() => { setOpen(true); dialog.current?.showModal(); }} className={compact ? "group relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full text-primary sm:size-11" : "inline-flex min-h-11 items-center gap-2 rounded-control text-sm font-semibold text-primary  "}>
      <span className={compact ? "flex size-7 items-center justify-center rounded-control transition-[background-color,box-shadow] duration-150 group-hover:bg-primary/10 group-hover:shadow-sm group-hover:shadow-primary/20 group-focus-visible:bg-primary/10 group-focus-visible:shadow-sm group-focus-visible:shadow-primary/20 motion-reduce:transition-none" : ""}><Plus aria-hidden="true" className="size-4" /></span>{!compact && "Criar neste dia"}
    </button>
    <dialog ref={dialog} aria-labelledby={titleId} onClose={() => setOpen(false)} onCancel={(event) => { if (busy()) event.preventDefault(); }} className="activity-modal m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto overscroll-contain rounded-surface border border-border bg-surface p-4 text-left text-text-primary shadow-xl backdrop:bg-text-primary/40 sm:p-6">
      {open && <>
        <header className="sticky top-0 z-30 mb-5 flex items-start justify-between gap-3 bg-surface py-3"><div><h2 id={titleId} className="text-xl font-semibold">Nova tarefa ou evento</h2><p className="mt-1 text-sm text-text-secondary">{label}</p></div><button type="button" onClick={close} aria-label="Fechar criação" className="flex size-11 shrink-0 items-center justify-center rounded-control hover:bg-background"><X aria-hidden="true" className="size-5" /></button></header>
        <EventForm date={date} time="" saveAction={createCalendarEventAction} onCancel={close} onSuccess={saved} />
      </>}
    </dialog>
  </>;
}
