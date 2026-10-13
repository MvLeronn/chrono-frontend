import Link from "next/link";
import { InfoDisclosure } from "../ui/InfoDisclosure";
import { formatCalendarDate } from "../../lib/calendar-date";
import { occurrenceHref } from "../../lib/occurrence-input";
import type { ActivityStatus } from "../../models/calendar";
import type { CalendarItem } from "../../models/calendar";

interface ActivityRowProps {
  item: CalendarItem;
  id?: string;
}

interface ActivityStatusPresentation {
  label: string;
  className: string;
}

export const activityStatuses: Record<ActivityStatus, ActivityStatusPresentation> = {
  PENDING: { label: "Pendente", className: "bg-status-pending-soft text-status-pending" },
  IN_PROGRESS: { label: "Em andamento", className: "bg-status-in-progress-soft text-status-in-progress" },
  COMPLETED: { label: "Concluído", className: "bg-status-completed-soft text-status-completed" },
  CANCELED: { label: "Cancelado", className: "bg-status-canceled-soft text-status-canceled" },
};

export function ActivityRow({ item, id }: ActivityRowProps) {
  const status = activityStatuses[item.status];
  const origin = item.source === "RECURRING" ? "Recorrência" : item.templateApplicationId ? "Modelo semanal" : "Atividade avulsa";
  return (
    <li id={id} tabIndex={id ? -1 : undefined} className="grid min-w-0 scroll-mt-4 gap-2 border-b border-border py-2 last:border-b-0 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-4">
      <p className="text-sm font-semibold tabular-nums">
        {item.startTime ? <><time>{item.startTime}</time>{item.endTime ? <> – <time>{item.endTime}</time></> : <span className="mt-1 block text-xs font-normal text-text-secondary">Sem horário de fim</span>}</> : "Sem horário"}
      </p>
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
        <h3 className="min-w-0 flex-1 basis-full wrap-anywhere font-semibold sm:basis-0"><Link href={item.source === "EVENT" ? `/atividades/${item.id}` : occurrenceHref(item.recurringEventId, item.occurrenceDate)} prefetch={false} className="inline-flex min-h-11 items-center rounded-control text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary">{item.title}</Link></h3>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-text-secondary">
          <span>{item.type === "TASK" ? "Tarefa" : "Evento"}</span>
          <span className={`rounded-control px-2 py-1 font-semibold ${status.className}`}>{status.label}</span>
          <span>Origem: {origin}</span>
          {item.source === "RECURRING" && item.date !== item.occurrenceDate && <InfoDisclosure label="Informações do reagendamento"><p>Ocorrência de {formatCalendarDate(item.occurrenceDate, { day: "2-digit", month: "2-digit", year: "numeric" })}, reagendada para {formatCalendarDate(item.date, { day: "2-digit", month: "2-digit", year: "numeric" })}.</p><p>Encerrar a série preserva ocorrências anteriores ao corte, inclusive as reagendadas.</p></InfoDisclosure>}
        </div>
        {item.description && <details className="w-full text-sm"><summary className="w-fit cursor-pointer rounded-control py-2 font-semibold text-primary">Descrição</summary><p className="whitespace-pre-wrap wrap-anywhere pb-2 text-text-secondary">{item.description}</p></details>}
      </div>
    </li>
  );
}
