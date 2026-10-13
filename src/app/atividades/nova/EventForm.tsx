"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { Label } from "../../../components/ui/Label";
import { FieldError } from "../../../components/ui/FieldError";
import { dayHref } from "../../../lib/calendar-date";
import { validateEvent } from "../../../lib/event-input";
import { createEventAction } from "./actions";
import type { EventDraft, EventFormState } from "./state";

interface EventFormProps {
  date: string;
  time: string;
  initialDraft?: EventDraft;
  saveAction?: (previous: EventFormState, formData: FormData) => Promise<EventFormState>;
  cancelHref?: string;
}

const control = "min-h-11 w-full min-w-0 rounded-control border border-text-secondary bg-surface px-3 py-2 text-base aria-invalid:border-error";
const labels: Record<keyof EventDraft, string> = { title: "Título", type: "Categoria", date: "Data", startTime: "Início (opcional)", endTime: "Fim (opcional)", description: "Descrição (opcional)", status: "Status" };

export function EventForm({ date, time, initialDraft, saveAction, cancelHref }: EventFormProps) {
  const [draft, setDraft] = useState<EventDraft>(initialDraft ?? { title: "", type: "TASK", date, startTime: time, endTime: "", description: "", status: "PENDING" });
  const [state, action, pending] = useActionState(saveAction ?? createEventAction, {} as EventFormState);
  const [localErrors, setLocalErrors] = useState<EventFormState["errors"]>();
  const form = useRef<HTMLFormElement>(null);
  const submitted = useRef(false);
  const errors = localErrors ?? state.errors;
  useEffect(() => {
    if (!pending) {
      submitted.current = false;
      if (state.errors) form.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
      else if (state.message) form.current?.querySelector<HTMLElement>("[role=alert]")?.focus();
    }
  }, [pending, state]);
  function submit(event: FormEvent<HTMLFormElement>) {
    if (pending || submitted.current) { event.preventDefault(); return; }
    const validation = validateEvent(draft);
    setLocalErrors(validation);
    const first = Object.keys(validation)[0];
    if (first) { event.preventDefault(); form.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus(); return; }
    setLocalErrors(undefined);
    submitted.current = true;
  }
  function update(key: keyof EventDraft, value: string) { setDraft((current) => ({ ...current, [key]: value })); }
  return (
    <form ref={form} action={action} onSubmit={submit} noValidate className="space-y-6 rounded-surface border border-border bg-surface p-4 sm:p-6">
      {state.message && <div role="alert" tabIndex={-1} className="space-y-2 rounded-control bg-error-soft p-3 text-sm text-error"><p>{state.message}</p>{(state.uncertain || state.expired) && <a href={state.uncertain ? dayHref(draft.date) : "/login"} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center font-semibold underline">{state.uncertain ? "Conferir agenda em outra aba" : "Abrir login em outra aba"}</a>}</div>}
      <fieldset disabled={pending} className="grid min-w-0 gap-4 sm:grid-cols-2">
        <legend className="sr-only">Dados da atividade</legend>
        {(Object.keys(labels) as (keyof EventDraft)[]).map((key) => <div key={key} className={`min-w-0 space-y-2 ${key === "title" || key === "description" ? "sm:col-span-2" : ""}`}>
          <Label htmlFor={`event-${key}`}>{labels[key]}</Label>
          {key === "type" || key === "status" ? (
            <select id={`event-${key}`} name={key} value={draft[key]} onChange={(event) => update(key, event.target.value)} aria-invalid={Boolean(errors?.[key]) || undefined} aria-describedby={errors?.[key] ? `error-${key}` : undefined} className={control}>
              {(key === "type" ? [["TASK", "Tarefa"], ["EVENT", "Evento"]] : [["PENDING", "Pendente"], ["IN_PROGRESS", "Em andamento"], ["COMPLETED", "Concluído"], ["CANCELED", "Cancelado"]]).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          ) : key === "description" ? (
            <textarea id={`event-${key}`} name={key} value={draft[key]} onChange={(event) => update(key, event.target.value)} maxLength={10000} rows={4} aria-invalid={Boolean(errors?.[key]) || undefined} aria-describedby={errors?.[key] ? `error-${key}` : undefined} className={`${control} resize-y`} />
          ) : (
            <input id={`event-${key}`} name={key} type={key === "date" ? "date" : key === "startTime" || key === "endTime" ? "time" : "text"} value={draft[key]} onChange={(event) => update(key, event.target.value)} required={key === "title" || key === "date"} min={key === "date" ? "0001-01-01" : undefined} max={key === "date" ? "9999-12-31" : undefined} maxLength={key === "title" ? 200 : undefined} aria-invalid={Boolean(errors?.[key]) || undefined} aria-describedby={errors?.[key] ? `error-${key}` : undefined} className={control} />
          )}
          {errors?.[key] && <FieldError id={`error-${key}`} role="alert">{errors[key]}</FieldError>}
        </div>)}
      </fieldset>
      <p className="text-sm text-text-secondary">Deixe os horários vazios para uma atividade sem horário. Você também pode informar apenas o início.</p>
      {initialDraft && <p className="text-sm text-text-secondary">O status Cancelado mantém a atividade no calendário. Para removê-la definitivamente, use Excluir no detalhe.</p>}
      <div className="flex flex-wrap items-center gap-4"><Button type="submit" loading={pending} loadingLabel={initialDraft ? "Salvando…" : "Criando…"}>{initialDraft ? "Salvar alterações" : "Criar atividade"}</Button>{!pending && <Link href={cancelHref ?? dayHref(date)} className="inline-flex min-h-11 items-center rounded-control text-sm font-semibold text-primary underline">{initialDraft ? "Descartar alterações" : "Cancelar"}</Link>}</div>
      <p role="status" className="sr-only">{pending ? "Salvando atividade…" : ""}</p>
    </form>
  );
}
