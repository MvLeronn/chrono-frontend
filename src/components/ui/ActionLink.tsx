import Link from "next/link";
import type { ComponentProps } from "react";

export function ActionLink({ className = "", ...props }: ComponentProps<typeof Link>) {
  return <Link {...props} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-text-on-primary hover:bg-primary-hover ${className}`} />;
}
