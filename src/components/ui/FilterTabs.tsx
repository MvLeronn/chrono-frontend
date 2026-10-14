import Link from "next/link";
import type { ComponentProps } from "react";

const groupClass = "flex w-fit max-w-full gap-1 overflow-x-auto rounded-[2rem] border border-border p-1";
const tabClass = "inline-flex min-h-11 shrink-0 items-center justify-center rounded-[2rem] px-4 py-2 text-sm font-medium text-text-secondary hover:bg-background aria-[current=page]:bg-primary aria-[current=page]:text-text-on-primary aria-selected:bg-primary aria-selected:text-text-on-primary";

export function FilterTabs({ className = "", ...props }: ComponentProps<"div">) {
  return <div {...props} className={`${groupClass} ${className}`} />;
}

export function FilterTab({ className = "", ...props }: ComponentProps<"button">) {
  return <button type="button" {...props} className={`${tabClass} ${className}`} />;
}

export function FilterLink({ className = "", ...props }: ComponentProps<typeof Link>) {
  return <Link {...props} className={`${tabClass} ${className}`} />;
}
