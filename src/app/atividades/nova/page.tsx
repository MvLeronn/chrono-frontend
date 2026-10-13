import { getCurrentUser } from "../../../server/api/auth";
import { parseCalendarDate, todayInTimezone } from "../../../lib/calendar-date";
import { isLocalTime } from "../../../lib/event-input";
import { EventForm } from "./EventForm";
import { redirect } from "next/navigation";

interface NewEventPageProps {
  searchParams: Promise<{
    date?: string;
    time?: string;
  }>;
}

export default async function NewEventPage({ searchParams }: NewEventPageProps) {
  const session = await getCurrentUser();
  if (!session.ok && session.status === 401) redirect("/login?reason=expired");
  if (!session.ok) return <div className="space-y-4"><h1 className="text-2xl font-semibold">Não foi possível abrir o formulário</h1><p role="alert">O serviço está indisponível. Tente novamente em instantes.</p><a href="" className="inline-flex min-h-11 items-center text-primary underline">Tentar novamente</a></div>;
  const params = await searchParams;
  const date = typeof params.date === "string" && parseCalendarDate(params.date) ? params.date : todayInTimezone(session.data.timezone);
  const time = typeof params.time === "string" && isLocalTime(params.time) ? params.time : "";
  return <div className="mx-auto max-w-2xl"><header className="mb-6 space-y-2"><h1 className="text-2xl font-semibold">Nova atividade</h1><p className="text-text-secondary">Organize um evento ou uma tarefa.</p><p className="break-words text-xs text-text-secondary">Fuso do planejamento: {session.data.timezone}</p></header><EventForm date={date} time={time} /></div>;
}
