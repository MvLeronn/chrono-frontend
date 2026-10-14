"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "../../../server/api/auth";
import { createRecurring } from "../../../server/api/recurring";
import { validateRecurring } from "../../../lib/recurring-input";
import type { CreateRecurringInput } from "../../../models/recurring";
import type { RecurringDraft, RecurringFormState } from "./state";

export async function createRecurringAction(_previous: RecurringFormState, formData: FormData): Promise<RecurringFormState> {
  const session = await getCurrentUser();
  if (!session.ok) return session.status === 401 ? { expired: true, message: "Sua sessão expirou. Entre novamente em outra aba e retorne para salvar este formulário." } : { message: "Não foi possível verificar seu acesso. Tente novamente em instantes." };
  const draft: RecurringDraft = { title: "", type: "", description: "", startDate: "", startTime: "", endTime: "", frequency: "", interval: "", termination: "", until: "", count: "" };
  for (const key of Object.keys(draft) as (keyof RecurringDraft)[]) {
    if (key === "until" && formData.get("termination") !== "until" || key === "count" && formData.get("termination") !== "count") continue;
    const value = formData.get(key);
    if (typeof value !== "string") return { message: "Confira os campos do formulário." };
    draft[key] = value;
  }
  const errors = validateRecurring(draft);
  if (Object.keys(errors).length) return { errors };
  const input: CreateRecurringInput = {
    title: draft.title.trim(), type: draft.type as CreateRecurringInput["type"], description: draft.description || null,
    startDate: draft.startDate, startTime: draft.startTime || null, endTime: draft.endTime || null,
    frequency: draft.frequency as CreateRecurringInput["frequency"], interval: Number(draft.interval),
    until: draft.termination === "until" ? draft.until : null, count: draft.termination === "count" ? Number(draft.count) : null,
  };
  const result = await createRecurring(input);
  if (!result.ok) {
    if (result.status === 401) return { expired: true, message: "Sua sessão expirou. Entre novamente em outra aba e retorne para salvar este formulário." };
    if (result.code === "INVALID_TIME_RANGE") return { errors: { endTime: "O fim exige um início e deve ser posterior, no mesmo dia." } };
    if (result.code === "INVALID_TERMINATION") return { errors: { termination: "Escolha somente um término e confira se a data final não antecede a data de referência." } };
    if (result.code === "VALIDATION_ERROR") return { message: "O serviço não aceitou os campos. Confira os dados da recorrência." };
    return { uncertain: true, message: "Não foi possível confirmar a criação. Confira a lista em outra aba antes de enviar novamente: a recorrência pode ter sido criada, e repetir pode duplicá-la." };
  }
  revalidatePath("/");
  revalidatePath("/recorrencias");
  redirect(`/recorrencias?modal=RecurringDetails&id=${result.data.id}&created=1`);
}
