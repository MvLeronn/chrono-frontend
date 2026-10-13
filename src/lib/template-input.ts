import { isLocalTime } from "./event-input";
import type { TemplateDraft, TemplateItemDraft } from "../app/modelos/nova/state";
import type { CreateTemplateInput, TemplateResponse, UpdateTemplateInput } from "../models/template";

export const weekdays = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];

export function validateTemplate(draft: TemplateDraft, initial?: TemplateDraft): Record<string, string> {
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
  const input = initial ? templateChanges(initial, draft) : templateInput(draft);
  if (new TextEncoder().encode(JSON.stringify(input)).byteLength > 100 * 1024) errors.items = "O conteúdo do modelo ultrapassa o limite de 100 KB. Reduza as descrições ou a quantidade de itens antes de salvar.";
  return errors;
}

export function templateDraft(template: TemplateResponse): TemplateDraft {
  return {
    name: template.name,
    items: template.items.map((item, index) => ({
      key: String(index),
      weekday: String(item.weekday),
      type: item.type,
      title: item.title,
      description: item.description ?? "",
      startTime: item.startTime ?? "",
      endTime: item.endTime ?? "",
    })),
  };
}

export function templateChanges(initial: TemplateDraft, draft: TemplateDraft): UpdateTemplateInput {
  const before = templateInput(initial);
  const after = templateInput(draft);
  const changes: UpdateTemplateInput = {};
  if (before.name !== after.name) changes.name = after.name;
  // The API replaces the entire collection when items is present.
  if (JSON.stringify(before.items) !== JSON.stringify(after.items)) changes.items = after.items;
  return changes;
}

export function readTemplateDraft(formData: FormData): TemplateDraft | null {
  const name = formData.get("name");
  const keys = formData.getAll("itemKey");
  if (typeof name !== "string" || keys.length > 200 || new Set(keys).size !== keys.length) return null;
  const draft: TemplateDraft = { name, items: [] };
  for (const key of keys) {
    if (typeof key !== "string" || !/^[0-9]{1,10}$/.test(key)) return null;
    const item: TemplateItemDraft = { key, weekday: "", type: "", title: "", description: "", startTime: "", endTime: "" };
    for (const field of ["weekday", "type", "title", "description", "startTime", "endTime"] as const) {
      const value = formData.get(`item-${key}-${field}`);
      if (typeof value !== "string") return null;
      item[field] = value;
    }
    draft.items.push(item);
  }
  return draft;
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
