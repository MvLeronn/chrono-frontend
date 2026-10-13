"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Repeat2, LayoutTemplate } from "lucide-react";

export function PrivateNavigation() {
  const pathname = usePathname();
  const recurring = pathname.startsWith("/recorrencias");
  const templates = pathname.startsWith("/modelos");
  return <nav aria-label="Navegação principal" className="flex min-w-0 flex-wrap gap-1 lg:mt-4 lg:flex-col">
    {[{ href: "/", label: "Calendário", active: !recurring && !templates, Icon: CalendarDays }, { href: "/recorrencias", label: "Recorrências", active: recurring, Icon: Repeat2 }, { href: "/modelos", label: "Modelos", active: templates, Icon: LayoutTemplate }].map(({ href, label, active, Icon }) => <Link key={href} href={href} prefetch={false} aria-current={active ? "page" : undefined} className={`flex min-h-11 items-center gap-2 rounded-control px-3 py-2 text-sm font-semibold hover:bg-background ${active ? "bg-primary-soft text-primary" : "text-text-secondary"}`}><Icon aria-hidden="true" className="size-5 shrink-0" />{label}</Link>)}
  </nav>;
}
