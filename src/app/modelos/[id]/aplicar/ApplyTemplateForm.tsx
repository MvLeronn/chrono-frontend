"use client";

import { FormSurface } from "../../../../components/ui/FormSurface";
import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "../../../../components/ui/Button";
import { Label } from "../../../../components/ui/Label";
import { FieldError } from "../../../../components/ui/FieldError";
import { ActivityRow } from "../../../../components/calendar/ActivityRow";
import { formatCalendarDate, weekHref } from "../../../../lib/calendar-date";
import { templateWeekEnd } from "../../../../lib/template-apply";
import type { ApplyTemplateState } from "./state";

interface ApplyTemplateFormProps {
  id: string;
  itemCount: number;
  initialDate: string;
  saveAction: (previous: ApplyTemplateState, formData: FormData) => Promise<ApplyTemplateState>;
}

const formatDate = (date: string) => formatCalendarDate(date, { day: "numeric", month: "long", year: "numeric" });
const link = "inline-flex min-h-11 items-center rounded-control text-sm font-semibold text-primary  ";

export function ApplyTemplateForm({ id, itemCount, initialDate, saveAction }: ApplyTemplateFormProps) {
  const [date, setDate] = useState(initialDate);
  const [state, action, pending] = useActionState(saveAction, {} as ApplyTemplateState);
  const [localError, setLocalError] = useState<string>();
  const form = useRef<HTMLFormElement>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const submitted = useRef(false);
  const error = localError ?? state.dateError;
  const end = templateWeekEnd(date);

  useEffect(() => {
    if (!pending) {
      submitted.current = false;
      if (state.result) resultHeading.current?.focus();
      else if (state.dateError) form.current?.querySelector<HTMLInputElement>('[name="weekStart"]')?.focus();
      else if (state.message) form.current?.querySelector<HTMLElement>('[role="alert"]')?.focus();
    }
  }, [pending, state]);

  function submit(event: FormEvent<HTMLFormElement>) {
    if (pending || submitted.current) { event.preventDefault(); return; }
    if (!end) {
      event.preventDefault();
      setLocalError("Escolha uma segunda-feira cuja semana completa termine até 31/12/9999.");
      form.current?.querySelector<HTMLInputElement>('[name="weekStart"]')?.focus();
      return;
    }
    setLocalError(undefined);
    submitted.current = true;
  }

  if (state.result) {
    const result = state.result;
    const dates = Array.from(new Set(result.events.map((event) => event.date)));
    return <section className="space-y-5 rounded-surface border border-border bg-surface p-4 sm:p-6">
      <div className="space-y-2"><h2 ref={resultHeading} tabIndex={-1} className="text-xl font-semibold">{result.alreadyApplied ? "Modelo já aplicado nesta semana" : "Modelo aplicado"}</h2><p className="text-sm tabular-nums">Segunda-feira, {formatDate(result.weekStart)}, a domingo, {formatDate(templateWeekEnd(result.weekStart)!)}.</p><p role="status" className="rounded-control bg-status-completed-soft p-3 text-sm text-status-completed">{result.alreadyApplied ? "Nenhuma atividade duplicada. A lista mostra as atividades atuais ainda vinculadas à aplicação." : `${result.events.length} ${result.events.length === 1 ? "atividade criada" : "atividades criadas"}. As atividades que já estavam no calendário foram preservadas.`}</p></div>
      {result.alreadyApplied && <p className="text-sm text-text-secondary">Alterações e reagendamentos foram mantidos, inclusive para datas fora desta semana. Atividades removidas não foram recriadas; mudanças posteriores no modelo não foram aplicadas.</p>}
      {result.events.length === 0 && <p className="text-sm text-text-secondary">{result.alreadyApplied ? "Nenhuma atividade permanece vinculada. O modelo pode ter sido aplicado vazio ou suas atividades podem ter sido removidas." : "O modelo vazio foi registrado como aplicado. Adicionar itens ao modelo depois não preencherá esta mesma semana ao reaplicá-lo."}</p>}
      {dates.map((day) => <section key={day} aria-labelledby={`applied-${day}`} className="border-t border-border pt-4"><h3 id={`applied-${day}`} className="text-sm font-semibold text-primary">{formatCalendarDate(day, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</h3><ul>{result.events.filter((event) => event.date === day).map((event) => <ActivityRow key={event.calendarKey} item={event} />)}</ul></section>)}
      <div className="flex flex-wrap gap-4"><Link href={weekHref(result.weekStart)} className={link}>Ver semana no calendário</Link><Link href={`/modelos?modal=TemplateDetails&id=${id}`} className={link}>Voltar ao modelo</Link><a href={`/modelos?modal=ApplyTemplate&id=${id}`} className={link}>Escolher outra semana</a></div>
      <p className="text-xs text-text-secondary">Resultado consultado ao aplicar. Abra os detalhes para consultar alterações posteriores.</p>
    </section>;
  }

  return <FormSurface ref={form} action={action} onSubmit={submit} noValidate className="space-y-5">
    {state.message && <div role="alert" tabIndex={-1} className="space-y-2 rounded-control bg-error-soft p-3 text-sm text-error"><p>{state.message}</p>{(state.expired || state.stale) && <a href={state.expired ? "/login" : `/modelos?modal=TemplateDetails&id=${id}`} target="_blank" rel="noopener noreferrer" className={link}>{state.expired ? "Abrir login em outra aba" : "Conferir modelo em outra aba"}</a>}{state.uncertain && end && <a href={weekHref(date)} target="_blank" rel="noopener noreferrer" className={link}>Conferir semana em outra aba</a>}</div>}
    <fieldset disabled={pending} className="min-w-0 space-y-5"><legend className="sr-only">Semana da aplicação</legend>
      <div className="space-y-2"><Label htmlFor="apply-week">Segunda-feira de início</Label><input id="apply-week" name="weekStart" type="date" min="0001-01-01" max="9999-12-31" required value={date} onChange={(event) => { setDate(event.target.value); setLocalError(undefined); }} aria-invalid={Boolean(error) || undefined} aria-describedby={error ? "apply-week-hint apply-week-error" : "apply-week-hint"} className="min-h-11 w-full min-w-0 rounded-control border border-field bg-background/50 px-3 py-2 transition-[border-color,background-color] duration-150 focus:border-primary focus:bg-surface disabled:cursor-not-allowed disabled:bg-background disabled:text-text-secondary motion-reduce:transition-none aria-invalid:border-error" /><p id="apply-week-hint" className="text-sm text-text-secondary">Escolha uma segunda-feira. Semanas passadas também são permitidas.</p>{error && <FieldError id="apply-week-error" role="alert">{error}</FieldError>}</div>
      <div className="space-y-3 border-y border-border py-4 text-sm" aria-live="polite">{end ? <p className="font-semibold tabular-nums">De segunda-feira, {formatDate(date)}, até domingo, {formatDate(end)}.</p> : <p className="text-text-secondary">Informe uma segunda-feira válida para conferir o período completo.</p>}<p>O modelo tem {itemCount} {itemCount === 1 ? "item" : "itens"}. Na primeira aplicação, cada item será copiado para seu dia da semana, com status Pendente.</p>{itemCount === 0 && <p className="font-semibold">Este modelo está vazio. A aplicação será registrada sem criar atividades; adicionar itens depois não preencherá esta mesma semana ao reaplicar.</p>}</div>
      <div className="space-y-2 text-sm text-text-secondary"><p>As atividades existentes e recorrentes permanecem. A aplicação adiciona cópias independentes; editar o modelo depois não modifica essas cópias.</p><p>Se este modelo já foi aplicado nesta semana, nenhuma cópia será criada. A reaplicação retorna as atividades atuais, preserva edições e não recria as removidas. Outros modelos podem ser aplicados à mesma semana.</p></div>

    </fieldset>
    <div className="flex flex-wrap justify-end gap-4">{!pending && <Link href={`/modelos?modal=TemplateDetails&id=${id}`} className={link}>Voltar ao modelo</Link>}<Button type="submit" loading={pending} loadingLabel="Aplicando…">Aplicar modelo</Button></div><p role="status" className="sr-only">{pending ? "Aplicando modelo…" : ""}</p>
  </FormSurface>;
}
