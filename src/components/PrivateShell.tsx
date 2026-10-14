"use client";

import { Clock3, LogOut, Menu } from "lucide-react";
import { PrivateNavigation } from "./PrivateNavigation";
import { logoutAction } from "../app/actions/session";
import { useState, type ReactNode } from "react";

interface PrivateShellProps {
  children: ReactNode;
  sidebar?: ReactNode;
}

export function PrivateShell({ children, sidebar }: PrivateShellProps) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={`grid min-h-dvh grid-cols-[64px_minmax(0,1fr)] ${expanded ? "md:grid-cols-[224px_minmax(0,1fr)]" : ""}`} onKeyDown={(event) => { if (event.key === "Escape") setExpanded(false); }}>
      <a href="#main-content" className="sr-only z-10 rounded-control bg-surface p-3 font-semibold text-primary focus:not-sr-only focus:absolute focus:left-4 focus:top-4">Pular para o conteúdo</a>
      <aside className={`sticky top-0 flex h-dvh min-w-0 flex-col bg-background ${expanded ? "max-md:z-40 max-md:w-56 max-md:shadow-[8px_0_24px_rgb(23_43_58_/_12%)]" : ""}`}>
        <div className="flex h-16 shrink-0 items-center gap-3 px-2.5">
          <button type="button" onClick={() => setExpanded(!expanded)} aria-expanded={expanded} aria-controls="main-navigation" aria-label={expanded ? "Recolher menu principal" : "Expandir menu principal"} title={expanded ? "Recolher menu" : "Expandir menu"} className="flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-border/50"><Menu aria-hidden="true" className="size-5" /></button>
          {expanded && <span className="flex items-center gap-2 text-lg font-semibold tracking-tight text-primary"><Clock3 aria-hidden="true" className="size-5" />Chrono</span>}
        </div>
        <div id="main-navigation" className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-2.5 pb-3">
          <PrivateNavigation expanded={expanded} />
          {expanded && sidebar}
          <form action={logoutAction} className="mt-auto pt-4">
            <button type="submit" aria-label="Sair" title="Sair" className={`flex min-h-11 items-center gap-3 rounded-full text-sm text-text-secondary hover:bg-border/50 ${expanded ? "w-full px-3" : "w-11 justify-center"}`}><LogOut aria-hidden="true" className="size-5 shrink-0" />{expanded && "Sair"}</button>
          </form>
        </div>
      </aside>
      {expanded && <button type="button" aria-label="Recolher menu principal" onClick={() => setExpanded(false)} className="fixed inset-0 left-56 z-30 bg-text-primary/10 md:hidden" />}
      <main id="main-content" tabIndex={-1} className="min-w-0 p-2 sm:py-3 sm:pr-4 sm:pl-1">
        {children}
      </main>
    </div>
  );
}
