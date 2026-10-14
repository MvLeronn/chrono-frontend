import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "../../../../server/api/auth";
import { getRecurring } from "../../../../server/api/recurring";
import { getOccurrence } from "../../../../server/api/occurrences";
import { parseCalendarDate, todayInTimezone } from "../../../../lib/calendar-date";
import { recurringDraft } from "../../../../lib/recurring-split";
import { occurrenceHref } from "../../../../lib/occurrence-input";
import { RecurringForm } from "../../nova/RecurringForm";
import { splitRecurringAction } from "./actions";

interface SplitPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string | string[] }>;
}

export async function SplitRecurringScreen({ params, searchParams }: SplitPageProps) {
  const { id } = await params;
  const { from } = await searchParams;
  const session = await getCurrentUser();
  if (!session.ok && session.status === 401) redirect("/login?reason=expired");
  if (!session.ok) return <div className="space-y-4"><h1 className="text-2xl font-medium tracking-tight">Não foi possível verificar seu acesso</h1><a href="" className="inline-flex min-h-11 items-center text-primary ">Tentar novamente</a></div>;
  if (typeof from !== "string" || !parseCalendarDate(from) || from < todayInTimezone(session.data.timezone)) return <div className="space-y-4"><h1 className="text-2xl font-medium tracking-tight">Escolha uma ocorrência atual ou futura</h1><p role="alert">A edição em série usa a data original da ocorrência no fuso da conta, mesmo após reagendamento.</p><Link href="/" className="inline-flex min-h-11 items-center text-primary ">Escolher no calendário</Link></div>;
  const [rule, occurrence] = await Promise.all([getRecurring(id), getOccurrence(id, from)]);
  if (!rule.ok || !occurrence.ok) {
    const failed = !rule.ok ? rule : !occurrence.ok ? occurrence : null;
    if (failed?.status === 401) redirect("/login?reason=expired");
    return <div className="space-y-4"><h1 className="text-2xl font-medium tracking-tight">Não foi possível abrir a edição em série</h1><p role="alert">{failed?.status === 404 ? "A ocorrência pode ter mudado. Selecione-a novamente no calendário." : "Tente novamente para consultar os dados atuais."}</p>{failed?.status !== 404 && <a href="" className="inline-flex min-h-11 items-center text-primary ">Tentar novamente</a>}<Link href="/" className="block py-3 text-primary ">Voltar ao calendário</Link></div>;
  }
  const initial = recurringDraft(rule.data);
  return <div className="mx-auto max-w-xl space-y-4"><header className="space-y-2"><p className="text-sm font-semibold text-primary">Esta ocorrência e as próximas</p><h1 className="text-2xl font-medium tracking-tight">Editar recorrência</h1><Link href={occurrenceHref(id, from)} className="inline-flex min-h-11 items-center text-sm font-semibold text-primary ">Editar somente esta ocorrência</Link></header><RecurringForm date={initial.startDate} initialDraft={initial} splitFrom={from} saveAction={splitRecurringAction.bind(null, id, from, initial)} /></div>;
}
