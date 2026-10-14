import type { ReactNode } from "react";

export function PageHeading({ title, description, children }: { title: string; description: string; children?: ReactNode }) {
  return <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
    <div className="space-y-2"><h1 className="text-2xl font-medium tracking-tight">{title}</h1><p className="text-sm text-text-secondary">{description}</p></div>
    {children}
  </header>;
}
