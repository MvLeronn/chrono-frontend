import { parseCalendarDate } from "./calendar-date";
import type { ActivityStatus, ActivityType } from "./calendar-types";

export type EventDraft = { title: string; type: string; date: string; startTime: string; endTime: string; description: string; status: string };
export type CreateEventInput = { title: string; type: ActivityType; date: string; startTime: string | null; endTime: string | null; description: string | null; status: ActivityStatus };
export type EventFormState = { errors?: Partial<Record<keyof EventDraft, string>>; message?: string; uncertain?: boolean; expired?: boolean };
export const isLocalTime = (value: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

export function validateEvent(draft: EventDraft): NonNullable<EventFormState["errors"]> {
  const errors: NonNullable<EventFormState["errors"]> = {};
  if (!draft.title.trim() || draft.title.trim().length > 200) errors.title = "Informe um título de até 200 caracteres.";
  if (!["TASK", "EVENT"].includes(draft.type)) errors.type = "Escolha tarefa ou evento.";
  if (!parseCalendarDate(draft.date)) errors.date = "Informe uma data válida entre 0001 e 9999.";
  if (draft.startTime && !isLocalTime(draft.startTime)) errors.startTime = "Informe o início no formato HH:mm.";
  if (draft.endTime && (!isLocalTime(draft.endTime) || !draft.startTime || draft.endTime <= draft.startTime)) errors.endTime = "O fim exige um início e deve ser posterior, no mesmo dia.";
  if (draft.description.length > 10000) errors.description = "Use até 10.000 caracteres.";
  if (!["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELED"].includes(draft.status)) errors.status = "Escolha um status válido.";
  return errors;
}

export function newEventHref(date: string, time?: string): string {
  return `/atividades/nova?date=${date}${time ? `&time=${encodeURIComponent(time)}` : ""}`;
}
