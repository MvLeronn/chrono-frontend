"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "../../../components/ui/Button";
import { archiveTemplateAction } from "./actions";
import type { ArchiveTemplateState } from "./archive-state";

interface ArchiveTemplateFormProps {
  id: string;
  name: string;
  updatedAt: string;
}

export function ArchiveTemplateForm({ id, name, updatedAt }: ArchiveTemplateFormProps) {
  const [state, action, pending] = useActionState(archiveTemplateAction.bind(null, id, updatedAt), {} as ArchiveTemplateState);
  const [confirmed, setConfirmed] = useState(false);
  const submitted = useRef(false);
  const alert = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!pending) {
      submitted.current = false;
      if (state.message) alert.current?.focus();
    }
  }, [pending, state]);
  return <details className="border-t border-border pt-4">
    <summary className="w-fit cursor-pointer rounded-control py-3 text-sm font-semibold text-error">Arquivar modelo</summary>
    <form action={action} onSubmit={(event) => {
      if (pending || submitted.current || state.stale || state.unavailable) { event.preventDefault(); return; }
      submitted.current = true;
    }} className="mt-2 space-y-4 rounded-surface border border-border bg-surface p-4 sm:p-6">
      <h2 className="wrap-anywhere font-semibold">Arquivar “{name}”?</h2>
      <p className="text-sm text-text-secondary">O modelo sairá da lista e não poderá mais ser consultado, editado ou aplicado, nem mesmo em semanas em que já foi usado. Não há opção de restaurar um modelo arquivado.</p>
      <p className="text-sm text-text-secondary">As atividades já criadas permanecem no calendário, com suas edições e status atuais. O arquivamento preserva os itens e o registro das aplicações anteriores.</p>
      {state.message && <div ref={alert} role="alert" tabIndex={-1} className="space-y-2 rounded-control bg-error-soft p-3 text-sm text-error"><p>{state.message}</p>{(state.expired || state.uncertain || state.stale) && <a href={state.expired ? "/login" : state.stale ? `/modelos/${id}` : "/modelos"} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center font-semibold underline">{state.expired ? "Abrir login em outra aba" : state.stale ? "Conferir modelo em outra aba" : "Conferir modelos em outra aba"}</a>}{state.unavailable && <Link href="/modelos" className="inline-flex min-h-11 items-center font-semibold underline">Voltar aos modelos</Link>}</div>}
      <fieldset disabled={pending || state.stale || state.unavailable} className="space-y-4">
        <legend className="sr-only">Confirmação de arquivamento</legend>
        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"><input type="checkbox" name="confirm" value="yes" required checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} className="size-5 shrink-0 accent-primary" />Entendo que o modelo não poderá ser restaurado e que as atividades já criadas serão preservadas.</label>
        <Button type="submit" variant="danger" disabled={state.stale || state.unavailable} loading={pending} loadingLabel="Arquivando…">Arquivar modelo</Button>
      </fieldset>
      <p role="status" className="sr-only">{pending ? "Arquivando modelo…" : ""}</p>
    </form>
  </details>;
}
