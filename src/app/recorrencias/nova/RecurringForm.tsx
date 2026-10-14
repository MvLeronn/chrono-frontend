"use client";

import { FormSurface } from "../../../components/ui/FormSurface";
import Link from "next/link";
import { useActionState, useEffect, useRef, useState, type FormEvent, type ChangeEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { Label } from "../../../components/ui/Label";
import { FieldError } from "../../../components/ui/FieldError";
import { InfoDisclosure } from "../../../components/ui/InfoDisclosure";
import { frequencies, validateRecurring } from "../../../lib/recurring-input";
import { formatCalendarDate } from "../../../lib/calendar-date";
import { createRecurringAction } from "./actions";
import { buildRecurringChanges, recurringSelection } from "../../../lib/recurring-split";
import type { RecurringDraft, RecurringFormState } from "./state";

interface RecurringFormProps {
  date: string;
  initialDraft?: RecurringDraft;
  splitFrom?: string;
  saveAction?: (previous: RecurringFormState, formData: FormData) => Promise<RecurringFormState>;
  onCancel?: () => void;
}

const control = "min-h-11 w-full min-w-0 rounded-control border border-field bg-background/50 px-3 py-2 transition-[border-color,background-color] duration-150 focus:border-primary focus:bg-surface disabled:cursor-not-allowed disabled:bg-background disabled:text-text-secondary motion-reduce:transition-none text-base sm:text-sm aria-invalid:border-error";
const labels: Record<keyof RecurringDraft, string> = { title: "Título", type: "Categoria", description: "Descrição (opcional)", startDate: "Data de referência", startTime: "Início", endTime: "Fim", frequency: "Frequência", interval: "Repetir a cada", termination: "Término", until: "Até", count: "Ocorrências" };

export function RecurringForm({ date, initialDraft, splitFrom, saveAction, onCancel }: RecurringFormProps) {
  const [draft, setDraft] = useState<RecurringDraft>(initialDraft ?? { title: "", type: "TASK", description: "", startDate: date, startTime: "", endTime: "", frequency: "WEEKLY", interval: "1", termination: "none", until: "", count: "1" });
  const [state, action, pending] = useActionState(saveAction ?? createRecurringAction, {} as RecurringFormState);
  const split = initialDraft && splitFrom ? buildRecurringChanges(initialDraft, draft, recurringSelection(initialDraft, draft), splitFrom) : null;
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
    const validation = split?.errors ?? validateRecurring(draft);
    setLocalErrors(validation);
    const first = Object.keys(validation)[0];
    if (first) { event.preventDefault(); form.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus(); return; }
    if (split && !Object.keys(split.changes).length) { event.preventDefault(); setLocalErrors({ title: "Altere pelo menos um campo para salvar." }); return; }
    setLocalErrors(undefined);
    submitted.current = true;
  }
  function field(key: keyof RecurringDraft, wide = false) {
    const options = key === "type" ? [["TASK", "Tarefa"], ["EVENT", "Evento"]] : key === "frequency" ? Object.entries(frequencies) : key === "termination" ? [["none", "Sem limite"], ["until", "Até uma data"], ["count", "Por quantidade"]] : null;
    const numeric = key === "interval" || key === "count";
    const dateField = key === "startDate" || key === "until";
    const common = { id: `recurring-${key}`, name: key, value: draft[key], onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { setDraft({ ...draft, [key]: event.target.value }); setLocalErrors(undefined); }, "aria-invalid": Boolean(errors?.[key]) || undefined, "aria-describedby": errors?.[key] ? `error-${key}` : undefined, className: control };
    return <div key={key} className={`min-w-0 space-y-1 ${wide ? "sm:col-span-2" : ""}`}>
      <Label htmlFor={`recurring-${key}`}>{labels[key]}</Label>
      {key === "type" ? <div role="group" aria-label="Categoria" className="grid grid-cols-2 gap-2"><input type="hidden" name="type" value={draft.type} />{[["TASK", "Tarefa"], ["EVENT", "Evento"]].map(([value, label]) => <button key={value} id={value === "TASK" ? "recurring-type" : undefined} type="button" name="type" aria-pressed={draft.type === value} aria-describedby={common["aria-describedby"]} onClick={() => { setDraft({ ...draft, type: value as RecurringDraft["type"] }); setLocalErrors(undefined); }} className={`min-h-11 rounded-control border px-2 py-2 text-sm font-semibold ${draft.type === value ? "border-current bg-primary-soft text-primary ring-1 ring-current" : "border-transparent bg-background text-text-secondary hover:border-current"}`}>{label}</button>)}</div> : options ? <select {...common}>{options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        : key === "description" ? <textarea {...common} rows={2} maxLength={10000} className={`${control} resize-y`} />
        : <input {...common} type={dateField ? "date" : numeric ? "number" : key === "startTime" || key === "endTime" ? "time" : "text"} min={dateField ? "0001-01-01" : numeric ? 1 : undefined} max={dateField ? "9999-12-31" : key === "interval" ? 10000 : key === "count" ? 1000000 : undefined} step={numeric ? 1 : undefined} maxLength={key === "title" ? 200 : undefined} required={key === "title" || dateField || numeric} />}
      {errors?.[key] && <FieldError id={`error-${key}`} role="alert">{errors[key]}</FieldError>}
    </div>;
  }
  return <FormSurface ref={form} action={action} onSubmit={submit} noValidate embedded={Boolean(onCancel)} compact className="space-y-3">
    {splitFrom && <div className="flex items-center justify-between gap-2"><p className="text-xs text-text-secondary">{splitFrom ? `A partir de ${formatCalendarDate(splitFrom, { day: "2-digit", month: "2-digit", year: "numeric" })}` : "Nova recorrência"}</p><InfoDisclosure label="Informações sobre a recorrência"><p>Altere os campos e salve. Somente os valores modificados serão enviados.</p><p>Na edição pela lista, somente datas após hoje serão alteradas; hoje e as anteriores serão preservadas. Pelo calendário, vale a ocorrência escolhida. A data indicada é a original, mesmo após reagendamento.</p><p>A referência define o padrão da repetição. Alterar frequência ou intervalo inicia um novo padrão a partir da ocorrência escolhida, salvo se você alterar a referência.</p><p>O término e a contagem são preservados quando você não os altera. A contagem inclui a primeira ocorrência e parte da referência original. Quando a referência muda, o serviço ajusta a quantidade restante.</p><p>Deixe os horários vazios para uma atividade sem horário. Datas inexistentes usam o último dia válido do mês, preservando a referência original.</p><p>Personalizações compatíveis e o conteúdo de ocorrências concluídas são preservados. Mudanças incompatíveis com dados salvos são recusadas; nenhum dado é apagado automaticamente.</p></InfoDisclosure></div>}
    {state.message && <div role="alert" tabIndex={-1} className="space-y-2 rounded-control bg-error-soft p-3 text-sm text-error"><p>{state.message}</p>{state.conflicts?.length ? <p>{state.conflicts.map((item) => formatCalendarDate(item.occurrenceDate, { day: "2-digit", month: "2-digit", year: "numeric" })).join(", ")}</p> : null}{(state.expired || state.uncertain) && <a href={state.expired ? "/login" : "/recorrencias"} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center font-semibold ">{state.expired ? "Entrar novamente" : "Conferir recorrências"}</a>}</div>}
    <fieldset disabled={pending} className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2"><legend className="sr-only">Dados da recorrência</legend>
      {field("title", true)}
      {field("type")}{field("startDate")}
      {field("frequency")}{field("interval")}
      <div className={`grid grid-cols-1 items-end gap-4 sm:col-span-2 sm:grid-cols-2`}>{field("termination")}{draft.termination === "until" && field("until")}{draft.termination === "count" && field("count")}</div>
      {field("startTime")}{field("endTime")}{field("description", true)}
      {draft.termination !== "until" && <input type="hidden" name="until" value={draft.until} />}{draft.termination !== "count" && <input type="hidden" name="count" value={draft.count} />}
    </fieldset>
    <div className="sticky bottom-0 flex flex-wrap justify-end items-center gap-4 bg-surface pt-1">{!pending && (onCancel ? <Button onClick={onCancel} variant="secondary">Cancelar</Button> : <Link href="/recorrencias" className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-text-primary hover:bg-background hover:border-field">Cancelar</Link>)}<Button type="submit" loading={pending} loadingLabel={split ? "Salvando…" : "Criando…"}>{split ? "Salvar alterações" : "Criar recorrência"}</Button></div><p role="status" className="sr-only">{pending ? "Salvando recorrência…" : ""}</p>
  </FormSurface>;
}
