"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "../../../../components/ui/Button";
import { Label } from "../../../../components/ui/Label";
import { FieldError } from "../../../../components/ui/FieldError";
import { activityStatuses } from "../../../../components/calendar/ActivityRow";
import { formatCalendarDate, parseCalendarDate } from "../../../../lib/calendar-date";
import { occurrenceHref } from "../../../../lib/occurrence-input";
import type { EndRecurringState } from "./state";

interface EndRecurringFormProps {
  id: string;
  minimum: string;
  effectiveFrom: string;
  effectiveUntil: string | null;
  saveAction: (previous: EndRecurringState, formData: FormData) => Promise<EndRecurringState>;
}

const formatDate = (date: string) => formatCalendarDate(date, { day: "numeric", month: "long", year: "numeric" });

export function EndRecurringForm({ id, minimum, effectiveFrom, effectiveUntil, saveAction }: EndRecurringFormProps) {
  const [date, setDate] = useState(minimum);
  const [confirmed, setConfirmed] = useState(false);
  const [state, action, pending] = useActionState(saveAction, {} as EndRecurringState);
  const [localError, setLocalError] = useState<string>();
  const form = useRef<HTMLFormElement>(null);
  const submitted = useRef(false);
  const error = localError ?? state.dateError;
  useEffect(() => {
    if (!pending) {
      submitted.current = false;
      if (state.dateError) form.current?.querySelector<HTMLInputElement>('[name="fromDate"]')?.focus();
      else if (state.message) form.current?.querySelector<HTMLElement>('[role="alert"]')?.focus();
    }
  }, [pending, state]);
  function submit(event: FormEvent<HTMLFormElement>) {
    if (pending || submitted.current) { event.preventDefault(); return; }
    if (!parseCalendarDate(date) || date < minimum) {
      event.preventDefault(); setLocalError(`Escolha uma data a partir de ${formatDate(minimum)}.`); form.current?.querySelector<HTMLInputElement>('[name="fromDate"]')?.focus(); return;
    }
    setLocalError(undefined);
    if (!confirmed) { event.preventDefault(); form.current?.querySelector<HTMLInputElement>('[name="confirm"]')?.focus(); return; }
    submitted.current = true;
  }
  return <form ref={form} action={action} onSubmit={submit} noValidate className="space-y-5 rounded-surface border border-border bg-surface p-4 sm:p-6">
    {state.message && <div role="alert" tabIndex={-1} className="space-y-2 rounded-control bg-error-soft p-3 text-sm text-error"><p>{state.message}</p>{state.conflicts && state.conflicts.length > 0 && <ul className="space-y-2">{state.conflicts.map((item, index) => <li key={`${item.occurrenceDate}-${index}`}><a href={occurrenceHref(id, item.occurrenceDate)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center underline">{formatDate(item.occurrenceDate)} · {activityStatuses[item.status].label} · Abrir em outra aba</a></li>)}</ul>}{(state.expired || state.uncertain) && <a href={state.expired ? "/login" : `/recorrencias/${id}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center font-semibold underline">{state.expired ? "Abrir login em outra aba" : "Conferir detalhe em outra aba"}</a>}</div>}
    <fieldset disabled={pending} className="min-w-0 space-y-5"><legend className="sr-only">Data e confirmação do encerramento</legend>
      <div className="space-y-2"><Label htmlFor="end-date">Não repetir a partir de</Label><input id="end-date" name="fromDate" type="date" min={minimum} max="9999-12-31" required value={date} onChange={(event) => { setDate(event.target.value); setConfirmed(false); setLocalError(undefined); }} aria-invalid={Boolean(error) || undefined} aria-describedby={error ? "end-date-error end-date-hint" : "end-date-hint"} className="min-h-11 w-full min-w-0 rounded-control border border-text-secondary bg-surface px-3 py-2 aria-invalid:border-error" /><p id="end-date-hint" className="text-sm text-text-secondary">Pode ser qualquer dia a partir de {formatDate(minimum)}; não precisa coincidir com uma ocorrência.</p>{error && <FieldError id="end-date-error" role="alert">{error}</FieldError>}</div>
      <div className="space-y-3 text-sm text-text-secondary" aria-live="polite">
        {parseCalendarDate(date) && <p className="font-semibold text-text-primary">Ocorrências com data original em {formatDate(date)} ou depois deixarão de acontecer.</p>}
        <p>As ocorrências com data original anterior ao corte serão preservadas, inclusive as reagendadas para depois dele. A regra e o histórico não serão excluídos.</p>
        <p>Qualquer estado salvo a partir do corte pode impedir o encerramento, inclusive uma ocorrência pendente. Você verá os conflitos antes de decidir como proceder.</p>
        {date === effectiveFrom && <p className="font-semibold text-error">O corte coincide com o início: este trecho ficará sem ocorrências.</p>}
        {effectiveUntil && <p>Limite atual: {formatDate(effectiveUntil)}, inclusive. {parseCalendarDate(date) && date > effectiveUntil ? "A data escolhida não antecipa esse limite; o serviço o manterá sem alteração." : "Você pode antecipar esse limite se não houver conflitos."}</p>}
        <p>Não há ação de reabrir ou estender a recorrência após o encerramento.</p>
      </div>
      <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" name="confirm" value="yes" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} required className="size-5 shrink-0 accent-primary" />Confirmo o encerramento a partir da data escolhida e a preservação do histórico anterior.</label>
    </fieldset>
    <div className="flex flex-wrap items-center gap-4"><Button type="submit" variant="danger" loading={pending} loadingLabel="Encerrando…">Confirmar encerramento</Button>{!pending && <Link href={`/recorrencias/${id}`} className="inline-flex min-h-11 items-center text-sm font-semibold text-primary underline">Cancelar</Link>}</div><p role="status" className="sr-only">{pending ? "Encerrando recorrência…" : ""}</p>
  </form>;
}
