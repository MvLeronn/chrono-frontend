import { isLocalTime } from "./event-input";
import type { TemplateDraft } from "../app/modelos/nova/state";
import type { CreateTemplateInput } from "../models/template";

export const weekdays = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];

export function validateTemplate(draft: TemplateDraft): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!draft.name.trim() || draft.name.trim().length > 100) errors.name = "Informe um nome de até 100 caracteres.";
  if (draft.items.length > 200) errors.items = "Use no máximo 200 itens por modelo.";
  for (const item of draft.items) {
    const prefix = `item-${item.key}-`;
    if (!/^[1-7]$/.test(item.weekday)) errors[`${prefix}weekday`] = "Escolha um dia da semana.";
    if (!["TASK", "EVENT"].includes(item.type)) errors[`${prefix}type`] = "Escolha tarefa ou evento.";
    if (!item.title.trim() || item.title.trim().length > 200) errors[`${prefix}title`] = "Informe um título de até 200 caracteres.";
    if (item.description.length > 10000) errors[`${prefix}description`] = "Use até 10.000 caracteres.";
    if (item.startTime && !isLocalTime(item.startTime)) errors[`${prefix}startTime`] = "Informe o início no formato HH:mm.";
    if (item.endTime && (!isLocalTime(item.endTime) || !item.startTime || item.endTime <= item.startTime)) errors[`${prefix}endTime`] = "O fim exige um início e deve ser posterior, no mesmo dia.";
  }
  if (new TextEncoder().encode(JSON.stringify(templateInput(draft))).byteLength > 100 * 1024) errors.items = "O conteúdo do modelo ultrapassa o limite de 100 KB. Reduza as descrições ou a quantidade de itens antes de criar.";
  return errors;
}

export function templateInput(draft: TemplateDraft): CreateTemplateInput {
  return {
    name: draft.name.trim(),
    items: draft.items.map((item) => ({
      weekday: Number(item.weekday),
      type: item.type as CreateTemplateInput["items"][number]["type"],
      title: item.title.trim(),
      description: item.description || null,
      startTime: item.startTime || null,
      endTime: item.endTime || null,
    })),
  };
}
