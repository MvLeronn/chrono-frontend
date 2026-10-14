import Link from "next/link";
import { redirect } from "next/navigation";
import { getTemplate } from "../../../../server/api/templates";
import { getCurrentUser } from "../../../../server/api/auth";
import { todayInTimezone, weekRange } from "../../../../lib/calendar-date";
import { templateWeekEnd } from "../../../../lib/template-apply";
import { ApplyTemplateForm } from "./ApplyTemplateForm";
import { applyTemplateAction } from "./actions";

interface ApplyTemplatePageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function ApplyTemplateScreen({ params }: ApplyTemplatePageProps) {
  const { id } = await params;
  const session = await getCurrentUser();
  if (!session.ok && session.status === 401) redirect("/login?reason=expired");
  if (!session.ok) return <div className="space-y-4"><h1 className="text-2xl font-medium tracking-tight">Não foi possível abrir a aplicação</h1><p role="alert">Tente novamente em instantes.</p><a href="" className="inline-flex min-h-11 items-center text-primary ">Tentar novamente</a></div>;
  const result = await getTemplate(id);
  if (!result.ok) {
    if (result.status === 401) redirect("/login?reason=expired");
    const missing = result.status === 404;
    return <div className="space-y-4"><h1 className="text-2xl font-medium tracking-tight">{missing ? "Modelo não encontrado" : "Não foi possível carregar o modelo"}</h1><p role="alert">{missing ? "O modelo não está disponível ou foi arquivado." : "Tente novamente para consultar os dados atualizados."}</p>{!missing && <a href={`/modelos?modal=ApplyTemplate&id=${encodeURIComponent(id)}`} className="inline-flex min-h-11 items-center text-primary ">Tentar novamente</a>}<Link href="/modelos" className="inline-flex min-h-11 items-center text-primary ">Voltar aos modelos</Link></div>;
  }
  const monday = weekRange(todayInTimezone(session.data.timezone)).from;
  const action = applyTemplateAction.bind(null, id, result.data.updatedAt);
  return <div className="mx-auto max-w-2xl space-y-6"><header className="space-y-2"><h1 className="text-2xl font-medium tracking-tight">Aplicar modelo semanal</h1><p className="wrap-anywhere font-semibold">{result.data.name}</p><p className="text-text-secondary">Escolha a semana que receberá as atividades deste modelo.</p><p className="break-words text-xs text-text-secondary">Fuso do planejamento: {session.data.timezone}</p></header><ApplyTemplateForm id={id} itemCount={result.data.items.length} initialDate={templateWeekEnd(monday) ? monday : ""} saveAction={action} /></div>;
}
