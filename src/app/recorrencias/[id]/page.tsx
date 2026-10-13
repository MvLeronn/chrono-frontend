import Link from "next/link";
import { InfoDisclosure } from "../../../components/ui/InfoDisclosure";
import { redirect } from "next/navigation";
import { getRecurring } from "../../../server/api/recurring";
import { dayHref, formatCalendarDate } from "../../../lib/calendar-date";
import { recurrenceLabel, recurrenceTermination } from "../../../lib/recurring-input";

interface RecurringDetailProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    created?: string;
    split?: string;
    ended?: string;
  }>;
}

const formatDate = (date: string) => formatCalendarDate(date, { day: "numeric", month: "long", year: "numeric" });
const link = "inline-flex min-h-11 items-center rounded-control text-sm font-semibold text-primary underline underline-offset-4";

export default async function RecurringDetail({ params, searchParams }: RecurringDetailProps) {
  const { id } = await params;
  const result = await getRecurring(id);
  if (!result.ok) {
    if (result.status === 401) redirect("/login?reason=expired");
    return <div className="max-w-xl space-y-4"><h1 className="text-2xl font-semibold">{result.status === 404 ? "Recorrência não encontrada" : "Não foi possível carregar a recorrência"}</h1><p role="alert" className="text-text-secondary">{result.status === 404 ? "Volte à lista para consultar as regras disponíveis." : "Tente novamente para consultar os dados atualizados."}</p>{result.status !== 404 && <a href={`/recorrencias/${encodeURIComponent(id)}`} className={link}>Tentar novamente</a>}<Link href="/recorrencias" className={link}>Voltar às recorrências</Link></div>;
  }
  const item = result.data;
  const query = await searchParams;
  return <div className="mx-auto max-w-xl space-y-4">
    {query.created === "1" && <p role="status" className="rounded-control bg-status-completed-soft p-3 text-status-completed">Recorrência criada.</p>}
    {(query.ended === "1" || query.ended === "unchanged") && <p role="status" className="rounded-control bg-status-completed-soft p-3 text-status-completed">{query.ended === "unchanged" ? "As próximas repetições já estavam encerradas." : "Encerramento salvo."}</p>}
    {query.split === "1" && <p role="status" className="rounded-control bg-status-completed-soft p-3 text-status-completed">Alterações salvas. Histórico preservado.</p>}
    <header className="flex items-start justify-between gap-3"><div className="min-w-0 space-y-1"><p className="text-xs text-text-secondary">{item.type === "TASK" ? "Tarefa" : "Evento"} recorrente</p><h1 className="wrap-anywhere text-2xl font-semibold">{item.title}</h1><p className="text-sm font-semibold text-primary">{recurrenceLabel(item.frequency, item.interval)}</p></div>
      <InfoDisclosure label="Informações da recorrência"><p>Referência: {formatDate(item.startDate)}.</p><p>{item.effectiveUntil !== null && item.effectiveUntil < item.effectiveFrom ? "Este trecho não possui datas efetivas." : `Trecho a partir de ${formatDate(item.effectiveFrom)}${item.effectiveUntil ? ` até ${formatDate(item.effectiveUntil)}, inclusive.` : ", sem corte adicional."}`}</p><p>O término da repetição também se aplica ao trecho. Estes limites não indicam se existe uma continuação.</p>{item.frequency === "WEEKLY" && <p>As repetições usam o dia da semana da referência: {formatCalendarDate(item.startDate, { weekday: "long" })}.</p>}{(item.frequency === "MONTHLY" || item.frequency === "YEARLY") && <p>Quando o dia não existe, usa-se o último dia válido do mês. A referência original é preservada.</p>}{item.count !== null && <p>A contagem parte da referência, independentemente de cancelamentos e reagendamentos.</p>}<p>Edite pela lista de recorrências ou abra uma ocorrência no calendário. Encerrar preserva o histórico e só é permitido no último trecho.</p><Link href={dayHref(item.effectiveFrom)} className={link}>Ver no calendário</Link>{item.previousId && <Link href={`/recorrencias/${item.previousId}`} prefetch={false} className={link}>Ver trecho anterior</Link>}</InfoDisclosure>
    </header>
    <dl className="grid gap-3 rounded-surface border border-border bg-surface p-4 sm:grid-cols-2">
      <div><dt className="text-sm text-text-secondary">Horário</dt><dd className="mt-1 text-sm tabular-nums">{item.startTime ? `${item.startTime}${item.endTime ? ` – ${item.endTime}` : ""}` : "Sem horário"}</dd></div>
      <div><dt className="text-sm text-text-secondary">Término</dt><dd className="mt-1 text-sm">{item.isActive ? recurrenceTermination(item.until, item.count) : "Sem próximas repetições"}</dd></div>
      {item.description && <div className="sm:col-span-2"><dt className="text-sm text-text-secondary">Descrição</dt><dd className="mt-1 whitespace-pre-wrap wrap-anywhere text-sm">{item.description}</dd></div>}
    </dl>
    <div className="flex flex-wrap gap-3"><Link href="/recorrencias" className={link}>Voltar</Link>{item.isActive && <Link href={`/recorrencias/${id}/encerrar`} prefetch={false} className="inline-flex min-h-11 items-center rounded-control text-sm font-semibold text-error">Parar de repetir</Link>}</div>
  </div>;
}
