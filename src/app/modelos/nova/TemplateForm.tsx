"use client";

import { FormSurface } from "../../../components/ui/FormSurface";
import Link from "next/link";
import { Copy, Trash2 } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { Label } from "../../../components/ui/Label";
import { FieldError } from "../../../components/ui/FieldError";
import { validateTemplate, weekdays } from "../../../lib/template-input";
import { createTemplateAction } from "./actions";
import type { TemplateDraft, TemplateItemDraft, TemplateFormState } from "./state";

const control = "min-h-11 w-full min-w-0 rounded-control border border-field bg-background/50 px-3 py-2 transition-[border-color,background-color] duration-150 focus:border-primary focus:bg-surface disabled:cursor-not-allowed disabled:bg-background disabled:text-text-secondary motion-reduce:transition-none text-base aria-invalid:border-error disabled:bg-background disabled:text-text-secondary";
const labels = { weekday: "Dia da semana", type: "Categoria", title: "Título", description: "Descrição (opcional)", startTime: "Início (opcional)", endTime: "Fim (opcional)" };

function focusField(element?: HTMLElement | null) {
  const details = element?.closest("details");
  if (details) details.open = true;
  element?.focus();
}

interface TemplateFormProps {
  initialDraft?: TemplateDraft;
  saveAction?: (previous: TemplateFormState, formData: FormData) => Promise<TemplateFormState>;
  detailHref?: string;
}

