"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { Label } from "../../../components/ui/Label";
import { FieldError } from "../../../components/ui/FieldError";
import { validateTemplate, weekdays } from "../../../lib/template-input";
import { createTemplateAction } from "./actions";
import type { TemplateDraft, TemplateItemDraft, TemplateFormState } from "./state";

const control = "min-h-11 w-full min-w-0 rounded-control border border-text-secondary bg-surface px-3 py-2 text-base aria-invalid:border-error disabled:bg-background disabled:text-text-secondary";
const labels = { weekday: "Dia da semana", type: "Categoria", title: "Título", description: "Descrição (opcional)", startTime: "Início (opcional)", endTime: "Fim (opcional)" };

export function TemplateForm() {
  const [draft, setDraft] = useState<TemplateDraft>({ name: "", items: [] });
  const [state, action, pending] = useActionState(createTemplateAction, {} as TemplateFormState);
  const [localErrors, setLocalErrors] = useState<Record<string, string>>();
  const errors = localErrors ?? state.errors;
  const form = useRef<HTMLFormElement>(null);
  const submitted = useRef(false);
  const nextKey = useRef(0);
  const focusTarget = useRef<string | null>(null);

  useEffect(() => {
    if (focusTarget.current) {
      form.current?.querySelector<HTMLElement>(`[id="${focusTarget.current}"]`)?.focus();
      focusTarget.current = null;
    }
  }, [draft.items]);

  useEffect(() => {
    if (!pending) {
      submitted.current = false;
      if (state.errors) (form.current?.querySelector<HTMLElement>("[aria-invalid=true]") ?? form.current?.querySelector<HTMLElement>("#items"))?.focus();
      else if (state.message) form.current?.querySelector<HTMLElement>("[role=alert]")?.focus();
    }
  }, [pending, state]);

  function submit(event: FormEvent<HTMLFormElement>) {
    if (pending || submitted.current) { event.preventDefault(); return; }
    const validation = validateTemplate(draft);
    setLocalErrors(validation);
    const first = Object.keys(validation)[0];
    if (first) {
      event.preventDefault();
      form.current?.querySelector<HTMLElement>(`[id="${first}"]`)?.focus();
      return;
    }
    setLocalErrors(undefined);
    submitted.current = true;
  }

  function addItem() {
    if (draft.items.length >= 200) return;
    const key = String(nextKey.current++);
    focusTarget.current = `item-${key}-title`;
    setDraft({ ...draft, items: [...draft.items, { key, title: "", type: "TASK", weekday: "1", description: "", startTime: "", endTime: "" }] });
  }

  function removeItem(key: string) {
    const index = draft.items.findIndex((item) => item.key === key);
    const neighbor = draft.items[index + 1] ?? draft.items[index - 1];
    focusTarget.current = neighbor ? `item-${neighbor.key}-title` : "add-item";
    setDraft({ ...draft, items: draft.items.filter((item) => item.key !== key) });
  }

  function field(item: TemplateItemDraft, key: keyof typeof labels) {
    const id = `item-${item.key}-${key}`;
    const options = key === "weekday" ? weekdays.map((day, index) => [String(index + 1), day]) : key === "type" ? [["TASK", "Tarefa"], ["EVENT", "Evento"]] : null;
    const update = (value: string) => setDraft({ ...draft, items: draft.items.map((entry) => entry.key === item.key ? { ...entry, [key]: value } : entry) });
    return <div key={key} className={`min-w-0 space-y-2 ${key === "title" || key === "description" ? "sm:col-span-2" : ""}`}>
      <Label htmlFor={id}>{labels[key]}</Label>
      {options ? <select id={id} name={id} value={item[key]} onChange={(event) => update(event.target.value)} aria-invalid={Boolean(errors?.[id]) || undefined} aria-describedby={errors?.[id] ? `${id}-error` : undefined} className={control}>{options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        : key === "description" ? <textarea id={id} name={id} rows={3} maxLength={10000} value={item[key]} onChange={(event) => update(event.target.value)} aria-invalid={Boolean(errors?.[id]) || undefined} aria-describedby={errors?.[id] ? `${id}-error` : undefined} className={`${control} resize-y`} />
        : <input id={id} name={id} type={key === "title" ? "text" : "time"} required={key === "title"} maxLength={key === "title" ? 200 : undefined} value={item[key]} onChange={(event) => update(event.target.value)} aria-invalid={Boolean(errors?.[id]) || undefined} aria-describedby={errors?.[id] ? `${id}-error` : undefined} className={control} />}
      {errors?.[id] && <FieldError id={`${id}-error`}>{errors[id]}</FieldError>}
    </div>;
  }

  return <form ref={form} action={action} onSubmit={submit} noValidate className="space-y-6 rounded-surface border border-border bg-surface p-4 sm:p-6">
    {state.message && <div role="alert" tabIndex={-1} className="space-y-2 rounded-control bg-error-soft p-3 text-sm text-error"><p>{state.message}</p>{(state.expired || state.uncertain) && <a href={state.expired ? "/login" : "/modelos"} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center font-semibold underline">{state.expired ? "Abrir login em outra aba" : "Conferir modelos em outra aba"}</a>}</div>}
    <fieldset disabled={pending} className="min-w-0 space-y-6">
      <legend className="sr-only">Definição do modelo semanal</legend>
      <div className="space-y-2"><Label htmlFor="name">Nome do modelo</Label><input id="name" name="name" required maxLength={100} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} aria-invalid={Boolean(errors?.name) || undefined} aria-describedby={errors?.name ? "name-error" : undefined} className={control} />{errors?.name && <FieldError id="name-error">{errors.name}</FieldError>}</div>
      <div className="space-y-2 border-t border-border pt-5"><h2 className="font-semibold">Itens da semana</h2><p className="text-sm text-text-secondary">Defina o dia de cada atividade. Deixe os horários vazios para uma atividade sem horário, ou informe apenas o início.</p><p role="status" className="text-sm tabular-nums text-text-secondary">{draft.items.length} de 200 itens</p><div id="items" tabIndex={-1}>{errors?.items && <FieldError role="alert">{errors.items}</FieldError>}</div></div>
      {draft.items.length === 0 && <p className="text-sm text-text-secondary">Nenhum item adicionado. Você pode criar um modelo vazio ou adicionar a primeira atividade abaixo.</p>}
      <div className="space-y-6">{draft.items.map((item, index) => <fieldset key={item.key} className="grid min-w-0 gap-4 border-t border-border pt-4 sm:grid-cols-2">
        <legend className="pr-3 text-sm font-semibold">Item {index + 1}</legend>
        <input type="hidden" name="itemKey" value={item.key} />
        {field(item, "title")}{field(item, "weekday")}{field(item, "type")}{field(item, "startTime")}{field(item, "endTime")}{field(item, "description")}
        <div className="sm:col-span-2"><Button variant="secondary" onClick={() => removeItem(item.key)}>Remover item {index + 1}</Button></div>
      </fieldset>)}</div>
      <button id="add-item" type="button" disabled={draft.items.length >= 200} onClick={addItem} className="inline-flex min-h-11 items-center rounded-control border border-text-secondary px-4 py-2 text-sm font-semibold text-primary enabled:hover:bg-background disabled:text-text-secondary">Adicionar item</button>
    </fieldset>
    <div className="flex flex-wrap items-center gap-4 border-t border-border pt-5"><Button type="submit" loading={pending} loadingLabel="Criando…">Criar modelo</Button>{!pending && <Link href="/modelos" className="inline-flex min-h-11 items-center rounded-control text-sm font-semibold text-primary underline underline-offset-4">Voltar aos modelos</Link>}</div>
    <p className="text-sm text-text-secondary">Criar o modelo não adiciona atividades ao calendário.</p>
  </form>;
}
