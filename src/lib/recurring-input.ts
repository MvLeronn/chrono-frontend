import { parseCalendarDate, formatCalendarDate } from "./calendar-date";
import { isLocalTime } from "./event-input";
import type { RecurringDraft, RecurringFormErrors } from "../app/recorrencias/nova/state";
import type { Frequency } from "../models/recurring";

export const frequencies: Record<Frequency, string> = { DAILY: "Diária", WEEKLY: "Semanal", MONTHLY: "Mensal", YEARLY: "Anual" };

export function integerInRange(value: string, max: number): boolean {
  return /^\d+$/.test(value) && Number.isSafeInteger(Number(value)) && Number(value) >= 1 && Number(value) <= max;
}

export function validateRecurring(draft: RecurringDraft): RecurringFormErrors {
  const errors: RecurringFormErrors = {};
  if (!draft.title.trim() || draft.title.trim().length > 200) errors.title = "Informe um título de até 200 caracteres.";
  if (draft.type !== "TASK" && draft.type !== "EVENT") errors.type = "Escolha tarefa ou evento.";
  if (draft.description.length > 10000) errors.description = "Use até 10.000 caracteres.";
  if (!parseCalendarDate(draft.startDate)) errors.startDate = "Informe uma data válida entre 0001 e 9999.";
  if (draft.startTime && !isLocalTime(draft.startTime)) errors.startTime = "Informe o início no formato HH:mm.";
  if (draft.endTime && (!isLocalTime(draft.endTime) || !draft.startTime || draft.endTime <= draft.startTime)) errors.endTime = "O fim exige um início e deve ser posterior, no mesmo dia.";
  if (!["DAILY", "WEEKLY", "MONTHLY", "YEARLY"].includes(draft.frequency)) errors.frequency = "Escolha uma frequência válida.";
  if (!integerInRange(draft.interval, 10000)) errors.interval = "Informe um intervalo inteiro de 1 a 10.000.";
  if (!["none", "until", "count"].includes(draft.termination)) errors.termination = "Escolha uma forma de término.";
  if (draft.termination === "until" && (!parseCalendarDate(draft.until) || draft.until < draft.startDate)) errors.until = "A data final deve ser válida e igual ou posterior à data de referência.";
  if (draft.termination === "count" && !integerInRange(draft.count, 1000000)) errors.count = "Informe uma quantidade inteira de 1 a 1.000.000.";
  return errors;
}

export function recurrenceLabel(frequency: Frequency, interval: number): string {
  const units: Record<Frequency, [string, string]> = { DAILY: ["dia", "dias"], WEEKLY: ["semana", "semanas"], MONTHLY: ["mês", "meses"], YEARLY: ["ano", "anos"] };
  return `A cada ${interval} ${units[frequency][interval === 1 ? 0 : 1]}`;
}

export function recurrenceTermination(until: string | null, count: number | null): string {
  return until ? `Até ${formatCalendarDate(until, { day: "numeric", month: "long", year: "numeric" })}, inclusive` : count !== null ? `${count} ${count === 1 ? "ocorrência" : "ocorrências"} a partir da data de referência` : "Sem limite de término";
}
