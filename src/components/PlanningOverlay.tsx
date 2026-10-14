import { NewRecurringScreen } from "../app/recorrencias/nova/NewRecurringScreen";
import { RecurringDetailsScreen } from "../app/recorrencias/[id]/RecurringDetailsScreen";
import { SplitRecurringScreen } from "../app/recorrencias/[id]/dividir/SplitRecurringScreen";
import { EndRecurringScreen } from "../app/recorrencias/[id]/encerrar/EndRecurringScreen";
import { OccurrenceScreen } from "../app/ocorrencias/[id]/[date]/OccurrenceScreen";
import { NewTemplateScreen } from "../app/modelos/nova/NewTemplateScreen";
import { TemplateDetailsScreen } from "../app/modelos/[id]/TemplateDetailsScreen";
import { ApplyTemplateScreen } from "../app/modelos/[id]/aplicar/ApplyTemplateScreen";
import { EditTemplateScreen } from "../app/modelos/[id]/editar/EditTemplateScreen";
import { NewEventScreen } from "../app/atividades/nova/NewEventScreen";
import { EventDetailsScreen } from "../app/atividades/[id]/EventDetailsScreen";
import { EditEventScreen } from "../app/atividades/[id]/editar/EditEventScreen";
import { PlanningModal } from "./PlanningModal";
import type { ReactNode } from "react";

export type PlanningQuery = Record<string, string | string[] | undefined>;

export function PlanningOverlay({ query, base }: { query: PlanningQuery; base: string }) {
  const modal = typeof query.modal === "string" ? query.modal : "";
  if (!modal) return null;
  const id = typeof query.id === "string" ? query.id : "";
  const date = typeof query.date === "string" ? query.date : "";
  const values = Object.fromEntries(Object.entries(query).map(([key, value]) => [key, typeof value === "string" ? value : undefined]));
  const closeQuery = new URLSearchParams();
  for (const key of ["view", "date", "from", "to", "page", "limit", "status"]) {
    const value = values[key];
    if (value) closeQuery.set(key, value);
  }
  const closeHref = base + (closeQuery.size ? `?${closeQuery}` : "");
  let content: ReactNode;
  switch (modal) {
    case "NewRecurring": content = <NewRecurringScreen />; break;
    case "RecurringDetails": content = <RecurringDetailsScreen params={Promise.resolve({ id, date })} searchParams={Promise.resolve(values)} />; break;
    case "SplitRecurring": content = <SplitRecurringScreen params={Promise.resolve({ id, date })} searchParams={Promise.resolve(values)} />; break;
    case "EndRecurring": content = <EndRecurringScreen params={Promise.resolve({ id, date })} />; break;
    case "Occurrence": content = <OccurrenceScreen params={Promise.resolve({ id, date })} searchParams={Promise.resolve(values)} />; break;
    case "NewTemplate": content = <NewTemplateScreen />; break;
    case "TemplateDetails": content = <TemplateDetailsScreen params={Promise.resolve({ id, date })} searchParams={Promise.resolve(values)} />; break;
    case "ApplyTemplate": content = <ApplyTemplateScreen params={Promise.resolve({ id, date })} />; break;
    case "EditTemplate": content = <EditTemplateScreen params={Promise.resolve({ id, date })} />; break;
    case "NewEvent": content = <NewEventScreen searchParams={Promise.resolve(values)} />; break;
    case "EventDetails": content = <EventDetailsScreen params={Promise.resolve({ id, date })} searchParams={Promise.resolve(values)} />; break;
    case "EditEvent": content = <EditEventScreen params={Promise.resolve({ id, date })} />; break;
    default: content = <p role="alert">Esta ação não está disponível. Feche o modal e tente novamente.</p>;
  }
  return <PlanningModal key={`${modal}:${id}:${date}`} closeHref={closeHref}>{content}</PlanningModal>;
}
