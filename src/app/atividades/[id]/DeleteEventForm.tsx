"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "../../../components/ui/Button";
import { dayHref } from "../../../lib/calendar-date";
import { deleteEventAction } from "./actions";
import type { EventFormState } from "../nova/state";

interface DeleteEventFormProps {
  id: string;
  title: string;
  date: string;
  fromTemplate: boolean;
}

export function DeleteEventForm({ id, title, date, fromTemplate }: DeleteEventFormProps) {
  const [state, action, pending] = useActionState(deleteEventAction.bind(null, id), {} as EventFormState);
  const submitted = useRef(false);
  const [confirmed, setConfirmed] = useState(false);
  const alert = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!pending) {
      submitted.current = false;
      if (state.message) alert.current?.focus();
    }
  }, [pending, state]);
  return <details className="border-t border-border pt-4">
    <summary className="w-fit cursor-pointer rounded-control py-3 text-sm font-semibold text-error">Excluir atividade</summary>
    <form action={action} onSubmit={(event) => {
      if (pending || submitted.current) { event.preventDefault(); return; }
      submitted.current = true;
    }} className="mt-2 space-y-4 rounded-surface border border-border bg-surface p-4 sm:p-6">
      <h2 className="wrap-anywhere font-semibold">Excluir “{title}”?</h2>
      <p className="text-sm text-text-secondary">A atividade será removida definitivamente do calendário. Esta ação não pode ser desfeita. Para manter o registro, edite a atividade e escolha o status Cancelado.</p>
      {fromTemplate && <p className="text-sm text-text-secondary">O modelo semanal será preservado, mas reaplicá-lo à mesma semana não recriará esta atividade.</p>}
      {state.message && <div ref={alert} role="alert" tabIndex={-1} className="space-y-2 rounded-control bg-error-soft p-3 text-sm text-error"><p>{state.message}</p>{(state.expired || state.uncertain) && <a href={state.expired ? "/login" : dayHref(date)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center font-semibold underline">{state.expired ? "Abrir login em outra aba" : "Conferir agenda em outra aba"}</a>}</div>}
      <fieldset disabled={pending} className="space-y-4">
        <legend className="sr-only">Confirmação de exclusão</legend>
        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"><input type="checkbox" name="confirm" value="yes" required checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} className="size-5 shrink-0 accent-primary" />Entendo que a exclusão é definitiva.</label>
        <Button type="submit" variant="danger" loading={pending} loadingLabel="Excluindo…">Excluir definitivamente</Button>
      </fieldset>
      <p role="status" className="sr-only">{pending ? "Excluindo atividade…" : ""}</p>
    </form>
  </details>;
}
