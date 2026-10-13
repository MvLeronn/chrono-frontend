import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "../../../../server/api/auth";
import { getRecurring } from "../../../../server/api/recurring";
import { todayInTimezone } from "../../../../lib/calendar-date";
import { endRecurringAction } from "./actions";
import { EndRecurringForm } from "./EndRecurringForm";

interface EndRecurringPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EndRecurringPage({ params }: EndRecurringPageProps) {
  const { id } = await params;
  const [session, rule] = await Promise.all([getCurrentUser(), getRecurring(id)]);
  if (!session.ok || !rule.ok) {
    if (!session.ok && session.status === 401 || !rule.ok && rule.status === 401) redirect("/login?reason=expired");
    const missing = !rule.ok && rule.status === 404;
    return <div className="space-y-4"><h1 className="text-2xl font-semibold">{missing ? "Recorrência não encontrada" : "Não foi possível abrir o encerramento"}</h1><p role="alert">{missing ? "Volte à lista para consultar as regras atuais." : "Tente novamente para carregar os dados atuais."}</p>{!missing && <a href="" className="inline-flex min-h-11 items-center text-primary underline">Tentar novamente</a>}<Link href="/recorrencias" className="block py-3 text-primary underline">Voltar às recorrências</Link></div>;
  }
  const item = rule.data;
  const today = todayInTimezone(session.data.timezone);
  const minimum = today > item.effectiveFrom ? today : item.effectiveFrom;
  return <div className="mx-auto max-w-2xl space-y-6"><header className="space-y-2"><p className="text-sm text-text-secondary">Encerrar recorrência</p><h1 className="wrap-anywhere text-2xl font-semibold">{item.title}</h1><p className="text-text-secondary">Escolha a partir de quando impedir novas datas da recorrência. Somente um trecho sem continuação pode ser encerrado.</p><p className="break-words text-xs text-text-secondary">Fuso do planejamento: {session.data.timezone}</p></header><EndRecurringForm key={item.updatedAt} id={id} minimum={minimum} effectiveFrom={item.effectiveFrom} effectiveUntil={item.effectiveUntil} saveAction={endRecurringAction.bind(null, id, item.updatedAt)} /></div>;
}
