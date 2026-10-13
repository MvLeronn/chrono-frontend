"use client";

import { EndRecurringForm } from "./[id]/encerrar/EndRecurringForm";
import { stopRecurringAction } from "./actions";

export function StopRecurringForm({ id, version, fromDate, effectiveFrom, effectiveUntil, onCancel }: { id: string; version: string; fromDate: string; effectiveFrom: string; effectiveUntil: string | null; onCancel: () => void }) {
  return <EndRecurringForm id={id} minimum={fromDate} effectiveFrom={effectiveFrom} effectiveUntil={effectiveUntil} saveAction={stopRecurringAction.bind(null, id, version)} onCancel={onCancel} />;
}
