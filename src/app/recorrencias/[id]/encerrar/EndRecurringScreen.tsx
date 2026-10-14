import Link from "next/link";
import { InfoDisclosure } from "../../../../components/ui/InfoDisclosure";
import { redirect } from "next/navigation";
import { getCurrentUser } from "../../../../server/api/auth";
import { getRecurring } from "../../../../server/api/recurring";
import { adjacentDate, todayInTimezone } from "../../../../lib/calendar-date";
import { endRecurringAction } from "./actions";
import { EndRecurringForm } from "./EndRecurringForm";

interface EndRecurringPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function EndRecurringScreen({ params }: EndRecurringPageProps) {
  const { id } = await params;
  const [session, rule] = await Promise.all([getCurrentUser(), getRecurring(id)]);
  if (!session.ok || !rule.ok) {
    if (!session.ok && session.status === 401 || !rule.ok && rule.status === 401) redirect("/login?reason=expired");
    const missing = !rule.ok && rule.status === 404;
    return <div className="space-y-4"><h1 className="text-2xl font-medium tracking-tight">{missing ? "Recorrência não encontrada" : "Não foi possível abrir o encerramento"}</h1><p role="alert">{missing ? "Volte à lista para consultar as regras atuais." : "Tente novamente para carregar os dados atuais."}</p>{!missing && <a href="" className="inline-flex min-h-11 items-center text-primary ">Tentar novamente</a>}<Link href="/recorrencias" className="block py-3 text-primary ">Voltar às recorrências</Link></div>;
  }
  const item = rule.data;
  if (!item.isActive) return <div className="mx-auto max-w-md space-y-4"><h1 className="wrap-anywhere text-2xl font-medium tracking-tight">{item.title}</h1><p role="status" className="text-text-secondary">Este trecho não tem próximas repetições.</p><Link href={`/recorrencias?modal=RecurringDetails&id=${id}`} className="inline-flex min-h-11 items-center text-sm font-semibold text-primary">Voltar</Link></div>;
  const today = todayInTimezone(session.data.timezone);
  const futureFrom = adjacentDate(today, 1) ?? today;
  const minimum = futureFrom > item.effectiveFrom ? futureFrom : item.effectiveFrom;
  return <div className="mx-auto max-w-md space-y-4"><header className="flex items-start justify-between gap-3"><div className="min-w-0 space-y-1"><p className="text-sm text-text-secondary">Encerrar recorrência</p><h1 className="wrap-anywhere text-2xl font-medium tracking-tight">{item.title}</h1></div><InfoDisclosure label="Informações do planejamento"><p>Fuso do planejamento: {session.data.timezone}</p></InfoDisclosure></header><EndRecurringForm key={item.updatedAt} id={id} minimum={minimum} effectiveFrom={item.effectiveFrom} effectiveUntil={item.effectiveUntil} saveAction={endRecurringAction.bind(null, id, item.updatedAt)} /></div>;
}
