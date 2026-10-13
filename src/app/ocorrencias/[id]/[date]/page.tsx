import Link from "next/link";
import { redirect } from "next/navigation";
import { getOccurrence } from "../../../../server/api/occurrences";
import { occurrenceDraft, occurrenceHref } from "../../../../lib/occurrence-input";
import { formatCalendarDate } from "../../../../lib/calendar-date";
import { OccurrenceForm } from "./OccurrenceForm";
import { saveOccurrenceAction } from "./actions";

interface OccurrencePageProps {
  params: Promise<{
    id: string;
    date: string;
  }>;
  searchParams: Promise<{
    saved?: string;
    restored?: string;
    revision?: string | string[];
  }>;
}

export default async function OccurrencePage({ params, searchParams }: OccurrencePageProps) {
  const { id, date } = await params;
  const result = await getOccurrence(id, date);
  if (!result.ok) {
    if (result.status === 401) redirect("/login?reason=expired");
    return <div className="max-w-xl space-y-4"><h1 className="text-2xl font-semibold">{result.status === 404 ? "Ocorrência não encontrada" : "Não foi possível carregar a ocorrência"}</h1><p role="alert" className="text-text-secondary">{result.status === 404 ? "A recorrência pode ter mudado. Volte ao calendário para consultar as ocorrências atuais." : "Tente novamente para consultar os dados atualizados."}</p>{result.status !== 404 && <a href={occurrenceHref(id, date)} className="inline-flex min-h-11 items-center text-primary underline">Tentar novamente</a>}<Link href="/" className="block py-3 text-primary underline">Voltar ao calendário</Link></div>;
  }
  const item = result.data;
  const query = await searchParams;
  const initial = occurrenceDraft(item);
  return <div className="mx-auto max-w-2xl space-y-6">
    {(query.saved === "1" || query.restored === "1") && <p role="status" className="rounded-control bg-status-completed-soft p-3 text-status-completed">{query.restored === "1" ? "Ocorrência restaurada para os valores da recorrência." : "Ocorrência salva."}</p>}
    <header className="space-y-2"><p className="text-sm font-semibold text-primary">Somente esta ocorrência</p><h1 className="wrap-anywhere text-2xl font-semibold">{item.title}</h1><p className="text-sm text-text-secondary">Recorrência · Data original: {formatCalendarDate(item.occurrenceDate, { day: "numeric", month: "long", year: "numeric" })}</p><p className="text-text-secondary">{item.id === null ? "Esta ocorrência segue os valores da recorrência, sem alterações individuais salvas." : "Esta ocorrência possui alterações individuais salvas. Os valores atuais aparecem abaixo."}</p></header>
    <OccurrenceForm key={`${JSON.stringify(item)}:${query.saved ?? ""}:${query.restored ?? ""}:${typeof query.revision === "string" ? query.revision : ""}`} id={id} originalDate={date} initial={initial} hasState={item.id !== null} saveAction={saveOccurrenceAction.bind(null, id, date, initial)} />
    <section className="space-y-2 border-t border-border pt-5"><h2 className="font-semibold">Alterar a recorrência</h2><p className="text-sm text-text-secondary">Para mudar esta ocorrência e as próximas, abra a edição em série. A data original precisa ser hoje ou futura; alterações não salvas acima não serão levadas.</p><Link href={`/recorrencias/${id}/dividir?from=${date}`} prefetch={false} className="inline-flex min-h-11 items-center text-sm font-semibold text-primary underline">Editar esta e as próximas</Link></section>
  </div>;
}
