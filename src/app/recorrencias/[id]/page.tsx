import Link from "next/link";
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
  return <div className="mx-auto max-w-2xl space-y-6">
    {query.created === "1" && <p role="status" className="rounded-control bg-status-completed-soft p-3 text-status-completed">Recorrência criada.</p>}
    {query.split === "1" && <p role="status" className="rounded-control bg-status-completed-soft p-3 text-status-completed">Alterações salvas. Este é o novo trecho da recorrência; as ocorrências anteriores foram preservadas.</p>}
    <header className="space-y-2"><p className="text-sm text-text-secondary">{item.type === "TASK" ? "Tarefa" : "Evento"} recorrente</p><h1 className="wrap-anywhere text-2xl font-semibold">{item.title}</h1><p className="font-semibold text-primary">{recurrenceLabel(item.frequency, item.interval)}</p></header>
    <dl className="space-y-5 rounded-surface border border-border bg-surface p-4 sm:p-6">
      <div><dt className="text-sm text-text-secondary">Data de referência da repetição</dt><dd className="mt-1">{formatDate(item.startDate)}</dd></div>
      <div><dt className="text-sm text-text-secondary">Horário</dt><dd className="mt-1 tabular-nums">{item.startTime ? `${item.startTime}${item.endTime ? ` – ${item.endTime}` : " · Sem horário de fim"}` : "Sem horário"}</dd></div>
      <div><dt className="text-sm text-text-secondary">Término da repetição</dt><dd className="mt-1">{recurrenceTermination(item.until, item.count)}</dd></div>
      <div><dt className="text-sm text-text-secondary">Limites deste trecho</dt><dd className="mt-1">{item.effectiveUntil !== null && item.effectiveUntil < item.effectiveFrom ? "Este trecho não possui datas efetivas." : `A partir de ${formatDate(item.effectiveFrom)}${item.effectiveUntil ? ` até ${formatDate(item.effectiveUntil)}, inclusive.` : ", sem corte adicional."}`}<p className="mt-2 text-sm text-text-secondary">O término da repetição também se aplica a este trecho. Esses limites não indicam se há uma continuação da série.</p></dd></div>
      <div><dt className="text-sm text-text-secondary">Descrição</dt><dd className="mt-1 whitespace-pre-wrap wrap-anywhere">{item.description || "Sem descrição."}</dd></div>
    </dl>
    <div className="space-y-2 text-sm text-text-secondary">
      {item.frequency === "WEEKLY" && <p>Uma ocorrência por semana selecionada, sempre no mesmo dia da semana da referência: {formatCalendarDate(item.startDate, { weekday: "long" })}.</p>}
      {(item.frequency === "MONTHLY" || item.frequency === "YEARLY") && <p>Quando o dia não existe, usa-se o último dia válido do mês. A referência original é preservada para as repetições seguintes, inclusive em anos bissextos.</p>}
      {item.count !== null && <p>A contagem parte da data de referência, independentemente de cancelamentos e reagendamentos.</p>}
      <p>Para editar, abra uma ocorrência no calendário e escolha somente ela ou esta e as próximas.</p>
    </div>
    <div className="flex flex-wrap gap-4"><Link href="/recorrencias" className={link}>Voltar às recorrências</Link><Link href={dayHref(item.effectiveFrom)} className={link}>Ver data de início do trecho no calendário</Link>{item.previousId && <Link href={`/recorrencias/${item.previousId}`} prefetch={false} className={link}>Ver trecho anterior</Link>}</div>
  </div>;
}
