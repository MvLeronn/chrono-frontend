"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { Label } from "../../../components/ui/Label";
import { FieldError } from "../../../components/ui/FieldError";
import { frequencies, validateRecurring } from "../../../lib/recurring-input";
import { parseCalendarDate, formatCalendarDate } from "../../../lib/calendar-date";
import { createRecurringAction } from "./actions";
import type { RecurringDraft, RecurringFormState } from "./state";

interface RecurringFormProps {
  date: string;
}

const control = "min-h-11 w-full min-w-0 rounded-control border border-text-secondary bg-surface px-3 py-2 text-base aria-invalid:border-error";
const labels: Record<keyof RecurringDraft, string> = { title: "Título", type: "Categoria", description: "Descrição (opcional)", startDate: "Data de referência (primeira ocorrência)", startTime: "Início (opcional)", endTime: "Fim (opcional)", frequency: "Frequência", interval: "Repetir a cada", termination: "Término", until: "Última data permitida (inclusive)", count: "Quantidade de ocorrências" };

export function RecurringForm({ date }: RecurringFormProps) {
  const [draft, setDraft] = useState<RecurringDraft>({ title: "", type: "TASK", description: "", startDate: date, startTime: "", endTime: "", frequency: "WEEKLY", interval: "1", termination: "none", until: "", count: "1" });
  const [state, action, pending] = useActionState(createRecurringAction, {} as RecurringFormState);
  const [localErrors, setLocalErrors] = useState<RecurringFormState["errors"]>();
  const errors = localErrors ?? state.errors;
  const form = useRef<HTMLFormElement>(null);
  const submitted = useRef(false);
  useEffect(() => {
    if (!pending) {
      submitted.current = false;
      if (state.errors) form.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
      else if (state.message) form.current?.querySelector<HTMLElement>("[role=alert]")?.focus();
    }
  }, [pending, state]);
  function submit(event: FormEvent<HTMLFormElement>) {
    if (pending || submitted.current) { event.preventDefault(); return; }
    const validation = validateRecurring(draft);
    setLocalErrors(validation);
    const first = Object.keys(validation)[0];
    if (first) { event.preventDefault(); form.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus(); return; }
    setLocalErrors(undefined);
    submitted.current = true;
  }
  function field(key: keyof RecurringDraft) {
    const options = key === "type" ? [["TASK", "Tarefa"], ["EVENT", "Evento"]] : key === "frequency" ? Object.entries(frequencies) : key === "termination" ? [["none", "Sem limite"], ["until", "Até uma data"], ["count", "Por quantidade"]] : null;
    const numeric = key === "interval" || key === "count";
    const dateField = key === "startDate" || key === "until";
    return <div key={key} className={`min-w-0 space-y-2 ${key === "title" || key === "description" || key === "startDate" ? "sm:col-span-2" : ""}`}>
      <Label htmlFor={`recurring-${key}`}>{labels[key]}</Label>
      {options ? <select id={`recurring-${key}`} name={key} value={draft[key]} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} aria-invalid={Boolean(errors?.[key]) || undefined} aria-describedby={errors?.[key] ? `error-${key}` : undefined} className={control}>{options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        : key === "description" ? <textarea id={`recurring-${key}`} name={key} rows={4} maxLength={10000} value={draft[key]} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} aria-invalid={Boolean(errors?.[key]) || undefined} aria-describedby={errors?.[key] ? `error-${key}` : undefined} className={`${control} resize-y`} />
        : <input id={`recurring-${key}`} name={key} type={dateField ? "date" : numeric ? "number" : key === "startTime" || key === "endTime" ? "time" : "text"} value={draft[key]} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} min={dateField ? "0001-01-01" : numeric ? 1 : undefined} max={dateField ? "9999-12-31" : key === "interval" ? 10000 : key === "count" ? 1000000 : undefined} step={numeric ? 1 : undefined} maxLength={key === "title" ? 200 : undefined} required={key === "title" || dateField || numeric} aria-invalid={Boolean(errors?.[key]) || undefined} aria-describedby={errors?.[key] ? `error-${key}` : undefined} className={control} />}
      {key === "interval" && <p className="text-sm text-text-secondary">{draft.frequency === "DAILY" ? "dia(s)" : draft.frequency === "WEEKLY" ? "semana(s)" : draft.frequency === "MONTHLY" ? "mês(es)" : "ano(s)"}</p>}
      {errors?.[key] && <FieldError id={`error-${key}`} role="alert">{errors[key]}</FieldError>}
    </div>;
  }
  return <form ref={form} action={action} onSubmit={submit} noValidate className="space-y-6 rounded-surface border border-border bg-surface p-4 sm:p-6">
    {state.message && <div role="alert" tabIndex={-1} className="space-y-2 rounded-control bg-error-soft p-3 text-sm text-error"><p>{state.message}</p>{(state.expired || state.uncertain) && <a href={state.expired ? "/login" : "/recorrencias"} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center font-semibold underline">{state.expired ? "Abrir login em outra aba" : "Conferir recorrências em outra aba"}</a>}</div>}
    <fieldset disabled={pending} className="grid min-w-0 gap-4 sm:grid-cols-2"><legend className="mb-4 font-semibold">Atividade</legend>{field("title")}{field("type")}{field("description")}{field("startTime")}{field("endTime")}<p className="text-sm text-text-secondary sm:col-span-2">Deixe ambos os horários vazios para uma atividade sem horário. Você também pode informar apenas o início.</p></fieldset>
    <fieldset disabled={pending} className="grid min-w-0 gap-4 border-t border-border pt-5 sm:grid-cols-2"><legend className="font-semibold">Repetição</legend>{field("startDate")}{field("frequency")}{field("interval")}
      <div className="space-y-2 text-sm text-text-secondary sm:col-span-2" aria-live="polite"><p>A data de referência define o padrão de repetição. Pode ser uma data passada.</p>{draft.frequency === "WEEKLY" && parseCalendarDate(draft.startDate) && <p>Dia da semana: {formatCalendarDate(draft.startDate, { weekday: "long" })}. Cada semana selecionada tem uma ocorrência.</p>}{(draft.frequency === "MONTHLY" || draft.frequency === "YEARLY") && <p>Se o dia não existir no mês ou ano, será usado o último dia válido, preservando a referência nas próximas repetições. Por exemplo, dia 31 pode virar 28/29 em fevereiro; 29/02 volta nos anos bissextos.</p>}</div>
    </fieldset>
    <fieldset disabled={pending} className="grid min-w-0 gap-4 border-t border-border pt-5 sm:grid-cols-2"><legend className="font-semibold">Até quando repetir</legend>{field("termination")}{draft.termination === "until" && field("until")}{draft.termination === "count" && field("count")}<p className="text-sm text-text-secondary sm:col-span-2">{draft.termination === "count" ? "A quantidade inclui a primeira ocorrência e conta a partir da data de referência. Cancelar ou reagendar uma ocorrência não altera essa contagem." : draft.termination === "until" ? "A data final é inclusiva: ocorrências que coincidam com ela podem acontecer." : "As repetições continuam enquanto houver datas válidas, até o ano 9999."}</p></fieldset>
    <div className="flex flex-wrap items-center gap-4"><Button type="submit" loading={pending} loadingLabel="Criando…">Criar recorrência</Button>{!pending && <Link href="/recorrencias" className="inline-flex min-h-11 items-center text-sm font-semibold text-primary underline">Cancelar</Link>}</div><p role="status" className="sr-only">{pending ? "Criando recorrência…" : ""}</p>
  </form>;
}

