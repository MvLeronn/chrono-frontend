"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "../../../../components/ui/Button";
import { Label } from "../../../../components/ui/Label";
import { FieldError } from "../../../../components/ui/FieldError";
import { InfoDisclosure } from "../../../../components/ui/InfoDisclosure";
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
  onCancel?: () => void;
}

const formatDate = (date: string) => formatCalendarDate(date, { day: "2-digit", month: "2-digit", year: "numeric" });

export function EndRecurringForm({ id, minimum, effectiveFrom, effectiveUntil, saveAction, onCancel }: EndRecurringFormProps) {
  const [date, setDate] = useState(minimum);
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
    submitted.current = true;
  }
  return <form ref={form} action={action} onSubmit={submit} noValidate className={`space-y-3 ${onCancel ? "" : "rounded-surface border border-border bg-surface p-4"}`}>
    <div className="flex items-center justify-between gap-2"><p className="text-sm text-text-secondary">O histórico anterior será mantido.</p><InfoDisclosure label="Informações sobre o encerramento"><p>Não haverá repetições com data original a partir do corte escolhido. Ocorrências anteriores são preservadas, inclusive as reagendadas para depois dele.</p><p>Pode ser qualquer dia a partir de {formatDate(minimum)}. Somente o último trecho de uma série pode ser encerrado.</p><p>Ocorrências com dados salvos a partir do corte impedem o encerramento, mesmo quando pendentes. Escolha uma data posterior ou revise essas ocorrências; nenhum dado é apagado automaticamente.</p>{date === effectiveFrom && <p>O corte coincide com o início: este trecho ficará sem ocorrências.</p>}{effectiveUntil && <p>Limite atual: {formatDate(effectiveUntil)}, inclusive. Uma data posterior mantém o limite existente.</p>}<p>O encerramento não permite reabrir ou estender o trecho.</p></InfoDisclosure></div>
    {state.message && <div role="alert" tabIndex={-1} className="rounded-control bg-error-soft p-3 text-sm text-error"><div className="flex items-start justify-between gap-2"><p>{state.message}</p>{state.conflicts?.length ? <InfoDisclosure label="Ver ocorrências que impedem o encerramento"><ul className="space-y-1">{state.conflicts.map((item, index) => <li key={`${item.occurrenceDate}-${index}`}><a href={occurrenceHref(id, item.occurrenceDate)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-primary underline">{formatDate(item.occurrenceDate)} · {activityStatuses[item.status].label}</a></li>)}</ul></InfoDisclosure> : null}</div>{state.conflicts?.length ? <p className="mt-1 text-xs">Datas: {state.conflicts.slice(0, 3).map((item) => formatDate(item.occurrenceDate)).join(", ")}{state.conflicts.length > 3 ? "…" : ""}</p> : null}{(state.expired || state.uncertain) && <a href={state.expired ? "/login" : `/recorrencias/${id}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center font-semibold underline">{state.expired ? "Entrar novamente" : "Conferir recorrência"}</a>}</div>}
    <fieldset disabled={pending} className="min-w-0 space-y-1"><legend className="sr-only">Data de encerramento</legend><Label htmlFor="end-date">Parar de repetir a partir de</Label><input id="end-date" name="fromDate" type="date" min={minimum} max="9999-12-31" required value={date} onChange={(event) => { setDate(event.target.value); setLocalError(undefined); }} aria-invalid={Boolean(error) || undefined} aria-describedby={error ? "end-date-error" : undefined} className="min-h-11 w-full min-w-0 rounded-control border border-text-secondary bg-surface px-3 py-2 aria-invalid:border-error" />{error && <FieldError id="end-date-error" role="alert">{error}</FieldError>}</fieldset>
    <div className="flex flex-wrap items-center gap-2 pt-2"><Button type="submit" variant="danger" loading={pending} loadingLabel="Encerrando…">Parar de repetir</Button>{!pending && (onCancel ? <Button onClick={onCancel} variant="secondary">Cancelar</Button> : <Link href={`/recorrencias/${id}`} className="inline-flex min-h-11 items-center px-3 text-sm font-semibold text-primary">Cancelar</Link>)}</div><p role="status" className="sr-only">{pending ? "Encerrando recorrência…" : ""}</p>
  </form>;
}
