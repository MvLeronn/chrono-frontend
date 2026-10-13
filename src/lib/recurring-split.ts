import { validateRecurring } from "./recurring-input";
import type { RecurringDraft, RecurringSelection } from "../app/recorrencias/nova/state";
import type { CreateRecurringInput, RecurringEventResponse } from "../models/recurring";

export function recurringDraft(item: RecurringEventResponse): RecurringDraft {
  return { title: item.title, type: item.type, description: item.description ?? "", startDate: item.startDate, startTime: item.startTime ?? "", endTime: item.endTime ?? "", frequency: item.frequency, interval: String(item.interval), termination: item.until ? "until" : item.count !== null ? "count" : "none", until: item.until ?? "", count: item.count === null ? "1" : String(item.count) };
}

export function buildRecurringChanges(initial: RecurringDraft, draft: RecurringDraft, selected: RecurringSelection, fromDate: string) {
  const candidate = { ...initial };
  for (const key of Object.keys(initial) as (keyof RecurringDraft)[]) {
    if (selected[key]) candidate[key] = draft[key];
  }
  if (selected.termination) { candidate.termination = draft.termination; candidate.until = draft.until; candidate.count = draft.count; }
  candidate.title = candidate.title.trim();
  const changes: Partial<CreateRecurringInput> = {};
  if (selected.title && candidate.title !== initial.title) changes.title = candidate.title;
  if (selected.type && candidate.type !== initial.type) changes.type = candidate.type as CreateRecurringInput["type"];
  if (selected.description && candidate.description !== initial.description) changes.description = candidate.description || null;
  if (selected.startTime && candidate.startTime !== initial.startTime) changes.startTime = candidate.startTime || null;
  if (selected.endTime && candidate.endTime !== initial.endTime) changes.endTime = candidate.endTime || null;
  if (selected.frequency && candidate.frequency !== initial.frequency) changes.frequency = candidate.frequency as CreateRecurringInput["frequency"];
  if (selected.interval && Number(candidate.interval) !== Number(initial.interval)) changes.interval = Number(candidate.interval);
  // An explicitly selected anchor or termination is intentional, even at the same value.
  if (selected.startDate) changes.startDate = candidate.startDate;
  if (selected.termination) {
    changes.until = candidate.termination === "until" ? candidate.until : null;
    changes.count = candidate.termination === "count" ? Number(candidate.count) : null;
  }
  const anchorChanged = selected.startDate || changes.frequency !== undefined || changes.interval !== undefined;
  const anchor = selected.startDate ? candidate.startDate : anchorChanged ? fromDate : initial.startDate;
  const errors = validateRecurring({ ...candidate, startDate: anchor });
  if (anchorChanged && anchor < fromDate) errors.startDate = "A nova referência não pode anteceder a ocorrência escolhida.";
  if (candidate.termination === "until" && candidate.until < fromDate) errors.until = "A data final não pode anteceder a ocorrência escolhida.";
  return { changes, errors, anchor };
}
