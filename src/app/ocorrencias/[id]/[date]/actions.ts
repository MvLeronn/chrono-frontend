"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "../../../../server/api/auth";
import { getOccurrence, resetOccurrence, updateOccurrence } from "../../../../server/api/occurrences";
import { buildOccurrenceInput, occurrenceHref } from "../../../../lib/occurrence-input";
import type { ApiFailure } from "../../../../server/api/types";
import type { OccurrenceDraft, OccurrenceFormState, OccurrenceModes, OverrideMode } from "./state";

function failure(result: ApiFailure, mutation = false): OccurrenceFormState {
  if (result.status === 401) return { expired: true, message: "Sua sessão expirou. Entre novamente em outra aba e retorne para continuar." };
  if (result.status === 404) return { message: "Esta ocorrência não está mais disponível neste endereço. Volte ao calendário para consultar a recorrência atual." };
  if (result.code === "INVALID_TIME_RANGE") return { errors: { endTime: "O fim exige um início e deve ser posterior, no mesmo dia." } };
  if (result.code === "VALIDATION_ERROR") return { message: "Confira os campos: o serviço não aceitou a alteração." };
  return mutation
    ? { uncertain: true, message: "Não foi possível confirmar a alteração. Confira a ocorrência em outra aba antes de repetir: a operação pode ter sido concluída." }
    : { message: "Não foi possível consultar a ocorrência. Seu preenchimento foi mantido; tente novamente em instantes." };
}

export async function saveOccurrenceAction(id: string, date: string, initial: OccurrenceDraft, _previous: OccurrenceFormState, formData: FormData): Promise<OccurrenceFormState> {
  const intent = formData.get("intent");
  if (intent !== "save" && intent !== "reset") return { message: "Escolha uma ação válida." };
  if (intent === "reset" && formData.get("confirm") !== "yes") return { message: "Confirme a restauração completa antes de continuar." };
  const session = await getCurrentUser();
  if (!session.ok) return failure(session);
  const current = await getOccurrence(id, date);
  if (!current.ok) return failure(current);
  let result;
  if (intent === "reset") {
    result = await resetOccurrence(id, date);
  } else {
    const modes: OccurrenceModes = { title: "keep", type: "keep", description: "keep", time: "keep" };
    for (const key of Object.keys(modes) as (keyof OccurrenceModes)[]) {
      const value = formData.get(`${key}Mode`);
      if (value !== "keep" && value !== "custom" && value !== "inherit") return { message: "Escolha como alterar cada campo." };
      modes[key] = value as OverrideMode;
    }
    const draft = { ...initial };
    for (const key of Object.keys(draft) as (keyof OccurrenceDraft)[]) {
      const mode = key === "startTime" || key === "endTime" ? modes.time : key === "date" || key === "status" ? "custom" : modes[key];
      if (mode !== "custom") continue;
      const value = formData.get(key);
      if (typeof value !== "string") return { message: "Confira os campos do formulário." };
      draft[key] = value;
    }
    const { input, errors } = buildOccurrenceInput(initial, draft, modes);
    if (Object.keys(errors).length) return { errors };
    if (!Object.keys(input).length) return { message: "Nenhuma alteração para salvar." };
    result = await updateOccurrence(id, date, input);
  }
  if (!result.ok) return failure(result, true);
  const href = occurrenceHref(id, date);
  revalidatePath("/");
  revalidatePath(href);
  // A successful save may only change inheritance, leaving resolved values identical.
  redirect(`${href}?${intent === "reset" ? "restored" : "saved"}=1&revision=${crypto.randomUUID()}`);
}
