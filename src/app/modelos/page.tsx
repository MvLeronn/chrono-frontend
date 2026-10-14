import { PlanningOverlay } from "../../components/PlanningOverlay";
import { PageHeading } from "../../components/ui/PageHeading";
import { ActionLink } from "../../components/ui/ActionLink";
import Link from "next/link";
import { Files, Plus, ArrowUpRight } from "lucide-react";
import { redirect } from "next/navigation";
import { listTemplates } from "../../server/api/templates";
import { integerInRange } from "../../lib/recurring-input";
import { weekdays } from "../../lib/template-input";

interface TemplatesPageProps {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
    page?: string | string[];
    limit?: string | string[];
    archived?: string | string[];
  }>;
}

const link = "inline-flex min-h-11 items-center rounded-control text-sm font-semibold text-primary  ";

export default async function TemplatesPage({ searchParams }: TemplatesPageProps) {
  const query = await searchParams;
  const pageValue = query.page ?? "1";
  const limitValue = query.limit ?? "20";
  if (typeof pageValue !== "string" || !integerInRange(pageValue, 100000) || typeof limitValue !== "string" || !integerInRange(limitValue, 100)) return <div className="space-y-4"><h1 className="text-2xl font-medium tracking-tight">Paginação inválida</h1><p role="alert">Escolha uma página entre 1 e 100.000 e de 1 a 100 modelos por página.</p><Link href="/modelos" className={link}>Voltar à primeira página</Link></div>;
  const page = Number(pageValue);
  const limit = Number(limitValue);
  const href = (target: number) => `/modelos?page=${target}&limit=${limit}`;
  const result = await listTemplates(page, limit);
  if (!result.ok) {
    if (result.status === 401) redirect("/login?reason=expired");
    return <div className="space-y-4"><h1 className="text-2xl font-medium tracking-tight">Não foi possível carregar os modelos</h1><p role="alert" className="text-text-secondary">Tente novamente para consultar a lista atualizada.</p><a href={href(page)} className={link}>Tentar novamente</a></div>;
  }
  const { items, total } = result.data;
  const pages = Math.ceil(total / limit);
  return <div className="space-y-6">
    <PlanningOverlay query={query} base="/modelos" />
    {query.archived === "1" && <p role="status" className="rounded-control bg-status-completed-soft p-3 text-sm text-status-completed">Modelo arquivado. As atividades já criadas permanecem no calendário.</p>}
    <PageHeading title="Modelos semanais" description="Seu planejamento, pronto para reutilizar."><ActionLink href="/modelos?modal=NewTemplate"><Plus aria-hidden="true" className="size-4" />Novo modelo</ActionLink></PageHeading>
    <p className="text-sm text-text-secondary">{total} {total === 1 ? "modelo disponível" : "modelos disponíveis"}</p>
    {items.length ? <ul className="grid gap-4 sm:grid-cols-[repeat(auto-fill,minmax(min(100%,18rem),1fr))]">{items.map((item) => <li key={item.id} className="min-w-0">
      <Link href={`/modelos?modal=TemplateDetails&id=${item.id}`} prefetch={false} className="group flex h-full flex-col gap-4 rounded-surface border border-border bg-background/40 p-5 hover:border-field hover:bg-background">
        <div className="flex items-center justify-between"><Files aria-hidden="true" className="size-6 text-primary" /><ArrowUpRight aria-hidden="true" className="size-4 text-text-secondary group-hover:text-primary" /></div>
        <div><h2 className="wrap-anywhere font-semibold">{item.name}</h2><p className="mt-1 text-sm text-text-secondary">{item.items.length} {item.items.length === 1 ? "item" : "itens"}</p></div>
        <div className="mt-auto flex flex-wrap gap-1.5">{weekdays.filter((_, index) => item.items.some((entry) => entry.weekday === index + 1)).map((day) => <span key={day} className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-text-secondary">{day}</span>)}{item.items.length === 0 && <span className="text-sm text-text-secondary">Modelo vazio</span>}</div>
      </Link>
    </li>)}</ul> : <div className="space-y-3 rounded-surface border border-border bg-background/40 p-6"><Files aria-hidden="true" className="mb-4 size-7 text-text-secondary" /><h2 className="font-semibold">{total === 0 ? "Nenhum modelo disponível" : "Nenhum modelo nesta página"}</h2><p className="text-text-secondary">{total === 0 ? "Crie um modelo para organizar as atividades de uma semana." : "Volte à primeira página para consultar os modelos disponíveis."}</p><Link href={total === 0 ? "/modelos?modal=NewTemplate" : href(1)} className={link}>{total === 0 ? "Criar modelo" : "Ir para a primeira página"}</Link></div>}
    <nav aria-label="Paginação dos modelos" className="flex flex-wrap items-center gap-4">{page > 1 && <Link href={href(page - 1)} prefetch={false} className={link}>Página anterior</Link>}<p className="text-sm tabular-nums">Página {page}{pages > 0 ? ` · ${pages} ${pages === 1 ? "página disponível" : "páginas disponíveis"}` : ""}</p>{page < pages && page < 100000 && <Link href={href(page + 1)} prefetch={false} className={link}>Próxima página</Link>}</nav>
  </div>;
}
