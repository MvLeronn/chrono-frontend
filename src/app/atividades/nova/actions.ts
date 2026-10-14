"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "../../../server/api/auth";
import { createEvent } from "../../../server/api/events";
import { validateEvent } from "../../../lib/event-input";
import type { EventDraft, EventFormState } from "./state";
import type { CreateEventInput } from "../../../models/event";

export async function createEventAction(_previous: EventFormState, formData: FormData, inline = false): Promise<EventFormState> {
  const session = await getCurrentUser();
  if (!session.ok) {
    if (session.status === 401) return { expired: true, message: "Sua sessão expirou. Entre novamente em outra aba e retorne para salvar este formulário." };
    return { message: "Não foi possível verificar seu acesso. Tente novamente em instantes." };
  }
  const draft: EventDraft = { title: "", type: "", date: "", startTime: "", endTime: "", description: "", status: "" };
  for (const key of Object.keys(draft) as (keyof EventDraft)[]) {
    const value = formData.get(key);
    if (typeof value !== "string") return { message: "Confira os campos do formulário." };
    draft[key] = value;
  }
  const errors = validateEvent(draft);
  if (Object.keys(errors).length) return { errors };
  const input: CreateEventInput = {
    title: draft.title.trim(), type: draft.type as CreateEventInput["type"], date: draft.date,
    startTime: draft.startTime || null, endTime: draft.endTime || null,
    description: draft.description || null, status: draft.status as CreateEventInput["status"],
  };
  const result = await createEvent(input);
  if (!result.ok) {
    if (result.status === 401) return { expired: true, message: "Sua sessão expirou. Entre novamente em outra aba e retorne para salvar este formulário." };
    if (result.code === "INVALID_TIME_RANGE") return { errors: { endTime: "O fim deve ser posterior ao início no mesmo dia." } };
    if (result.code === "VALIDATION_ERROR") return { message: "O serviço não aceitou os campos. Confira título, data e horários antes de enviar novamente." };
    return { uncertain: true, message: "Não foi possível confirmar a criação. Confira a agenda em outra aba antes de enviar novamente: a atividade pode ter sido salva." };
  }
  revalidatePath("/");
  if (inline) return { success: true };
  redirect(`/?modal=EventDetails&id=${result.data.id}&created=1`);
}

export async function createCalendarEventAction(previous: EventFormState, formData: FormData): Promise<EventFormState> {
  return createEventAction(previous, formData, true);
}
