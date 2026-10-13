"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "../../../server/api/auth";
import { archiveTemplate, getTemplate } from "../../../server/api/templates";
import type { ApiFailure } from "../../../server/api/types";
import type { ArchiveTemplateState } from "./archive-state";

function failure(result: ApiFailure, mutation = false): ArchiveTemplateState {
  if (result.status === 401) return { expired: true, message: "Sua sessão expirou. Entre novamente em outra aba e retorne para continuar." };
  if (result.status === 404) return { unavailable: true, message: "Este modelo não está disponível ou já foi arquivado. Não foi possível confirmar um novo arquivamento. Volte à lista para consultar os modelos disponíveis." };
  return mutation
    ? { uncertain: true, message: "Não foi possível confirmar o arquivamento. Confira os modelos em outra aba antes de tentar novamente: a operação pode ter sido concluída." }
    : { message: "Não foi possível consultar o modelo. Sua confirmação foi mantida; tente novamente em instantes." };
}

export async function archiveTemplateAction(id: string, updatedAt: string, _previous: ArchiveTemplateState, formData: FormData): Promise<ArchiveTemplateState> {
  if (formData.get("confirm") !== "yes") return { message: "Confirme que deseja arquivar o modelo, sem possibilidade de restauração." };
  const session = await getCurrentUser();
  if (!session.ok) return failure(session);
  const current = await getTemplate(id);
  if (!current.ok) return failure(current);
  if (current.data.updatedAt !== updatedAt) return { stale: true, message: "O modelo mudou desde a abertura. Consulte a versão atual em outra aba e confirme o arquivamento nessa versão." };
  const result = await archiveTemplate(id);
  if (!result.ok) return failure(result, true);
  revalidatePath("/modelos");
  revalidatePath(`/modelos/${id}`);
  revalidatePath(`/modelos/${id}/editar`);
  revalidatePath(`/modelos/${id}/aplicar`);
  redirect("/modelos?archived=1");
}
