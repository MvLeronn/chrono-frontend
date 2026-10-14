"use client";

import { FormSurface } from "../../../../components/ui/FormSurface";
import Link from "next/link";
import { useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "../../../../components/ui/Button";
import { Label } from "../../../../components/ui/Label";
import { FieldError } from "../../../../components/ui/FieldError";
import { buildOccurrenceInput, occurrenceHref } from "../../../../lib/occurrence-input";
import { dayHref, formatCalendarDate } from "../../../../lib/calendar-date";
import type { OccurrenceDraft, OccurrenceFormState, OccurrenceModes, OverrideField, OverrideMode } from "./state";

interface OccurrenceFormProps {
  id: string;
  originalDate: string;
  initial: OccurrenceDraft;
  hasState: boolean;
  onCancel?: () => void;
  onSuccess?: () => void;
  saveAction: (previous: OccurrenceFormState, formData: FormData) => Promise<OccurrenceFormState>;
}

const control = "min-h-11 w-full min-w-0 rounded-control border border-field bg-background/50 px-3 py-2 transition-[border-color,background-color] duration-150 focus:border-primary focus:bg-surface disabled:cursor-not-allowed disabled:bg-background disabled:text-text-secondary motion-reduce:transition-none text-base aria-invalid:border-error disabled:bg-background disabled:text-text-secondary";
const groups: { key: OverrideField; label: string }[] = [
  { key: "title", label: "Título" },
  { key: "type", label: "Categoria" },
  { key: "description", label: "Descrição" },
  { key: "time", label: "Horários" },
];
const labels: Record<keyof OccurrenceDraft, string> = { title: "Título desta ocorrência", type: "Categoria desta ocorrência", description: "Descrição desta ocorrência", date: "Data planejada", startTime: "Início (opcional)", endTime: "Fim (opcional)", status: "Status" };

export function OccurrenceForm({ id, originalDate, initial, hasState, saveAction, onCancel, onSuccess }: OccurrenceFormProps) {
  const [draft, setDraft] = useState(initial);
  const [modes, setModes] = useState<OccurrenceModes>({ title: "keep", type: "keep", description: "keep", time: "keep" });
  const [state, action, pending] = useActionState(saveAction, {} as OccurrenceFormState);
  const [localErrors, setLocalErrors] = useState<OccurrenceFormState["errors"]>();
  const [intent, setIntent] = useState("save");
  const root = useRef<HTMLDivElement>(null);
  const submitted = useRef(false);
  const errors = localErrors ?? state.errors;
  useEffect(() => {
    if (pending) return;
    submitted.current = false;
    if (state.success) { onSuccess?.(); return; }
    if (state.errors) root.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
    else if (state.message) root.current?.querySelector<HTMLElement>("[role=alert]")?.focus();
  }, [pending, state, onSuccess]);

  function submit(event: FormEvent<HTMLFormElement>, nextIntent: "save" | "reset") {
    if (pending || submitted.current) { event.preventDefault(); return; }
    if (nextIntent === "save") {
      const validation = buildOccurrenceInput(initial, draft, modes).errors;
      setLocalErrors(validation);
      const first = Object.keys(validation)[0];
      if (first) { event.preventDefault(); root.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus(); return; }
    }
    setLocalErrors(undefined);
    setIntent(nextIntent);
    submitted.current = true;
  }

  function field(key: keyof OccurrenceDraft, disabled = false) {
    const error = !disabled ? errors?.[key] : undefined;
    return <div className="min-w-0 space-y-2" key={key}>
      <Label htmlFor={`occurrence-${key}`}>{labels[key]}</Label>
      {key === "type" || key === "status" ? <select id={`occurrence-${key}`} name={key} disabled={disabled} value={draft[key]} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} aria-invalid={Boolean(error) || undefined} aria-describedby={error ? `error-${key}` : undefined} className={control}>
        {(key === "type" ? [["TASK", "Tarefa"], ["EVENT", "Evento"]] : [["PENDING", "Pendente"], ["IN_PROGRESS", "Em andamento"], ["COMPLETED", "Concluído"], ["CANCELED", "Cancelado"]]).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select> : key === "description" ? <textarea id={`occurrence-${key}`} name={key} disabled={disabled} value={draft[key]} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} rows={4} maxLength={10000} aria-invalid={Boolean(error) || undefined} aria-describedby={error ? `error-${key}` : undefined} className={`${control} resize-y`} />
        : <input id={`occurrence-${key}`} name={key} disabled={disabled} type={key === "date" ? "date" : key === "startTime" || key === "endTime" ? "time" : "text"} value={draft[key]} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} min={key === "date" ? "0001-01-01" : undefined} max={key === "date" ? "9999-12-31" : undefined} maxLength={key === "title" ? 200 : undefined} required={key === "title" || key === "date"} aria-invalid={Boolean(error) || undefined} aria-describedby={error ? `error-${key}` : undefined} className={control} />}
      {error && <FieldError id={`error-${key}`} role="alert">{error}</FieldError>}
    </div>;
  }

  return <div ref={root} className="space-y-6">
    {state.message && <div role="alert" tabIndex={-1} className="space-y-2 rounded-control bg-error-soft p-3 text-sm text-error"><p>{state.message}</p>{(state.expired || state.uncertain) && <a href={state.expired ? "/login" : occurrenceHref(id, originalDate)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center font-semibold ">{state.expired ? "Abrir login em outra aba" : "Conferir ocorrência em outra aba"}</a>}<Link href="/" className="inline-flex min-h-11 items-center font-semibold ">Voltar ao calendário</Link></div>}
    <FormSurface action={action} onSubmit={(event) => submit(event, "save")} noValidate embedded={Boolean(onCancel)} className="space-y-6">
      <input type="hidden" name="intent" value="save" />
      <fieldset disabled={pending} className="min-w-0 space-y-6">
        <legend className="sr-only">Editar somente esta ocorrência</legend>
        <div className="grid gap-4 sm:grid-cols-2">{field("date")}{field("status")}</div>
        <div className="space-y-2 text-sm text-text-secondary"><p>Data original: {formatCalendarDate(originalDate, { day: "numeric", month: "long", year: "numeric" })}. Alterar a data afeta somente esta ocorrência.</p>{draft.date !== originalDate && <Button variant="secondary" onClick={() => setDraft({ ...draft, date: originalDate })}>Voltar à data original</Button>}<p>O status Cancelado mantém a ocorrência no calendário.</p></div>
        <p className="text-sm text-text-secondary">Mantenha os campos que não deseja alterar. Personalizar vale somente para esta ocorrência; herdar usa os valores da recorrência ao salvar.</p>
        {groups.map(({ key, label }) => <section key={key} aria-labelledby={`group-${key}`} className="space-y-3 border-t border-border pt-5">
          <h2 id={`group-${key}`} className="font-semibold">{label}</h2>
          <p className="whitespace-pre-wrap wrap-anywhere text-sm text-text-secondary">Atual: {key === "time" ? initial.startTime ? `${initial.startTime}${initial.endTime ? ` – ${initial.endTime}` : " · Sem horário de fim"}` : "Sem horário" : key === "type" ? initial.type === "TASK" ? "Tarefa" : "Evento" : initial[key] || "Sem descrição."}</p>
          <Label htmlFor={`mode-${key}`}>Como alterar {label.toLowerCase()}</Label>
          <select id={`mode-${key}`} name={`${key}Mode`} value={modes[key]} onChange={(event) => setModes({ ...modes, [key]: event.target.value as OverrideMode })} className={control}>
            <option value="keep">Manter sem alteração</option><option value="custom">Personalizar esta ocorrência</option><option value="inherit">Herdar da recorrência</option>
          </select>
          {modes[key] === "custom" && <div className={key === "time" ? "grid gap-4 sm:grid-cols-2" : ""}>{key === "time" ? <>{field("startTime")}{field("endTime")}</> : field(key)}</div>}
          {modes[key] === "inherit" && <p className="text-sm text-text-secondary">Ao salvar, qualquer personalização deste campo será removida e o valor da recorrência será aplicado.</p>}
          {key === "description" && modes[key] === "custom" && <p className="text-sm text-text-secondary">Deixe vazio para não ter descrição somente nesta ocorrência. Para usar a descrição da recorrência, escolha Herdar.</p>}
          {key === "time" && modes[key] === "custom" && <p className="text-sm text-text-secondary">Deixe ambos vazios para remover os horários somente desta ocorrência. Você também pode informar apenas o início.</p>}
        </section>)}
      </fieldset>
      <div className="flex flex-wrap justify-end items-center gap-4">{!pending && (onCancel ? <Button variant="secondary" onClick={onCancel}>Cancelar</Button> : <Link href={dayHref(initial.date)} className="inline-flex min-h-11 items-center text-sm font-semibold text-primary ">Voltar ao calendário</Link>)}<Button type="submit" disabled={pending} loading={pending && intent === "save"} loadingLabel="Salvando…">Salvar ocorrência</Button></div>
    </FormSurface>
    {hasState && <section className="border-t border-border pt-3">
      <FormSurface embedded={false} action={action} onSubmit={(event) => submit(event, "reset")} className="mt-2 space-y-4">
        <input type="hidden" name="intent" value="reset" />
        <h2 className="font-semibold">Restaurar ocorrência</h2>
        <p className="text-sm text-text-secondary">Serão removidas todas as personalizações, o reagendamento, o status e a conclusão. A ocorrência voltará à data original, ficará Pendente e herdará os valores da recorrência. Ela continuará no calendário; as demais ocorrências não serão alteradas. Alterações não salvas neste formulário também serão descartadas.</p>
        <fieldset disabled={pending} className="flex justify-end"><legend className="sr-only">Restaurar ocorrência</legend><Button type="submit" variant="danger" disabled={pending} loading={pending && intent === "reset"} loadingLabel="Restaurando…">Restaurar ocorrência</Button></fieldset>
      </FormSurface>
    </section>}
    <p role="status" className="sr-only">{pending ? intent === "reset" ? "Restaurando ocorrência…" : "Salvando ocorrência…" : ""}</p>
  </div>;
}