export function TemplateForm({ initialDraft, saveAction, detailHref = "/modelos" }: TemplateFormProps) {
  const editing = Boolean(initialDraft);
  const [draft, setDraft] = useState<TemplateDraft>(initialDraft ?? { name: "", items: [] });
  const [state, action, pending] = useActionState(saveAction ?? createTemplateAction, {} as TemplateFormState);
  const [localErrors, setLocalErrors] = useState<Record<string, string>>();
  const errors = localErrors ?? state.errors;
  const form = useRef<HTMLFormElement>(null);
  const submitted = useRef(false);
  const nextKey = useRef(initialDraft?.items.length ?? 0);
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
      if (state.errors) focusField(form.current?.querySelector<HTMLElement>("[aria-invalid=true]") ?? form.current?.querySelector<HTMLElement>("#items"));
      else if (state.message) form.current?.querySelector<HTMLElement>("[role=alert]")?.focus();
    }
  }, [pending, state]);

  function submit(event: FormEvent<HTMLFormElement>) {
    if (pending || submitted.current) { event.preventDefault(); return; }
    const validation = validateTemplate(draft, initialDraft);
    setLocalErrors(validation);
    const first = Object.keys(validation)[0];
    if (first) {
      event.preventDefault();
      focusField(form.current?.querySelector<HTMLElement>(`[id="${first}"]`));
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

  function duplicateItem(item: TemplateItemDraft) {
    if (draft.items.length >= 200) return;
    const key = String(nextKey.current++);
    const index = draft.items.findIndex((entry) => entry.key === item.key);
    focusTarget.current = `item-${key}-title`;
    setDraft({ ...draft, items: [...draft.items.slice(0, index + 1), { ...item, key }, ...draft.items.slice(index + 1)] });
  }

  function field(item: TemplateItemDraft, key: keyof typeof labels) {
    const id = `item-${item.key}-${key}`;
    const options = key === "weekday" ? weekdays.map((day, index) => [String(index + 1), day]) : key === "type" ? [["TASK", "Tarefa"], ["EVENT", "Evento"]] : null;
    const update = (value: string) => setDraft({ ...draft, items: draft.items.map((entry) => entry.key === item.key ? { ...entry, [key]: value } : entry) });
    return <div key={key} className={`min-w-0 space-y-1 ${key === "title" || key === "description" ? "sm:col-span-2" : ""}`}>
      <Label htmlFor={id}>{labels[key]}</Label>
      {options ? <select id={id} name={id} value={item[key]} onChange={(event) => update(event.target.value)} aria-invalid={Boolean(errors?.[id]) || undefined} aria-describedby={errors?.[id] ? `${id}-error` : undefined} className={control}>{options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        : key === "description" ? <textarea id={id} name={id} rows={2} maxLength={10000} value={item[key]} onChange={(event) => update(event.target.value)} aria-invalid={Boolean(errors?.[id]) || undefined} aria-describedby={errors?.[id] ? `${id}-error` : undefined} className={`${control} resize-y`} />
        : <input id={id} name={id} type={key === "title" ? "text" : "time"} required={key === "title"} maxLength={key === "title" ? 200 : undefined} value={item[key]} onChange={(event) => update(event.target.value)} aria-invalid={Boolean(errors?.[id]) || undefined} aria-describedby={errors?.[id] ? `${id}-error` : undefined} className={control} />}
      {errors?.[id] && <FieldError id={`${id}-error`}>{errors[id]}</FieldError>}
    </div>;
  }

  return <FormSurface ref={form} action={action} onSubmit={submit} noValidate className="space-y-6">
    {state.message && <div role="alert" tabIndex={-1} className="space-y-2 rounded-control bg-error-soft p-3 text-sm text-error"><p>{state.message}</p>{(state.expired || state.uncertain || state.stale) && <a href={state.expired ? "/login" : detailHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center font-semibold ">{state.expired ? "Abrir login em outra aba" : editing ? "Conferir modelo em outra aba" : "Conferir modelos em outra aba"}</a>}</div>}
    <fieldset disabled={pending} className="min-w-0 space-y-6">
      <legend className="sr-only">Definição do modelo semanal</legend>
      <div className="space-y-2"><Label htmlFor="name">Nome do modelo</Label><input id="name" name="name" required maxLength={100} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} aria-invalid={Boolean(errors?.name) || undefined} aria-describedby={errors?.name ? "name-error" : undefined} className={control} />{errors?.name && <FieldError id="name-error">{errors.name}</FieldError>}</div>
      <div className="space-y-2 border-t border-border pt-5"><h2 className="font-semibold">Itens da semana</h2><p className="text-sm text-text-secondary">Defina o dia de cada atividade. Deixe os horários vazios para uma atividade sem horário, ou informe apenas o início.</p><p role="status" className="text-sm tabular-nums text-text-secondary">{draft.items.length} de 200 itens</p><div id="items" tabIndex={-1}>{errors?.items && <FieldError role="alert">{errors.items}</FieldError>}</div></div>
      {draft.items.length === 0 && <p className="text-sm text-text-secondary">{editing ? "Ao salvar, o modelo ficará sem itens. As atividades já criadas não serão removidas." : "Nenhum item adicionado. Você pode criar um modelo vazio ou adicionar a primeira atividade abaixo."}</p>}
      <div className="space-y-4">{draft.items.map((item, index) => <fieldset key={item.key} className="min-w-0 space-y-3 border-t border-border pt-2">
        <legend className="sr-only">Item {index + 1}</legend>
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">Item {index + 1}</h3>
          <div className="flex items-center">
            <button type="button" onClick={() => duplicateItem(item)} disabled={draft.items.length >= 200} aria-label={`Duplicar item ${index + 1}`} title="Duplicar item" className="inline-flex size-9 items-center justify-center rounded-control text-text-secondary enabled:hover:bg-background enabled:hover:text-primary disabled:opacity-40"><Copy className="size-4" aria-hidden="true" /></button>
            <button type="button" onClick={() => removeItem(item.key)} aria-label={`Remover item ${index + 1}`} title="Remover item" className="inline-flex size-9 items-center justify-center rounded-control text-text-secondary enabled:hover:bg-error-soft enabled:hover:text-error disabled:opacity-40"><Trash2 className="size-4" aria-hidden="true" /></button>
          </div>
        </div>
        <input type="hidden" name="itemKey" value={item.key} />
        <div className="grid min-w-0 gap-3 sm:grid-cols-2">{field(item, "title")}{field(item, "weekday")}{field(item, "type")}</div>
        <details open={Boolean(item.startTime || item.endTime || item.description || errors?.[`item-${item.key}-startTime`] || errors?.[`item-${item.key}-endTime`] || errors?.[`item-${item.key}-description`])}>
          <summary className="w-fit cursor-pointer rounded-control py-2 text-sm font-medium text-primary">Horários e descrição <span className="font-normal text-text-secondary">(opcional)</span></summary>
          <div className="grid min-w-0 gap-3 pt-2 sm:grid-cols-2">{field(item, "startTime")}{field(item, "endTime")}{field(item, "description")}</div>
        </details>
      </fieldset>)}</div>
      <button id="add-item" type="button" disabled={draft.items.length >= 200} onClick={addItem} className="inline-flex min-h-11 items-center rounded-control border border-field px-4 py-2 text-sm font-semibold text-primary enabled:hover:bg-background disabled:text-text-secondary">Adicionar item</button>
    </fieldset>
    <div className="flex flex-wrap justify-end items-center gap-4 border-t border-border pt-5">{!pending && <Link href={detailHref} className="inline-flex min-h-11 items-center rounded-control text-sm font-semibold text-primary  ">{editing ? "Voltar ao modelo" : "Voltar aos modelos"}</Link>}<Button type="submit" loading={pending} loadingLabel={editing ? "Salvando…" : "Criando…"}>{editing ? "Salvar alterações" : "Criar modelo"}</Button></div>
    <p className="text-sm text-text-secondary">{editing ? "As alterações valem para futuras aplicações do modelo. Semanas já preenchidas não são atualizadas ao salvar ou reaplicar o modelo." : "Criar o modelo não adiciona atividades ao calendário."}</p>
  </FormSurface>;
}
