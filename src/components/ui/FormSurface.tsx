"use client";

import { createContext, useContext, type ComponentProps } from "react";

export const FormPresentation = createContext<"panel" | "embedded">("panel");

export function FormSurface({ embedded, compact = false, className = "", ...props }: ComponentProps<"form"> & { embedded?: boolean; compact?: boolean }) {
  const presentation = useContext(FormPresentation);
  const panel = !embedded && presentation !== "embedded";
  return <form {...props} className={`${panel ? `rounded-surface border border-border bg-surface p-4 ${compact ? "" : "sm:p-6"}` : ""} ${className}`} />;
}
