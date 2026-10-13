import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "../server/api/auth";
import { logoutAction } from "./actions/session";
import { Button } from "../components/ui/Button";
import { PrivateShell } from "../components/PrivateShell";
import { CalendarPreview } from "../components/calendar/CalendarPreview";
import { parseCalendarDate, todayInTimezone } from "../lib/calendar-date";

export default async function HomePage({ searchParams }: { searchParams: Promise<{ date?: string | string[] }> }) {
  const session = await getCurrentUser();
  if (!session.ok && session.status === 401) {
    redirect(session.code === "NO_SESSION" ? "/login" : "/login?reason=expired");
  }

  if (session.ok) {
    const params = await searchParams;
    const today = todayInTimezone(session.data.timezone);
    const validDate = typeof params.date === "string" && parseCalendarDate(params.date) !== null;
    const selectedDate = typeof params.date === "string" && validDate ? params.date : today;

    return (
      <PrivateShell>
        <CalendarPreview selectedDate={selectedDate} today={today} timezone={session.data.timezone} invalidDate={params.date !== undefined && !validDate} />
      </PrivateShell>
    );
  }

  return (
    <main className="flex min-h-dvh flex-col px-4 py-8 sm:px-6">
      <section className="mx-auto my-auto w-full max-w-100 space-y-6 rounded-surface border border-border bg-surface p-4 sm:p-6">
        <p className="text-sm font-semibold text-primary">Chrono</p>
        <h1 className="text-2xl font-semibold leading-8">Não foi possível verificar seu acesso.</h1>
        <p role="alert" className="text-text-secondary">O serviço está indisponível no momento. Tente novamente em instantes.</p>
        <Link href="/" prefetch={false} className="inline-flex min-h-11 items-center rounded-control font-semibold text-primary underline underline-offset-4">Tentar novamente</Link>
        <form action={logoutAction}>
          <Button type="submit" variant="secondary" className="w-full">Sair</Button>
        </form>
      </section>
    </main>
  );
}
