import { redirect } from "next/navigation";
import { getCurrentUser } from "../../../server/api/auth";
import { todayInTimezone } from "../../../lib/calendar-date";
import { RecurringForm } from "./RecurringForm";

export default async function NewRecurringPage() {
  const session = await getCurrentUser();
  if (!session.ok && session.status === 401) redirect("/login?reason=expired");
  if (!session.ok) return <div className="space-y-4"><h1 className="text-2xl font-semibold">Não foi possível abrir o formulário</h1><p role="alert">Tente novamente em instantes.</p><a href="" className="inline-flex min-h-11 items-center text-primary underline">Tentar novamente</a></div>;
  return <div className="mx-auto max-w-2xl space-y-6"><header className="space-y-2"><h1 className="text-2xl font-semibold">Nova recorrência</h1><p className="text-text-secondary">Defina uma atividade e quando ela se repete.</p><p className="break-words text-xs text-text-secondary">Fuso do planejamento: {session.data.timezone}</p></header><RecurringForm date={todayInTimezone(session.data.timezone)} /></div>;
}

