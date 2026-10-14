"use client";

import { FormSurface } from "../../../components/ui/FormSurface";
import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
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
  const submitted = useRef(false);
  const alert = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!pending) {
      submitted.current = false;
      if (state.message) alert.current?.focus();
    }
  }, [pending, state]);
  return <section className="border-t border-border pt-4">
    <FormSurface embedded={false} action={action} onSubmit={(event) => {
      if (pending || submitted.current || state.stale || state.unavailable) { event.preventDefault(); return; }
      submitted.current = true;
    }} className="mt-2 space-y-4">
      <h2 className="wrap-anywhere font-semibold">Arquivar “{name}”</h2>
      <p className="text-sm text-text-secondary">O modelo sairá da lista e não poderá mais ser consultado, editado ou aplicado, nem mesmo em semanas em que já foi usado. Não há opção de restaurar um modelo arquivado.</p>
      <p className="text-sm text-text-secondary">As atividades já criadas permanecem no calendário, com suas edições e status atuais. O arquivamento preserva os itens e o registro das aplicações anteriores.</p>
      {state.message && <div ref={alert} role="alert" tabIndex={-1} className="space-y-2 rounded-control bg-error-soft p-3 text-sm text-error"><p>{state.message}</p>{(state.expired || state.uncertain || state.stale) && <a href={state.expired ? "/login" : state.stale ? `/modelos?modal=TemplateDetails&id=${id}` : "/modelos"} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center font-semibold ">{state.expired ? "Abrir login em outra aba" : state.stale ? "Conferir modelo em outra aba" : "Conferir modelos em outra aba"}</a>}{state.unavailable && <Link href="/modelos" className="inline-flex min-h-11 items-center font-semibold ">Voltar aos modelos</Link>}</div>}
      <fieldset disabled={pending || state.stale || state.unavailable} className="flex justify-end">
        <legend className="sr-only">Arquivar modelo</legend>

        <Button type="submit" variant="danger" disabled={state.stale || state.unavailable} loading={pending} loadingLabel="Arquivando…">Arquivar modelo</Button>
      </fieldset>
      <p role="status" className="sr-only">{pending ? "Arquivando modelo…" : ""}</p>
    </FormSurface>
  </section>;
}
