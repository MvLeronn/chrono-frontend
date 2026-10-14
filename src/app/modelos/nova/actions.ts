"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "../../../server/api/auth";
import { createTemplate } from "../../../server/api/templates";
import { readTemplateDraft, templateInput, validateTemplate } from "../../../lib/template-input";
import type { TemplateFormState } from "./state";

export async function createTemplateAction(_previous: TemplateFormState, formData: FormData): Promise<TemplateFormState> {
  const session = await getCurrentUser();
  if (!session.ok) return session.status === 401 ? { expired: true, message: "Sua sessão expirou. Entre novamente em outra aba e retorne para salvar este formulário." } : { message: "Não foi possível verificar seu acesso. Tente novamente em instantes." };
  const draft = readTemplateDraft(formData);
  if (!draft) return { message: "Confira o nome, os campos dos itens e o limite de 200 itens." };
  const errors = validateTemplate(draft);
  if (Object.keys(errors).length) return { errors };
  const result = await createTemplate(templateInput(draft));
  if (!result.ok) {
    if (result.status === 401) return { expired: true, message: "Sua sessão expirou. Entre novamente em outra aba e retorne para salvar este formulário." };
    if (result.code === "INVALID_TIME_RANGE") return { message: "Confira os horários dos itens: o fim exige um início e deve ser posterior, no mesmo dia." };
    if (result.code === "VALIDATION_ERROR") return { message: "O serviço não aceitou os campos. Confira o nome e os itens do modelo." };
    return { uncertain: true, message: "Não foi possível confirmar a criação. Confira os modelos em outra aba antes de reenviar: o modelo pode ter sido criado, e repetir pode duplicá-lo." };
  }
  revalidatePath("/modelos");
  redirect(`/modelos?modal=TemplateDetails&id=${result.data.id}&created=1`);
}
