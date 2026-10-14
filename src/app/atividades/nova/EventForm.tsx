"use client";

import { FormSurface } from "../../../components/ui/FormSurface";
import Link from "next/link";
import { useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { FieldError } from "../../../components/ui/FieldError";
import { dayHref } from "../../../lib/calendar-date";
import { validateEvent } from "../../../lib/event-input";
import { activityStatuses } from "../../../components/calendar/activity-status";
import type { ActivityStatus } from "../../../models/calendar";
import { createEventAction } from "./actions";
import type { EventDraft, EventFormState } from "./state";

interface EventFormProps {
  date: string;
  time: string;
  initialDraft?: EventDraft;
  saveAction?: (previous: EventFormState, formData: FormData) => Promise<EventFormState>;
  cancelHref?: string;
  onCancel?: () => void;
  onSuccess?: () => void;
}

const control = "min-h-11 w-full min-w-0 rounded-control border border-field bg-background/50 px-3 py-2 transition-[border-color,background-color] duration-150 focus:border-primary focus:bg-surface disabled:cursor-not-allowed disabled:bg-background disabled:text-text-secondary motion-reduce:transition-none text-base aria-invalid:border-error";
const labels: Record<keyof EventDraft, string> = { title: "Título", type: "Categoria", date: "Data", startTime: "Início (opcional)", endTime: "Fim (opcional)", status: "Status", description: "Descrição (opcional)" };

export function EventForm({ date, time, initialDraft, saveAction, cancelHref, onCancel, onSuccess }: EventFormProps) {
  const [draft, setDraft] = useState<EventDraft>(initialDraft ?? { title: "", type: "TASK", date, startTime: time, endTime: "", description: "", status: "PENDING" });
  const [state, action, pending] = useActionState(saveAction ?? createEventAction, {} as EventFormState);
  const [localErrors, setLocalErrors] = useState<EventFormState["errors"]>();
  const form = useRef<HTMLFormElement>(null);
  const submitted = useRef(false);
  const errors = localErrors ?? state.errors;
  useEffect(() => {
    if (!pending) {
      submitted.current = false;
      if (state.success) { onSuccess?.(); return; }
      if (state.errors) form.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
      else if (state.message) form.current?.querySelector<HTMLElement>("[role=alert]")?.focus();
    }
  }, [pending, state, onSuccess]);
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
    <FormSurface ref={form} action={action} onSubmit={submit} noValidate embedded={Boolean(onCancel)} className="space-y-6">
      {state.message && <div role="alert" tabIndex={-1} className="space-y-2 rounded-control bg-error-soft p-3 text-sm text-error"><p>{state.message}</p>{(state.uncertain || state.expired) && <a href={state.uncertain ? dayHref(draft.date) : "/login"} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center font-semibold ">{state.uncertain ? "Conferir agenda em outra aba" : "Abrir login em outra aba"}</a>}</div>}
      <fieldset disabled={pending} className="grid min-w-0 gap-4 sm:grid-cols-2">
        <legend className="sr-only">Dados da atividade</legend>
        {(Object.keys(labels) as (keyof EventDraft)[]).map((key) => <div key={key} className={`min-w-0 space-y-2 ${key === "title" || key === "description" || key === "status" ? "sm:col-span-2" : ""}`}>
          <label id={`label-${key}`} htmlFor={key === "type" || key === "status" ? undefined : `event-${key}`} className="text-sm font-semibold">{labels[key]}</label>
          {key === "type" || key === "status" ? (
            <div role="group" aria-labelledby={`label-${key}`} className={`grid gap-2 ${key === "type" ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4"}`}>
              <input type="hidden" name={key} value={draft[key]} />
              {(key === "type" ? [["TASK", "Tarefa"], ["EVENT", "Evento"]] : Object.entries(activityStatuses).map(([value, presentation]) => [value, presentation.label])).map(([value, label]) => {
                const selected = draft[key] === value;
                const colors = key === "status" ? activityStatuses[value as ActivityStatus].className : selected ? "bg-primary-soft text-primary" : "bg-background text-text-secondary";
                return <button key={value} type="button" aria-pressed={selected} onClick={() => update(key, value)} className={`min-h-11 rounded-control border px-2 py-2 text-sm font-semibold ${colors} ${selected ? "border-current ring-1 ring-current" : "border-transparent hover:border-current"}`}>{label}</button>;
              })}
            </div>
          ) : key === "description" ? (
            <textarea id={`event-${key}`} name={key} value={draft[key]} onChange={(event) => update(key, event.target.value)} maxLength={10000} rows={2} aria-invalid={Boolean(errors?.[key]) || undefined} aria-describedby={errors?.[key] ? `error-${key}` : undefined} className={`${control} resize-y`} />
          ) : (
            <input id={`event-${key}`} name={key} type={key === "date" ? "date" : key === "startTime" || key === "endTime" ? "time" : "text"} value={draft[key]} onChange={(event) => update(key, event.target.value)} required={key === "title" || key === "date"} min={key === "date" ? "0001-01-01" : undefined} max={key === "date" ? "9999-12-31" : undefined} maxLength={key === "title" ? 200 : undefined} aria-invalid={Boolean(errors?.[key]) || undefined} aria-describedby={errors?.[key] ? `error-${key}` : undefined} className={control} />
          )}
          {errors?.[key] && <FieldError id={`error-${key}`} role="alert">{errors[key]}</FieldError>}
        </div>)}
      </fieldset>
      <div className="flex flex-wrap justify-end items-center gap-4">{!pending && (onCancel ? <Button variant="secondary" onClick={onCancel}>Cancelar</Button> : <Link href={cancelHref ?? dayHref(date)} className="inline-flex min-h-11 items-center rounded-control text-sm font-semibold text-primary ">{initialDraft ? "Descartar alterações" : "Cancelar"}</Link>)}<Button type="submit" loading={pending} loadingLabel={initialDraft ? "Salvando…" : "Criando…"}>{initialDraft ? "Salvar alterações" : "Criar atividade"}</Button></div>
      <p role="status" className="sr-only">{pending ? "Salvando atividade…" : ""}</p>
    </FormSurface>
  );
}
