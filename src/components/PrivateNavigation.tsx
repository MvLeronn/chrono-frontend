"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Repeat2, Files, CircleHelp } from "lucide-react";

export function PrivateNavigation({ expanded = true }: { expanded?: boolean }) {
  const pathname = usePathname();
  const help = pathname.startsWith("/explicacoes");
  const recurring = pathname.startsWith("/recorrencias");
  const templates = pathname.startsWith("/modelos");
  return <nav aria-label="Navegação principal" className="flex min-w-0 flex-col gap-2">
    {[{ href: "/", label: "Calendário", active: !recurring && !templates && !help, Icon: CalendarDays }, { href: "/recorrencias", label: "Recorrências", active: recurring, Icon: Repeat2 }, { href: "/modelos", label: "Modelos", active: templates, Icon: Files }, { href: "/explicacoes", label: "Explicações", active: help, Icon: CircleHelp }].map(({ href, label, active, Icon }) => <Link key={href} href={href} prefetch={false} aria-label={label} title={!expanded ? label : undefined} aria-current={active ? "page" : undefined} className={`flex min-h-11 shrink-0 items-center gap-3 rounded-full text-sm font-medium ${expanded ? "px-3" : "w-11 justify-center"} ${active ? "bg-primary-soft text-primary" : "text-text-secondary hover:bg-border/50"}`}><Icon aria-hidden="true" className="size-5 shrink-0" />{expanded && label}</Link>)}
  </nav>;
}
