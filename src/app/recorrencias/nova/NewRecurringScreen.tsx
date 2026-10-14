import { redirect } from "next/navigation";
import { getCurrentUser } from "../../../server/api/auth";
import { todayInTimezone } from "../../../lib/calendar-date";
import { RecurringForm } from "./RecurringForm";

export async function NewRecurringScreen() {
  const session = await getCurrentUser();
  if (!session.ok && session.status === 401) redirect("/login?reason=expired");
  if (!session.ok) return <div className="space-y-4"><h1 className="text-2xl font-medium tracking-tight">Não foi possível abrir o formulário</h1><p role="alert">Tente novamente em instantes.</p><a href="" className="inline-flex min-h-11 items-center text-primary ">Tentar novamente</a></div>;
  return <div className="mx-auto max-w-xl space-y-4"><header className="space-y-1"><h1 className="text-xl font-semibold">Nova recorrência</h1><p className="text-sm text-text-secondary">Defina uma atividade e quando ela se repete.</p><p className="break-words text-xs text-text-secondary">Fuso do planejamento: {session.data.timezone}</p></header><RecurringForm date={todayInTimezone(session.data.timezone)} /></div>;
}

