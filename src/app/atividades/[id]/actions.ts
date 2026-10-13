"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "../../../server/api/auth";
import { deleteEvent, getEvent, updateEvent } from "../../../server/api/events";
import { eventDraft, validateEvent } from "../../../lib/event-input";
import { dayHref } from "../../../lib/calendar-date";
import type { EventDraft, EventFormState } from "../nova/state";
import type { UpdateEventInput } from "../../../models/event";
import type { ApiFailure } from "../../../server/api/types";

function failure(result: ApiFailure, mutation = false): EventFormState {
  if (result.status === 401) return { expired: true, message: "Sua sessão expirou. Entre novamente em outra aba e retorne para continuar." };
  if (result.status === 404) return { message: "Esta atividade não está mais disponível. Ela pode ter sido excluída em outra aba. Volte ao calendário." };
  if (result.code === "INVALID_TIME_RANGE") return { errors: { endTime: "O fim deve ser posterior ao início no mesmo dia. Confira os dois horários." } };
  if (result.code === "VALIDATION_ERROR") return { message: "O serviço não aceitou os campos. Confira os dados antes de enviar novamente." };
  return mutation
    ? { uncertain: true, message: "Não foi possível confirmar a alteração. Confira a agenda em outra aba antes de tentar novamente: a operação pode ter sido concluída." }
    : { message: "Não foi possível consultar a atividade. Seu preenchimento foi mantido; tente novamente em instantes." };
}

export async function updateEventAction(id: string, initial: EventDraft, _previous: EventFormState, formData: FormData): Promise<EventFormState> {
  const session = await getCurrentUser();
  if (!session.ok) return failure(session);
  const draft = { ...initial };
  const input: UpdateEventInput = {};
  for (const key of Object.keys(initial) as (keyof EventDraft)[]) {
    const value = formData.get(key);
    if (typeof value !== "string") return { message: "Confira os campos do formulário." };
    draft[key] = key === "title" ? value.trim() : value;
  }
  const errors = validateEvent(draft);
  if (Object.keys(errors).length) return { errors };
  // Compare against the displayed snapshot, preserving fields the user did not edit.
  if (draft.title !== initial.title) input.title = draft.title;
  if (draft.type !== initial.type) input.type = draft.type as UpdateEventInput["type"];
  if (draft.date !== initial.date) input.date = draft.date;
  if (draft.status !== initial.status) input.status = draft.status as UpdateEventInput["status"];
  if (draft.description !== initial.description) input.description = draft.description || null;
  if (draft.startTime !== initial.startTime) input.startTime = draft.startTime || null;
  if (draft.endTime !== initial.endTime) input.endTime = draft.endTime || null;
  if (!Object.keys(input).length) return { message: "Nenhuma alteração para salvar." };
  const current = await getEvent(id);
  if (!current.ok) return failure(current);
  const merged = { ...current.data, ...input };
  const mergedErrors = validateEvent(eventDraft(merged));
  if (Object.keys(mergedErrors).length) return { message: "A atividade mudou desde a abertura do formulário. Confira os dados atuais em outra aba antes de salvar.", uncertain: true };
  const result = await updateEvent(id, input);
  if (!result.ok) return failure(result, true);
  revalidatePath("/");
  revalidatePath(`/atividades/${id}`);
  revalidatePath(`/atividades/${id}/editar`);
  redirect(`/atividades/${id}?updated=1`);
}

export async function deleteEventAction(id: string, _previous: EventFormState, formData: FormData): Promise<EventFormState> {
  if (formData.get("confirm") !== "yes") return { message: "Confirme que deseja excluir esta atividade definitivamente." };
  const session = await getCurrentUser();
  if (!session.ok) return failure(session);
  const current = await getEvent(id);
  if (!current.ok) return failure(current);
  const result = await deleteEvent(id);
  if (!result.ok) return failure(result, true);
  revalidatePath("/");
  revalidatePath(`/atividades/${id}`);
  revalidatePath(`/atividades/${id}/editar`);
  redirect(`${dayHref(current.data.date)}&deleted=1`);
}
