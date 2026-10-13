import { validateEvent } from "./event-input";
import type { ResolvedOccurrence } from "../models/calendar";
import type { UpdateOccurrenceInput } from "../models/occurrence";
import type { OccurrenceDraft, OccurrenceModes } from "../app/ocorrencias/[id]/[date]/state";

export function occurrenceHref(id: string, date: string): string {
  return `/ocorrencias/${encodeURIComponent(id)}/${encodeURIComponent(date)}`;
}

export function occurrenceDraft(item: ResolvedOccurrence): OccurrenceDraft {
  return { title: item.title, type: item.type, description: item.description ?? "", date: item.date, startTime: item.startTime ?? "", endTime: item.endTime ?? "", status: item.status };
}

export function buildOccurrenceInput(initial: OccurrenceDraft, draft: OccurrenceDraft, modes: OccurrenceModes) {
  const candidate = {
    ...draft,
    title: modes.title === "custom" ? draft.title.trim() : initial.title,
    type: modes.type === "custom" ? draft.type : initial.type,
    description: modes.description === "custom" ? draft.description : initial.description,
    startTime: modes.time === "custom" ? draft.startTime : initial.startTime,
    endTime: modes.time === "custom" ? draft.endTime : initial.endTime,
  };
  const errors = validateEvent(candidate);
  const input: UpdateOccurrenceInput = {};
  if (Object.keys(errors).length) return { input, errors };
  if (draft.date !== initial.date) input.scheduledDate = draft.date;
  if (draft.status !== initial.status) input.status = draft.status as UpdateOccurrenceInput["status"];
  // Selecting custom is intentional even when its value matches today's inherited value.
  if (modes.title !== "keep") input.titleOverride = modes.title === "inherit" ? null : candidate.title;
  if (modes.type !== "keep") input.typeOverride = modes.type === "inherit" ? null : candidate.type as "TASK" | "EVENT";
  if (modes.description !== "keep") input.descriptionOverride = modes.description === "inherit" ? null : candidate.description;
  if (modes.time !== "keep") input.timeOverride = modes.time === "inherit" ? null : { startTime: candidate.startTime || null, endTime: candidate.endTime || null };
  return { input, errors };
}
