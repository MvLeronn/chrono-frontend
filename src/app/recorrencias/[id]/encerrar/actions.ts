"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "../../../../server/api/auth";
import { getRecurring, endRecurring } from "../../../../server/api/recurring";
import { isRecord } from "../../../../server/api/request";
import { parseCalendarDate, todayInTimezone } from "../../../../lib/calendar-date";
import type { ApiFailure } from "../../../../server/api/types";
import type { EndRecurringState } from "./state";

function failure(result: ApiFailure, mutation = false): EndRecurringState {
  if (result.status === 401) return { expired: true, message: "Sua sessão expirou. Entre novamente em outra aba e retorne para continuar." };
  if (result.code === "SERIES_ALREADY_SPLIT") return { message: "Este trecho já tem uma continuação e não pode ser encerrado. Consulte a recorrência atual no calendário.", uncertain: true };
  if (result.status === 404) return { message: "Esta recorrência não está mais disponível. Volte à lista para consultar as regras atuais." };
  if (result.code === "HISTORY_PROTECTED" || result.code === "INVALID_END_DATE" || result.code === "VALIDATION_ERROR") return { dateError: "Escolha hoje ou uma data futura, igual ou posterior ao início deste trecho." };
  if (result.code === "OCCURRENCE_CONFLICT") {
    const conflicts: NonNullable<EndRecurringState["conflicts"]> = [];
    if (isRecord(result.details) && Array.isArray(result.details.occurrences)) {
      for (const row of result.details.occurrences) {
        if (isRecord(row) && typeof row.occurrenceDate === "string" && parseCalendarDate(row.occurrenceDate) && (row.status === "PENDING" || row.status === "IN_PROGRESS" || row.status === "COMPLETED" || row.status === "CANCELED")) conflicts.push({ occurrenceDate: row.occurrenceDate, status: row.status });
      }
    }
    return { message: "O encerramento não foi salvo. Há ocorrências com estado salvo a partir da data escolhida, inclusive possíveis pendentes sem personalização visível. Escolha outro corte ou revise essas ocorrências. Nenhum estado foi apagado.", conflicts };
  }
  return mutation ? { uncertain: true, message: "Não foi possível confirmar o encerramento. Confira o detalhe em outra aba antes de repetir: a alteração pode ter sido salva." } : { message: "Não foi possível consultar a recorrência. A data foi mantida; tente novamente em instantes." };
}

export async function endRecurringAction(id: string, version: string, _previous: EndRecurringState, formData: FormData): Promise<EndRecurringState> {
  const fromDate = formData.get("fromDate");
  if (typeof fromDate !== "string" || !parseCalendarDate(fromDate)) return { dateError: "Informe uma data válida entre 0001 e 9999." };
  if (formData.get("confirm") !== "yes") return { message: "Confirme os efeitos do encerramento antes de continuar." };
  const session = await getCurrentUser();
  if (!session.ok) return failure(session);
  const current = await getRecurring(id);
  if (!current.ok) return failure(current);
  if (fromDate < todayInTimezone(session.data.timezone) || fromDate < current.data.effectiveFrom) return { dateError: "A data deve ser hoje ou futura e não pode anteceder o início deste trecho." };
  if (current.data.updatedAt !== version) return { uncertain: true, message: "A regra mudou desde a abertura desta tela. Confira o detalhe atualizado em outra aba e reabra o encerramento antes de continuar." };
  const result = await endRecurring(id, current.data.seriesId, fromDate);
  if (!result.ok) return failure(result, true);
  revalidatePath("/");
  revalidatePath("/recorrencias", "layout");
  revalidatePath("/ocorrencias", "layout");
  redirect(`/recorrencias/${id}?ended=${result.data.effectiveUntil === current.data.effectiveUntil ? "unchanged" : "1"}`);
}
