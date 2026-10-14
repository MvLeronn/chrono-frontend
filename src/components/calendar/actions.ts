"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "../../server/api/auth";
import { deleteEvent, getEvent, updateEvent } from "../../server/api/events";
import { deleteOccurrence, getOccurrence, updateOccurrence } from "../../server/api/occurrences";
import type { ActivityStatus, CalendarItem } from "../../models/calendar";
import type { ApiFailure } from "../../server/api/types";

type Target = { source: "EVENT"; id: string } | { source: "RECURRING"; id: string; date: string };
type Result = { ok: true; item: CalendarItem | null } | { ok: false; message: string };

function failure(result: ApiFailure, mutation = false): Result {
  if (result.status === 401) return { ok: false, message: "Sua sessão expirou. Entre novamente em outra aba e retorne para continuar." };
  if (result.status === 404) return { ok: false, message: "Esta atividade não está mais disponível. Atualize o calendário." };
  return { ok: false, message: mutation ? "Não foi possível confirmar a alteração. Atualize o calendário antes de tentar novamente: a operação pode ter sido concluída." : "Não foi possível consultar a atividade. Tente novamente em instantes." };
}

export async function changeCalendarActivity(target: Target, intent: "status" | "delete", status?: ActivityStatus): Promise<Result> {
  if (!target || (target.source !== "EVENT" && target.source !== "RECURRING") || typeof target.id !== "string" || (target.source === "RECURRING" && typeof target.date !== "string")) return { ok: false, message: "Atividade inválida." };
  if (intent !== "status" && intent !== "delete") return { ok: false, message: "Ação inválida." };
  if (intent === "status" && (!status || !["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELED"].includes(status))) return { ok: false, message: "Escolha um status válido." };
  const session = await getCurrentUser();
  if (!session.ok) return failure(session);
  const current = target.source === "EVENT" ? await getEvent(target.id) : await getOccurrence(target.id, target.date);
  if (!current.ok) return failure(current);
  const result = intent === "delete" ? (target.source === "EVENT" ? await deleteEvent(target.id) : await deleteOccurrence(target.id, target.date)) : target.source === "EVENT" ? await updateEvent(target.id, { status }) : await updateOccurrence(target.id, target.date, { status });
  if (!result.ok) return failure(result, true);
  revalidatePath("/");
  return { ok: true, item: result.data };
}
