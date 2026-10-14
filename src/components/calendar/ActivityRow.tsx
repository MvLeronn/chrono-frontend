import { ActivityDetails } from "./ActivityDetails";
import { activityStatuses } from "./activity-status";
import type { CalendarItem } from "../../models/calendar";

export function ActivityRow({ item, id }: { item: CalendarItem; id?: string }) {
  const status = activityStatuses[item.status];
  return <li id={id} tabIndex={id ? -1 : undefined} className="min-w-0 scroll-mt-4 rounded-surface border border-border bg-surface p-3">
    <ActivityDetails item={item} className="flex min-h-11 w-full items-center rounded-control text-left font-semibold text-text-primary hover:text-primary"><span className="wrap-anywhere">{item.title}</span></ActivityDetails>
    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-text-secondary">
      <span>{item.startTime ? `${item.startTime}${item.endTime ? ` – ${item.endTime}` : ""}` : item.type === "TASK" ? "Tarefa" : "Evento"}</span>
      <ActivityDetails item={item} statusOnly className={`min-h-11 rounded-control px-3 font-semibold ${status.className} hover:ring-1 hover:ring-current`}>{status.label}</ActivityDetails>
    </div>
  </li>;
}
