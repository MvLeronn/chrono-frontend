import { validateRecurring } from "./recurring-input";
import { adjacentDate, parseCalendarDate } from "./calendar-date";
import type { RecurringDraft, RecurringSelection } from "../app/recorrencias/nova/state";
import type { CreateRecurringInput, RecurringEventResponse } from "../models/recurring";

// Seek from the original anchor, matching the API's LAST_VALID_DAY policy.
// The API still validates the selected occurrence before any mutation.
export function nextRecurringDate(item: RecurringEventResponse, today: string): string | null {
  const lower = [today, item.startDate, item.effectiveFrom].sort().at(-1)!;
  const upper = [item.until ?? "9999-12-31", item.effectiveUntil ?? "9999-12-31"].sort()[0];
  if (lower > upper) return null;
  const anchor = parseCalendarDate(item.startDate)!;
  const target = parseCalendarDate(lower)!;
  const periods = item.frequency === "DAILY" || item.frequency === "WEEKLY"
    ? (target.getTime() - anchor.getTime()) / 86400000 / (item.frequency === "WEEKLY" ? 7 : 1)
    : item.frequency === "MONTHLY"
      ? (target.getUTCFullYear() - anchor.getUTCFullYear()) * 12 + target.getUTCMonth() - anchor.getUTCMonth()
      : target.getUTCFullYear() - anchor.getUTCFullYear();
  const first = Math.max(0, Math.floor(periods / item.interval));
  for (let index = first; index <= first + 1; index++) {
    if (item.count !== null && index >= item.count) return null;
    const offset = index * item.interval;
    let value: string | null;
    if (item.frequency === "DAILY" || item.frequency === "WEEKLY") {
      value = adjacentDate(item.startDate, offset * (item.frequency === "WEEKLY" ? 7 : 1));
    } else {
      const months = anchor.getUTCFullYear() * 12 + anchor.getUTCMonth() + (item.frequency === "MONTHLY" ? offset : offset * 12);
      const year = Math.floor(months / 12);
      if (year > 9999) return null;
      const month = months % 12;
      const candidate = new Date(0);
      candidate.setUTCFullYear(year, month + 1, 0);
      const day = Math.min(anchor.getUTCDate(), candidate.getUTCDate());
      candidate.setUTCFullYear(year, month, day);
      value = candidate.toISOString().slice(0, 10);
    }
    if (!value || value > upper) return null;
    if (value >= lower) return value;
  }
  return null;
}

export function recurringDraft(item: RecurringEventResponse): RecurringDraft {
  return { title: item.title, type: item.type, description: item.description ?? "", startDate: item.startDate, startTime: item.startTime ?? "", endTime: item.endTime ?? "", frequency: item.frequency, interval: String(item.interval), termination: item.until ? "until" : item.count !== null ? "count" : "none", until: item.until ?? "", count: item.count === null ? "1" : String(item.count) };
}

export function recurringSelection(initial: RecurringDraft, draft: RecurringDraft): RecurringSelection {
  const selected: RecurringSelection = {};
  for (const key of Object.keys(initial) as (keyof RecurringDraft)[]) {
    if (key === "termination" || key === "until" || key === "count") continue;
    const changed = key === "interval" ? Number(draft[key]) !== Number(initial[key]) : key === "title" ? draft[key].trim() !== initial[key] : draft[key] !== initial[key];
    if (changed) selected[key] = true;
  }
  if (draft.termination !== initial.termination || draft.termination === "until" && draft.until !== initial.until || draft.termination === "count" && Number(draft.count) !== Number(initial.count)) selected.termination = true;
  return selected;
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
