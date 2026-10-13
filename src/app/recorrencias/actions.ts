"use server";

import { endRecurringAction } from "./[id]/encerrar/actions";
import { splitRecurringAction } from "./[id]/dividir/actions";
import type { EndRecurringState } from "./[id]/encerrar/state";
import type { RecurringDraft, RecurringFormState } from "./nova/state";

export async function stopRecurringAction(id: string, version: string, previous: EndRecurringState, formData: FormData): Promise<EndRecurringState> {
  return endRecurringAction(id, version, previous, formData, true);
}

export async function editRecurringFromListAction(id: string, fromDate: string, initial: RecurringDraft, previous: RecurringFormState, formData: FormData): Promise<RecurringFormState> {
  return splitRecurringAction(id, fromDate, initial, previous, formData, true);
}
