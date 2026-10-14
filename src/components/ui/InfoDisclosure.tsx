import { Info } from "lucide-react";
import type { ReactNode } from "react";

export function InfoDisclosure({ label = "Mais informações", children }: { label?: string; children: ReactNode }) {
  return <details className="relative shrink-0">
    <summary aria-label={label} title={label} className="flex size-11 cursor-pointer list-none items-center justify-center rounded-full text-text-secondary hover:bg-background [&::-webkit-details-marker]:hidden"><Info aria-hidden="true" className="size-4" /></summary>
    <div className="absolute top-full right-0 z-30 mt-1 max-h-72 w-[min(22rem,calc(100vw-6rem))] space-y-2 overflow-auto rounded-2xl border border-border bg-surface p-4 text-sm leading-6 text-text-secondary shadow-lg">{children}</div>
  </details>;
}
