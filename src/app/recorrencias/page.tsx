import { PlanningOverlay } from "../../components/PlanningOverlay";
import { PageHeading } from "../../components/ui/PageHeading";
import { ActionLink } from "../../components/ui/ActionLink";
import { FilterTabs, FilterLink } from "../../components/ui/FilterTabs";
import Link from "next/link";
import { Plus, Repeat2 } from "lucide-react";
import { redirect } from "next/navigation";
import { listRecurring } from "../../server/api/recurring";
import { adjacentDate, todayInTimezone } from "../../lib/calendar-date";
import { getCurrentUser } from "../../server/api/auth";
import { nextRecurringDate } from "../../lib/recurring-split";
import { RecurringCardActions } from "./RecurringCardActions";
import { integerInRange, recurrenceLabel } from "../../lib/recurring-input";

interface RecurringPageProps {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
    status?: string | string[];
    page?: string | string[];
    limit?: string | string[];
    ended?: string;
    updated?: string;
  }>;
}

const link = "inline-flex min-h-11 items-center rounded-control text-sm font-semibold text-primary  ";

export default async function RecurringPage({ searchParams }: RecurringPageProps) {
  const query = await searchParams;
  const status = query.status ?? "active";
  if (status !== "active" && status !== "history") return <div className="space-y-4"><h1 className="text-2xl font-medium tracking-tight">Filtro inválido</h1><p role="alert">Escolha Atuais ou Histórico.</p><Link href="/recorrencias" className={link}>Voltar às atuais</Link></div>;
  const isHistory = status === "history";
  const pageValue = query.page ?? "1";
  const limitValue = query.limit ?? "20";
  if (typeof pageValue !== "string" || !integerInRange(pageValue, 100000) || typeof limitValue !== "string" || !integerInRange(limitValue, 100)) return <div className="space-y-4"><h1 className="text-2xl font-medium tracking-tight">Paginação inválida</h1><p role="alert">Escolha uma página entre 1 e 100.000 e de 1 a 100 regras por página.</p><Link href="/recorrencias" className={link}>Voltar à primeira página</Link></div>;
  const page = Number(pageValue);
  const limit = Number(limitValue);
  const href = (target: number) => `/recorrencias?status=${status}&page=${target}&limit=${limit}`;
  const [result, session] = await Promise.all([listRecurring(page, limit, status), getCurrentUser()]);
  if (!session.ok && session.status === 401) redirect("/login?reason=expired");
  if (!result.ok) {
    if (result.status === 401) redirect("/login?reason=expired");
    return <div className="space-y-4"><h1 className="text-2xl font-medium tracking-tight">Não foi possível carregar as recorrências</h1><p role="alert" className="text-text-secondary">Tente novamente para consultar a lista atualizada.</p><a href={href(page)} className={link}>Tentar novamente</a></div>;
  }
  const { items, total } = result.data;
  const pages = Math.ceil(total / limit);
  const today = session.ok ? todayInTimezone(session.data.timezone) : null;
  const futureFrom = today ? adjacentDate(today, 1) : null;
  return <div className="space-y-6">
    <PlanningOverlay query={query} base="/recorrencias" />
    {query.ended === "unchanged" && <p role="status" className="rounded-control bg-primary-soft p-3 text-sm text-primary">As próximas repetições já estavam encerradas.</p>}
    {query.ended === "1" && <p role="status" className="rounded-control bg-status-completed-soft p-3 text-sm text-status-completed">Próximas repetições encerradas. O histórico foi preservado.</p>}
    {query.updated === "1" && <p role="status" className="rounded-control bg-status-completed-soft p-3 text-sm text-status-completed">Recorrência atualizada. As ocorrências anteriores foram preservadas.</p>}
    <PageHeading title="Recorrências" description="Organize as atividades que fazem parte da sua rotina."><ActionLink href="/recorrencias?modal=NewRecurring"><Plus aria-hidden="true" className="size-4" />Nova recorrência</ActionLink></PageHeading>
    <FilterTabs role="navigation" aria-label="Filtrar recorrências">
      {[{ value: "active", label: "Atuais" }, { value: "history", label: "Histórico" }].map((tab) => <FilterLink key={tab.value} href={`/recorrencias?status=${tab.value}&limit=${limit}`} prefetch={false} aria-current={status === tab.value ? "page" : undefined}>{tab.label}</FilterLink>)}
    </FilterTabs>
    <p className="text-sm text-text-secondary">{total} {total === 1 ? "regra" : "regras"}</p>
    {items.length ? <ul className="grid grid-cols-1 items-start gap-4 sm:grid-cols-[repeat(auto-fill,minmax(min(100%,18rem),1fr))]">{items.map((item) => {
      const nextDate = futureFrom ? nextRecurringDate(item, futureFrom) : null;
      const historical = isHistory;
      return <li key={item.id} className="flex min-w-0 flex-col rounded-surface border border-border bg-background/40 p-5">
        <div className="flex items-start justify-between gap-2">
          <h2 className="min-w-0 flex-1 font-semibold"><Link href={`/recorrencias?modal=RecurringDetails&id=${item.id}`} prefetch={false} className="block min-h-11 rounded-control py-2 wrap-anywhere hover:text-primary">{item.title}</Link></h2>
          <RecurringCardActions item={item} nextDate={nextDate} stopFrom={futureFrom ? futureFrom > item.effectiveFrom ? futureFrom : item.effectiveFrom : null} historical={historical} />
        </div>
        {historical && <span className="mb-2 w-fit rounded-control bg-background px-2 py-1 text-xs text-text-secondary">Histórico</span>}
        <p className="mt-3 flex items-center gap-2 text-sm text-text-secondary"><Repeat2 aria-hidden="true" className="size-4 shrink-0" />{recurrenceLabel(item.frequency, item.interval)}</p>
        {item.startTime && <p className="mt-1 text-sm tabular-nums text-text-secondary">{item.startTime}{item.endTime ? ` – ${item.endTime}` : ""}</p>}

      </li>;
    })}</ul> : <div className="space-y-3 rounded-surface border border-border bg-surface p-6"><h2 className="font-semibold">{total === 0 ? isHistory ? "Nenhuma recorrência no histórico" : "Nenhuma recorrência atual" : "Nenhuma regra nesta página"}</h2><p className="text-text-secondary">{total === 0 ? isHistory ? "Os trechos anteriores e as recorrências encerradas aparecerão aqui." : "Crie uma recorrência para planejar atividades que se repetem." : "Volte à primeira página para consultar as regras disponíveis."}</p><Link href={total === 0 ? isHistory ? "/recorrencias" : "/recorrencias?modal=NewRecurring" : href(1)} className={link}>{total === 0 ? isHistory ? "Ver atuais" : "Criar recorrência" : "Ir para a primeira página"}</Link></div>}
    {(pages > 1 || page > 1) && <nav aria-label="Paginação das recorrências" className="flex flex-wrap items-center gap-4">
      {page > 1 && <Link href={href(page - 1)} prefetch={false} className={link}>Página anterior</Link>}
      <p className="text-sm tabular-nums">Página {page}{pages > 0 ? ` · ${pages} ${pages === 1 ? "página disponível" : "páginas disponíveis"}` : ""}</p>
      {page < pages && page < 100000 && <Link href={href(page + 1)} prefetch={false} className={link}>Próxima página</Link>}
    </nav>}
  </div>;
}
