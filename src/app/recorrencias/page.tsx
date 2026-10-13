import Link from "next/link";
import { redirect } from "next/navigation";
import { listRecurring } from "../../server/api/recurring";
import { formatCalendarDate } from "../../lib/calendar-date";
import { integerInRange, recurrenceLabel, recurrenceTermination } from "../../lib/recurring-input";

interface RecurringPageProps {
  searchParams: Promise<{
    page?: string | string[];
    limit?: string | string[];
  }>;
}

const link = "inline-flex min-h-11 items-center rounded-control text-sm font-semibold text-primary underline underline-offset-4";
const formatDate = (date: string) => formatCalendarDate(date, { day: "numeric", month: "short", year: "numeric" });

export default async function RecurringPage({ searchParams }: RecurringPageProps) {
  const query = await searchParams;
  const pageValue = query.page ?? "1";
  const limitValue = query.limit ?? "20";
  if (typeof pageValue !== "string" || !integerInRange(pageValue, 100000) || typeof limitValue !== "string" || !integerInRange(limitValue, 100)) return <div className="space-y-4"><h1 className="text-2xl font-semibold">Paginação inválida</h1><p role="alert">Escolha uma página entre 1 e 100.000 e de 1 a 100 regras por página.</p><Link href="/recorrencias" className={link}>Voltar à primeira página</Link></div>;
  const page = Number(pageValue);
  const limit = Number(limitValue);
  const href = (target: number) => `/recorrencias?page=${target}&limit=${limit}`;
  const result = await listRecurring(page, limit);
  if (!result.ok) {
    if (result.status === 401) redirect("/login?reason=expired");
    return <div className="space-y-4"><h1 className="text-2xl font-semibold">Não foi possível carregar as recorrências</h1><p role="alert" className="text-text-secondary">Tente novamente para consultar a lista atualizada.</p><a href={href(page)} className={link}>Tentar novamente</a></div>;
  }
  const { items, total } = result.data;
  const pages = Math.ceil(total / limit);
  return <div className="space-y-6">
    <header className="flex flex-wrap items-start justify-between gap-4"><div className="space-y-2"><h1 className="text-2xl font-semibold">Recorrências</h1><p className="text-text-secondary">Atividades que se repetem, incluindo regras anteriores e com término definido.</p></div><Link href="/recorrencias/nova" className="inline-flex min-h-11 items-center rounded-control bg-primary px-4 py-2 text-sm font-semibold text-text-on-primary hover:bg-primary-hover">Nova recorrência</Link></header>
    <p className="text-sm text-text-secondary">{total} {total === 1 ? "regra" : "regras"}. Uma mesma série pode ter vários trechos; cada um aparece separadamente.</p>
    {items.length ? <ul className="divide-y divide-border rounded-surface border border-border bg-surface px-4 sm:px-6">{items.map((item) => <li key={item.id} className="grid gap-3 py-5 md:grid-cols-[minmax(0,1fr)_minmax(12rem,0.6fr)]">
      <div className="min-w-0 space-y-2"><p className="text-xs text-text-secondary">{item.type === "TASK" ? "Tarefa" : "Evento"}{item.previousId ? " · Continuação de uma série" : " · Início de uma série"}</p><h2 className="wrap-anywhere font-semibold"><Link href={`/recorrencias/${item.id}`} prefetch={false} className={link}>{item.title}</Link></h2><p className="text-sm">{recurrenceLabel(item.frequency, item.interval)} · {item.startTime ? `${item.startTime}${item.endTime ? ` – ${item.endTime}` : " · Sem horário de fim"}` : "Sem horário"}</p><p className="text-sm text-text-secondary">{recurrenceTermination(item.until, item.count)}</p></div>
      <div className="space-y-2 text-sm text-text-secondary"><p>Referência: <span className="tabular-nums">{formatDate(item.startDate)}</span></p><p>Trecho a partir de {formatDate(item.effectiveFrom)}</p><p>{item.effectiveUntil === null ? "Sem corte adicional neste trecho" : item.effectiveUntil < item.effectiveFrom ? "Trecho sem datas efetivas" : `Trecho limitado até ${formatDate(item.effectiveUntil)}`}</p></div>
    </li>)}</ul> : <div className="space-y-3 rounded-surface border border-border bg-surface p-6"><h2 className="font-semibold">{total === 0 ? "Nenhuma recorrência criada" : "Nenhuma regra nesta página"}</h2><p className="text-text-secondary">{total === 0 ? "Crie uma recorrência para planejar atividades que se repetem." : "Volte à primeira página para consultar as regras disponíveis."}</p><Link href={total === 0 ? "/recorrencias/nova" : href(1)} className={link}>{total === 0 ? "Criar recorrência" : "Ir para a primeira página"}</Link></div>}
    <nav aria-label="Paginação das recorrências" className="flex flex-wrap items-center gap-4">
      {page > 1 && <Link href={href(page - 1)} prefetch={false} className={link}>Página anterior</Link>}
      <p className="text-sm tabular-nums">Página {page}{pages > 0 ? ` · ${pages} ${pages === 1 ? "página disponível" : "páginas disponíveis"}` : ""}</p>
      {page < pages && page < 100000 && <Link href={href(page + 1)} prefetch={false} className={link}>Próxima página</Link>}
    </nav>
  </div>;
}
