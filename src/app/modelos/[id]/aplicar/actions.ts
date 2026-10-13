"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "../../../../server/api/auth";
import { applyTemplate, getTemplate } from "../../../../server/api/templates";
import { templateWeekEnd } from "../../../../lib/template-apply";
import type { ApplyTemplateState } from "./state";
import type { ApiFailure } from "../../../../server/api/types";

function failure(result: ApiFailure, mutation = false): ApplyTemplateState {
  if (result.status === 401) return { expired: true, message: "Sua sessão expirou. Entre novamente em outra aba e retorne para aplicar o modelo." };
  if (result.status === 404) return { message: "Este modelo não está disponível ou foi arquivado. Volte aos modelos para consultar os disponíveis." };
  if (result.code === "INVALID_WEEK_START" || result.code === "VALIDATION_ERROR") return { dateError: "Escolha uma segunda-feira cuja semana completa termine até 31/12/9999." };
  return mutation
    ? { uncertain: true, message: "Não foi possível confirmar a aplicação. Você pode tentar novamente com a mesma segunda-feira: se a aplicação já ocorreu, as atividades não serão duplicadas. Escolher outra semana cria uma aplicação diferente." }
    : { message: "Não foi possível consultar o modelo. Sua seleção foi mantida; tente novamente em instantes." };
}

export async function applyTemplateAction(id: string, updatedAt: string, _previous: ApplyTemplateState, formData: FormData): Promise<ApplyTemplateState> {
  const weekStart = formData.get("weekStart");
  if (typeof weekStart !== "string" || !templateWeekEnd(weekStart)) return { dateError: "Escolha uma segunda-feira cuja semana completa termine até 31/12/9999." };
  if (formData.get("confirm") !== "yes") return { message: "Confirme a aplicação na semana apresentada." };
  const session = await getCurrentUser();
  if (!session.ok) return failure(session);
  const current = await getTemplate(id);
  if (!current.ok) return failure(current);
  if (current.data.updatedAt !== updatedAt) return { stale: true, message: "O modelo mudou desde a abertura. Consulte a versão atual e abra novamente a aplicação para revisar os itens antes de confirmar. Sua seleção foi mantida." };
  const result = await applyTemplate(id, weekStart);
  if (!result.ok) return failure(result, true);
  revalidatePath("/");
  revalidatePath("/modelos");
  revalidatePath(`/modelos/${id}`);
  return { result: result.data };
}
