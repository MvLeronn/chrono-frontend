"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "../../../../server/api/auth";
import { getTemplate, updateTemplate } from "../../../../server/api/templates";
import { readTemplateDraft, templateChanges, validateTemplate } from "../../../../lib/template-input";
import type { TemplateDraft, TemplateFormState } from "../../nova/state";
import type { ApiFailure } from "../../../../server/api/types";

function failure(result: ApiFailure, mutation = false): TemplateFormState {
  if (result.status === 401) return { expired: true, message: "Sua sessão expirou. Entre novamente em outra aba e retorne para salvar este formulário." };
  if (result.status === 404) return { message: "Este modelo não está mais disponível ou foi arquivado. Seu preenchimento foi mantido; volte aos modelos para consultar os disponíveis." };
  if (result.code === "INVALID_TIME_RANGE") return { message: "Confira os horários dos itens: o fim exige um início e deve ser posterior, no mesmo dia." };
  if (result.code === "VALIDATION_ERROR") return { message: "O serviço não aceitou os campos. Confira o nome e os itens do modelo." };
  return mutation
    ? { uncertain: true, message: "Não foi possível confirmar a alteração. Confira o modelo em outra aba antes de tentar novamente: a operação pode ter sido concluída." }
    : { message: "Não foi possível consultar o modelo. Seu preenchimento foi mantido; tente novamente em instantes." };
}

export async function updateTemplateAction(id: string, updatedAt: string, initial: TemplateDraft, _previous: TemplateFormState, formData: FormData): Promise<TemplateFormState> {
  const session = await getCurrentUser();
  if (!session.ok) return failure(session);
  const draft = readTemplateDraft(formData);
  if (!draft) return { message: "Confira o nome, os campos dos itens e o limite de 200 itens." };
  const errors = validateTemplate(draft, initial);
  if (Object.keys(errors).length) return { errors };
  const input = templateChanges(initial, draft);
  if (!Object.keys(input).length) return { message: "Nenhuma alteração para salvar." };
  const current = await getTemplate(id);
  if (!current.ok) return failure(current);
  if (current.data.updatedAt !== updatedAt) return { stale: true, message: "O modelo mudou desde a abertura do formulário. Confira a versão atual em outra aba e abra uma nova edição para reaplicar suas alterações. Este preenchimento foi mantido." };
  const result = await updateTemplate(id, input);
  if (!result.ok) return failure(result, true);
  revalidatePath("/modelos");
  redirect(`/modelos?modal=TemplateDetails&id=${id}&updated=1`);
}
