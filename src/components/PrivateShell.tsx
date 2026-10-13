import Link from "next/link";
import { CalendarDays, Clock3, LogOut } from "lucide-react";
import { logoutAction } from "../app/actions/session";
import { Button } from "./ui/Button";
import type { ReactNode } from "react";

interface PrivateShellProps {
  children: ReactNode;
}

export function PrivateShell({ children }: PrivateShellProps) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[14rem_minmax(0,1fr)]">
      <a href="#main-content" className="sr-only z-10 rounded-control bg-surface p-3 font-semibold text-primary focus:not-sr-only focus:absolute focus:left-4 focus:top-4">Pular para o conteúdo</a>
      <aside className="flex flex-col gap-4 border-b border-border bg-surface p-4 sm:px-6 lg:border-r lg:border-b-0 lg:px-4 lg:py-8">
        <div className="flex items-center gap-2 text-primary lg:px-3">
          <Clock3 aria-hidden="true" className="size-6" />
          <span className="text-xl font-semibold tracking-tight">Chrono</span>
        </div>
        <div className="flex items-center justify-between gap-3 lg:flex-1 lg:flex-col lg:items-stretch lg:gap-8">
          <nav aria-label="Navegação principal" className="min-w-0 lg:mt-4">
            <Link href="/" prefetch={false} aria-current="page" className="flex min-h-11 items-center gap-2 rounded-control bg-primary-soft px-3 py-2 text-sm font-semibold text-primary hover:bg-background">
              <CalendarDays aria-hidden="true" className="size-5 shrink-0" />Calendário
            </Link>
          </nav>
          <form action={logoutAction}>
            <Button type="submit" variant="secondary" className="lg:w-full"><LogOut aria-hidden="true" className="size-4" />Sair</Button>
          </form>
        </div>
      </aside>
      <main id="main-content" tabIndex={-1} className="min-w-0 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
