import type { ActivityStatus, CalendarItem } from "../../lib/calendar-types";
import Link from "next/link";

export const activityStatuses: Record<ActivityStatus, { label: string; className: string }> = {
  PENDING: { label: "Pendente", className: "bg-status-pending-soft text-status-pending" },
  IN_PROGRESS: { label: "Em andamento", className: "bg-status-in-progress-soft text-status-in-progress" },
  COMPLETED: { label: "Concluído", className: "bg-status-completed-soft text-status-completed" },
  CANCELED: { label: "Cancelado", className: "bg-status-canceled-soft text-status-canceled" },
};

export function ActivityRow({ item, id }: { item: CalendarItem; id?: string }) {
  const status = activityStatuses[item.status];
  const origin = item.source === "RECURRING" ? "Recorrência" : item.templateApplicationId ? "Modelo semanal" : "Atividade avulsa";
  return (
    <li id={id} tabIndex={id ? -1 : undefined} className="grid min-w-0 scroll-mt-4 gap-2 border-b border-border py-4 last:border-b-0 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-4">
      <p className="text-sm font-semibold tabular-nums">
        {item.startTime ? <><time>{item.startTime}</time>{item.endTime ? <> – <time>{item.endTime}</time></> : <span className="mt-1 block text-xs font-normal text-text-secondary">Sem horário de fim</span>}</> : "Sem horário"}
      </p>
      <div className="min-w-0 space-y-2">
        <h3 className="wrap-anywhere font-semibold">{item.title}</h3>
        {item.source === "EVENT" && <Link href={`/atividades/${item.id}`} prefetch={false} className="inline-flex min-h-11 items-center rounded-control text-sm font-semibold text-primary underline underline-offset-4">Ver detalhes</Link>}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-text-secondary">
          <span>{item.type === "TASK" ? "Tarefa" : "Evento"}</span>
          <span className={`rounded-control px-2 py-1 font-semibold ${status.className}`}>{status.label}</span>
          <span>Origem: {origin}</span>
        </div>
        {item.description && <details className="text-sm"><summary className="w-fit cursor-pointer rounded-control py-2 font-semibold text-primary">Descrição</summary><p className="whitespace-pre-wrap wrap-anywhere pb-2 text-text-secondary">{item.description}</p></details>}
      </div>
    </li>
  );
}

