import Link from "next/link";
import { redirect } from "next/navigation";
import { getEvent } from "../../../server/api/events";
import { dayHref, formatCalendarDate } from "../../../lib/calendar-date";
import { activityStatuses } from "../../../components/calendar/ActivityRow";

interface EventPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    created?: string;
  }>;
}

export default async function EventPage({ params, searchParams }: EventPageProps) {
  const { id } = await params;
  const result = await getEvent(id);
  if (!result.ok) {
    if (result.status === 401) redirect("/login?reason=expired");
    return <div className="max-w-xl space-y-4"><h1 className="text-2xl font-semibold">{result.status === 404 ? "Atividade não encontrada" : "Não foi possível carregar a atividade"}</h1><p role="alert" className="text-text-secondary">{result.status === 404 ? "Ela pode ter sido removida. Volte ao calendário para consultar suas atividades." : "Tente novamente para consultar os dados atualizados."}</p>{result.status !== 404 && <a href={`/atividades/${encodeURIComponent(id)}`} className="inline-flex min-h-11 items-center text-primary underline">Tentar novamente</a>}<Link href="/" className="block py-3 text-primary underline">Voltar ao calendário</Link></div>;
  }
  const item = result.data;
  const query = await searchParams;
  return <div className="mx-auto max-w-2xl space-y-6">
    {query.created === "1" && <p role="status" className="rounded-control bg-status-completed-soft p-3 text-status-completed">Atividade criada.</p>}
    <header className="space-y-2"><p className="text-sm text-text-secondary">{item.type === "TASK" ? "Tarefa" : "Evento"}</p><h1 className="wrap-anywhere text-2xl font-semibold">{item.title}</h1></header>
    <dl className="space-y-5 rounded-surface border border-border bg-surface p-4 sm:p-6">
      <div><dt className="text-sm text-text-secondary">Data</dt><dd className="mt-1 font-semibold">{formatCalendarDate(item.date, { day: "numeric", month: "long", year: "numeric" })}</dd></div>
      <div><dt className="text-sm text-text-secondary">Horário</dt><dd className="mt-1 tabular-nums">{item.startTime ? `${item.startTime}${item.endTime ? ` – ${item.endTime}` : " · Sem horário de fim"}` : "Sem horário"}</dd></div>
      <div><dt className="text-sm text-text-secondary">Status</dt><dd className={`mt-1 w-fit rounded-control px-2 py-1 text-sm font-semibold ${activityStatuses[item.status].className}`}>{activityStatuses[item.status].label}</dd></div>
      <div><dt className="text-sm text-text-secondary">Origem</dt><dd>{item.templateApplicationId ? "Modelo semanal" : "Atividade avulsa"}</dd></div>
      <div><dt className="text-sm text-text-secondary">Descrição</dt><dd className="mt-1 whitespace-pre-wrap wrap-anywhere">{item.description || "Sem descrição."}</dd></div>
    </dl>
    <Link href={dayHref(item.date)} className="inline-flex min-h-11 items-center rounded-control font-semibold text-primary underline underline-offset-4">Ver no calendário</Link>
  </div>;
}
