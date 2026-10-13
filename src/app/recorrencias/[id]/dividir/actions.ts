"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "../../../../server/api/auth";
import { getRecurring, splitRecurring } from "../../../../server/api/recurring";
import { getOccurrence } from "../../../../server/api/occurrences";
import { isRecord } from "../../../../server/api/request";
import { parseCalendarDate, todayInTimezone } from "../../../../lib/calendar-date";
import { buildRecurringChanges, recurringDraft } from "../../../../lib/recurring-split";
import type { RecurringDraft, RecurringFormState, RecurringSelection } from "../../nova/state";
import type { ApiFailure } from "../../../../server/api/types";

function failure(result: ApiFailure, mutation = false): RecurringFormState {
  if (result.status === 401) return { expired: true, message: "Sua sessão expirou. Entre novamente em outra aba e retorne para salvar." };
  if (result.status === 404 || result.code === "SERIES_ALREADY_SPLIT") return { message: "A recorrência mudou ou já tem uma continuação. Consulte o calendário em outra aba e selecione a ocorrência atual antes de editar.", uncertain: true };
  if (result.code === "HISTORY_PROTECTED") return { message: "A data original deve ser hoje ou futura no fuso da conta. Escolha outra ocorrência no calendário." };
  if (result.code === "OCCURRENCE_CONFLICT") {
    const rows = isRecord(result.details) && Array.isArray(result.details.occurrences) ? result.details.occurrences : [];
    const conflicts = rows.filter((row): row is { occurrenceDate: string; status: string } => isRecord(row) && typeof row.occurrenceDate === "string" && parseCalendarDate(row.occurrenceDate) !== null && typeof row.status === "string" && ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELED"].includes(row.status));
    return { message: "As mudanças não foram salvas: existem ocorrências com estado salvo que não cabem na nova repetição. Ajuste as mudanças; nenhum estado será apagado automaticamente.", conflicts };
  }
  if (["INVALID_START_DATE", "INVALID_TERMINATION", "INVALID_TIME_RANGE", "VALIDATION_ERROR"].includes(result.code)) return { message: "As mudanças não foram aceitas. Confira a nova referência, os horários e o término; seu preenchimento foi mantido." };
  return mutation ? { uncertain: true, message: "Não foi possível confirmar a alteração. Confira as recorrências em outra aba antes de repetir: a continuação pode ter sido criada." } : { message: "Não foi possível consultar os dados atuais. Seu preenchimento foi mantido; tente novamente." };
}

export async function splitRecurringAction(id: string, fromDate: string, initial: RecurringDraft, _previous: RecurringFormState, formData: FormData): Promise<RecurringFormState> {
  if (formData.get("confirm") !== "yes") return { message: "Confirme que deseja alterar esta ocorrência e as próximas." };
  const session = await getCurrentUser();
  if (!session.ok) return failure(session);
  if (!parseCalendarDate(fromDate) || fromDate < todayInTimezone(session.data.timezone)) return { message: "Escolha uma ocorrência cuja data original seja hoje ou futura no fuso da conta." };
  const draft = { ...initial };
  const selected: RecurringSelection = {};
  for (const key of Object.keys(initial) as (keyof RecurringDraft)[]) {
    if (key === "until" || key === "count") continue;
    if (formData.get(`change-${key}`) !== "yes") continue;
    selected[key] = true;
    const value = formData.get(key);
    if (typeof value !== "string") return { message: "Confira os campos selecionados." };
    draft[key] = value;
  }
  if (selected.termination && (draft.termination === "until" || draft.termination === "count")) {
    const value = formData.get(draft.termination);
    if (typeof value !== "string") return { message: "Informe o término selecionado." };
    draft[draft.termination] = value;
  }
  const built = buildRecurringChanges(initial, draft, selected, fromDate);
  if (Object.keys(built.errors).length) return { errors: built.errors };
  if (!Object.keys(built.changes).length) return { message: "Selecione e altere pelo menos um campo antes de salvar." };
  const current = await getRecurring(id);
  if (!current.ok) return failure(current);
  // Avoid applying an old selection to a rule changed since the form was opened.
  if (JSON.stringify(recurringDraft(current.data)) !== JSON.stringify(initial)) return { message: "A regra mudou desde que o formulário foi aberto. Confira os valores atuais em outra aba antes de continuar.", uncertain: true };
  const occurrence = await getOccurrence(id, fromDate);
  if (!occurrence.ok) return failure(occurrence);
  const result = await splitRecurring(id, current.data.seriesId, { fromDate, changes: built.changes });
  if (!result.ok) return failure(result, true);
  revalidatePath("/");
  revalidatePath("/recorrencias", "layout");
  revalidatePath("/ocorrencias", "layout");
  redirect(`/recorrencias/${result.data.id}?split=1`);
}
