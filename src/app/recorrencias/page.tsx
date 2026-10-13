import Link from "next/link";
import { redirect } from "next/navigation";
import { listRecurring } from "../../server/api/recurring";
import { adjacentDate, todayInTimezone } from "../../lib/calendar-date";
import { getCurrentUser } from "../../server/api/auth";
import { nextRecurringDate } from "../../lib/recurring-split";
import { RecurringCardActions } from "./RecurringCardActions";
import { integerInRange, recurrenceLabel } from "../../lib/recurring-input";

interface RecurringPageProps {
  searchParams: Promise<{
    status?: string | string[];
    page?: string | string[];
    limit?: string | string[];
    ended?: string;
    updated?: string;
  }>;
}

const link = "inline-flex min-h-11 items-center rounded-control text-sm font-semibold text-primary underline underline-offset-4";

export default async function RecurringPage({ searchParams }: RecurringPageProps) {
  const query = await searchParams;
  const status = query.status ?? "active";
  if (status !== "active" && status !== "history") return <div className="space-y-4"><h1 className="text-2xl font-semibold">Filtro inválido</h1><p role="alert">Escolha Atuais ou Histórico.</p><Link href="/recorrencias" className={link}>Voltar às atuais</Link></div>;
  const isHistory = status === "history";
  const pageValue = query.page ?? "1";
  const limitValue = query.limit ?? "20";
  if (typeof pageValue !== "string" || !integerInRange(pageValue, 100000) || typeof limitValue !== "string" || !integerInRange(limitValue, 100)) return <div className="space-y-4"><h1 className="text-2xl font-semibold">Paginação inválida</h1><p role="alert">Escolha uma página entre 1 e 100.000 e de 1 a 100 regras por página.</p><Link href="/recorrencias" className={link}>Voltar à primeira página</Link></div>;
  const page = Number(pageValue);
  const limit = Number(limitValue);
  const href = (target: number) => `/recorrencias?status=${status}&page=${target}&limit=${limit}`;
  const [result, session] = await Promise.all([listRecurring(page, limit, status), getCurrentUser()]);
  if (!session.ok && session.status === 401) redirect("/login?reason=expired");
  if (!result.ok) {
    if (result.status === 401) redirect("/login?reason=expired");
    return <div className="space-y-4"><h1 className="text-2xl font-semibold">Não foi possível carregar as recorrências</h1><p role="alert" className="text-text-secondary">Tente novamente para consultar a lista atualizada.</p><a href={href(page)} className={link}>Tentar novamente</a></div>;
  }
  const { items, total } = result.data;
  const pages = Math.ceil(total / limit);
  const today = session.ok ? todayInTimezone(session.data.timezone) : null;
  const futureFrom = today ? adjacentDate(today, 1) : null;
  return <div className="space-y-4">
    {query.ended === "unchanged" && <p role="status" className="rounded-control bg-primary-soft p-3 text-sm text-primary">As próximas repetições já estavam encerradas.</p>}
    {query.ended === "1" && <p role="status" className="rounded-control bg-status-completed-soft p-3 text-sm text-status-completed">Próximas repetições encerradas. O histórico foi preservado.</p>}
    {query.updated === "1" && <p role="status" className="rounded-control bg-status-completed-soft p-3 text-sm text-status-completed">Recorrência atualizada. As ocorrências anteriores foram preservadas.</p>}
    <header className="flex flex-wrap items-start justify-between gap-4"><div className="space-y-2"><h1 className="text-2xl font-semibold">Recorrências</h1></div><Link href="/recorrencias/nova" className="inline-flex min-h-11 items-center rounded-control bg-primary px-4 py-2 text-sm font-semibold text-text-on-primary hover:bg-primary-hover">Nova recorrência</Link></header>
    <nav aria-label="Filtrar recorrências" className="flex gap-1 border-b border-border">
      {[{ value: "active", label: "Atuais" }, { value: "history", label: "Histórico" }].map((tab) => <Link key={tab.value} href={`/recorrencias?status=${tab.value}&limit=${limit}`} prefetch={false} aria-current={status === tab.value ? "page" : undefined} className={`inline-flex min-h-11 items-center border-b-2 px-4 text-sm font-semibold ${status === tab.value ? "border-primary text-primary" : "border-transparent text-text-secondary hover:bg-surface"}`}>{tab.label}</Link>)}
    </nav>
    <p className="text-sm text-text-secondary">{total} {total === 1 ? "regra" : "regras"}</p>
    {items.length ? <ul className="grid grid-cols-1 items-start gap-2 sm:grid-cols-[repeat(auto-fill,minmax(16rem,19rem))]">{items.map((item) => {
      const nextDate = futureFrom ? nextRecurringDate(item, futureFrom) : null;
      const historical = isHistory;
      return <li key={item.id} className="flex min-w-0 flex-col rounded-surface border border-border bg-surface p-3">
        <div className="flex items-center justify-between gap-2"><div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary"><span>{item.type === "TASK" ? "Tarefa" : "Evento"}</span>{historical && <span className="rounded-control bg-background px-2 py-1">Histórico</span>}</div><RecurringCardActions item={item} nextDate={nextDate} stopFrom={futureFrom ? futureFrom > item.effectiveFrom ? futureFrom : item.effectiveFrom : null} historical={historical} /></div>
        <h2 className="min-w-0 font-semibold"><Link href={`/recorrencias/${item.id}`} prefetch={false} className="block min-h-11 rounded-control py-2 wrap-anywhere hover:text-primary">{item.title}</Link></h2>
        <p className="text-sm text-text-secondary">{recurrenceLabel(item.frequency, item.interval)}</p>
        <p className="mt-1 text-sm tabular-nums text-text-secondary">{item.startTime ? `${item.startTime}${item.endTime ? ` – ${item.endTime}` : ""}` : "Sem horário"}</p>

      </li>;
    })}</ul> : <div className="space-y-3 rounded-surface border border-border bg-surface p-6"><h2 className="font-semibold">{total === 0 ? isHistory ? "Nenhuma recorrência no histórico" : "Nenhuma recorrência atual" : "Nenhuma regra nesta página"}</h2><p className="text-text-secondary">{total === 0 ? isHistory ? "Os trechos anteriores e as recorrências encerradas aparecerão aqui." : "Crie uma recorrência para planejar atividades que se repetem." : "Volte à primeira página para consultar as regras disponíveis."}</p><Link href={total === 0 ? isHistory ? "/recorrencias" : "/recorrencias/nova" : href(1)} className={link}>{total === 0 ? isHistory ? "Ver atuais" : "Criar recorrência" : "Ir para a primeira página"}</Link></div>}
    {(pages > 1 || page > 1) && <nav aria-label="Paginação das recorrências" className="flex flex-wrap items-center gap-4">
      {page > 1 && <Link href={href(page - 1)} prefetch={false} className={link}>Página anterior</Link>}
      <p className="text-sm tabular-nums">Página {page}{pages > 0 ? ` · ${pages} ${pages === 1 ? "página disponível" : "páginas disponíveis"}` : ""}</p>
      {page < pages && page < 100000 && <Link href={href(page + 1)} prefetch={false} className={link}>Próxima página</Link>}
    </nav>}
  </div>;
}
