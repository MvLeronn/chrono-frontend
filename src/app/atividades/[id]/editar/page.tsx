import Link from "next/link";
import { redirect } from "next/navigation";
import { getEvent } from "../../../../server/api/events";
import { eventDraft } from "../../../../lib/event-input";
import { EventForm } from "../../nova/EventForm";
import { updateEventAction } from "../actions";

interface EditEventPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params;
  const result = await getEvent(id);
  if (!result.ok) {
    if (result.status === 401) redirect("/login?reason=expired");
    return <div className="max-w-xl space-y-4"><h1 className="text-2xl font-semibold">{result.status === 404 ? "Atividade não encontrada" : "Não foi possível abrir a edição"}</h1><p role="alert" className="text-text-secondary">{result.status === 404 ? "Ela pode ter sido excluída. Volte ao calendário." : "Tente novamente para carregar os dados atuais."}</p>{result.status !== 404 && <a href={`/atividades/${encodeURIComponent(id)}/editar`} className="inline-flex min-h-11 items-center text-primary underline">Tentar novamente</a>}<Link href="/" className="block py-3 text-primary underline">Voltar ao calendário</Link></div>;
  }
  const initial = eventDraft(result.data);
  return <div className="mx-auto max-w-2xl space-y-6">
    <header className="space-y-2"><h1 className="text-2xl font-semibold">Editar atividade</h1><p className="text-text-secondary">Altere os dados, reagende ou atualize o status.</p>{result.data.templateApplicationId && <p className="text-sm text-text-secondary">As alterações afetam somente esta cópia; o modelo semanal permanece igual.</p>}</header>
    <EventForm key={result.data.updatedAt} date={initial.date} time={initial.startTime} initialDraft={initial} saveAction={updateEventAction.bind(null, id, initial)} cancelHref={`/atividades/${id}`} />
  </div>;
}
