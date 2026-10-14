import Link from "next/link";
import { redirect } from "next/navigation";
import { getTemplate } from "../../../server/api/templates";
import { weekdays } from "../../../lib/template-input";
import { ArchiveTemplateForm } from "./ArchiveTemplateForm";

interface TemplatePageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    created?: string | string[];
    updated?: string | string[];
  }>;
}

const link = "inline-flex min-h-11 items-center rounded-control text-sm font-semibold text-primary  ";

export async function TemplateDetailsScreen({ params, searchParams }: TemplatePageProps) {
  const { id } = await params;
  const result = await getTemplate(id);
  if (!result.ok) {
    if (result.status === 401) redirect("/login?reason=expired");
    const missing = result.status === 404;
    return <div className="space-y-4"><h1 className="text-2xl font-medium tracking-tight">{missing ? "Modelo não encontrado" : "Não foi possível carregar o modelo"}</h1><p role="alert" className="text-text-secondary">{missing ? "O modelo não está disponível ou foi arquivado." : "Tente novamente para consultar os dados atualizados."}</p>{!missing && <a href={`/modelos?modal=TemplateDetails&id=${encodeURIComponent(id)}`} className={link}>Tentar novamente</a>}<Link href="/modelos" className={link}>Voltar aos modelos</Link></div>;
  }
  const item = result.data;
  const query = await searchParams;
  return <div className="mx-auto max-w-3xl space-y-6">
    <Link href="/modelos" className={link}>Voltar aos modelos</Link>
    {query.created === "1" && <p role="status" className="rounded-control bg-status-completed-soft p-3 text-sm text-status-completed">Modelo criado. Nenhuma atividade foi adicionada ao calendário.</p>}
    {query.updated === "1" && <p role="status" className="rounded-control bg-status-completed-soft p-3 text-sm text-status-completed">Modelo atualizado. As atividades já criadas foram preservadas.</p>}
    <header className="space-y-2"><p className="text-sm text-text-secondary">Modelo semanal · {item.items.length} {item.items.length === 1 ? "item" : "itens"}</p><h1 className="wrap-anywhere text-2xl font-medium tracking-tight">{item.name}</h1><p className="text-sm text-text-secondary">Este modelo é uma definição de semana. Alterações no modelo não modificam atividades já criadas a partir dele.</p></header>
    <div className="flex flex-wrap gap-4"><Link href={`/modelos?modal=EditTemplate&id=${id}`} prefetch={false} className={link}>Editar modelo</Link><Link href={`/modelos?modal=ApplyTemplate&id=${id}`} prefetch={false} className={link}>Aplicar em uma semana</Link></div>
    {item.items.length === 0 ? <div className="space-y-2 rounded-surface border border-border bg-surface p-6"><h2 className="font-semibold">Modelo vazio</h2><p className="text-text-secondary">Este modelo foi salvo sem itens.</p></div> : <div className="divide-y divide-border rounded-surface border border-border bg-surface px-4 sm:px-6">{weekdays.map((day, index) => {
      const entries = item.items.filter((entry) => entry.weekday === index + 1);
      return <section key={day} aria-labelledby={`weekday-${index}`} className="grid gap-3 py-5 sm:grid-cols-[9rem_minmax(0,1fr)]"><h2 id={`weekday-${index}`} className="text-sm font-semibold text-primary">{day}</h2>{entries.length ? <ul className="min-w-0 space-y-5">{entries.map((entry) => <li key={entry.id} className="space-y-1"><p className="text-xs text-text-secondary">{entry.type === "TASK" ? "Tarefa" : "Evento"} · <span className="tabular-nums">{entry.startTime ? `${entry.startTime}${entry.endTime ? ` – ${entry.endTime}` : " · Sem horário de fim"}` : "Sem horário"}</span></p><h3 className="wrap-anywhere font-semibold">{entry.title}</h3>{entry.description && <p className="wrap-anywhere whitespace-pre-wrap text-sm text-text-secondary">{entry.description}</p>}</li>)}</ul> : <p className="text-sm text-text-secondary">Sem itens</p>}</section>;
    })}</div>}
    <ArchiveTemplateForm id={id} name={item.name} updatedAt={item.updatedAt} />
  </div>;
}
