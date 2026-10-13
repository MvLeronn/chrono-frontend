import Link from "next/link";
import { redirect } from "next/navigation";
import { listTemplates } from "../../server/api/templates";
import { integerInRange } from "../../lib/recurring-input";
import { weekdays } from "../../lib/template-input";

interface TemplatesPageProps {
  searchParams: Promise<{
    page?: string | string[];
    limit?: string | string[];
    archived?: string | string[];
  }>;
}

const link = "inline-flex min-h-11 items-center rounded-control text-sm font-semibold text-primary underline underline-offset-4";

export default async function TemplatesPage({ searchParams }: TemplatesPageProps) {
  const query = await searchParams;
  const pageValue = query.page ?? "1";
  const limitValue = query.limit ?? "20";
  if (typeof pageValue !== "string" || !integerInRange(pageValue, 100000) || typeof limitValue !== "string" || !integerInRange(limitValue, 100)) return <div className="space-y-4"><h1 className="text-2xl font-semibold">Paginação inválida</h1><p role="alert">Escolha uma página entre 1 e 100.000 e de 1 a 100 modelos por página.</p><Link href="/modelos" className={link}>Voltar à primeira página</Link></div>;
  const page = Number(pageValue);
  const limit = Number(limitValue);
  const href = (target: number) => `/modelos?page=${target}&limit=${limit}`;
  const result = await listTemplates(page, limit);
  if (!result.ok) {
    if (result.status === 401) redirect("/login?reason=expired");
    return <div className="space-y-4"><h1 className="text-2xl font-semibold">Não foi possível carregar os modelos</h1><p role="alert" className="text-text-secondary">Tente novamente para consultar a lista atualizada.</p><a href={href(page)} className={link}>Tentar novamente</a></div>;
  }
  const { items, total } = result.data;
  const pages = Math.ceil(total / limit);
  return <div className="space-y-4">
    {query.archived === "1" && <p role="status" className="rounded-control bg-status-completed-soft p-3 text-sm text-status-completed">Modelo arquivado. As atividades já criadas permanecem no calendário.</p>}
    <header className="flex flex-wrap items-start justify-between gap-4"><div className="space-y-2"><h1 className="text-2xl font-semibold">Modelos semanais</h1></div><Link href="/modelos/nova" className="inline-flex min-h-11 items-center rounded-control bg-primary px-4 py-2 text-sm font-semibold text-text-on-primary hover:bg-primary-hover">Novo modelo</Link></header>
    <p className="text-sm text-text-secondary">{total} {total === 1 ? "modelo disponível" : "modelos disponíveis"}</p>
    {items.length ? <ul className="divide-y divide-border rounded-surface border border-border bg-surface px-4 sm:px-6">{items.map((item) => <li key={item.id} className="space-y-2 py-4"><h2 className="wrap-anywhere font-semibold"><Link href={`/modelos/${item.id}`} prefetch={false} className={link}>{item.name}</Link></h2><p className="text-sm text-text-secondary">{item.items.length} {item.items.length === 1 ? "item" : "itens"}</p><p className="text-sm">{weekdays.filter((_, index) => item.items.some((entry) => entry.weekday === index + 1)).join(" · ") || "Modelo vazio"}</p></li>)}</ul> : <div className="space-y-3 rounded-surface border border-border bg-surface p-6"><h2 className="font-semibold">{total === 0 ? "Nenhum modelo disponível" : "Nenhum modelo nesta página"}</h2><p className="text-text-secondary">{total === 0 ? "Crie um modelo para organizar as atividades de uma semana." : "Volte à primeira página para consultar os modelos disponíveis."}</p><Link href={total === 0 ? "/modelos/nova" : href(1)} className={link}>{total === 0 ? "Criar modelo" : "Ir para a primeira página"}</Link></div>}
    <nav aria-label="Paginação dos modelos" className="flex flex-wrap items-center gap-4">{page > 1 && <Link href={href(page - 1)} prefetch={false} className={link}>Página anterior</Link>}<p className="text-sm tabular-nums">Página {page}{pages > 0 ? ` · ${pages} ${pages === 1 ? "página disponível" : "páginas disponíveis"}` : ""}</p>{page < pages && page < 100000 && <Link href={href(page + 1)} prefetch={false} className={link}>Próxima página</Link>}</nav>
  </div>;
}
