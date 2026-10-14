import { LoaderCircle } from "lucide-react";
import type { ReactNode } from "react";
import type { MouseEventHandler } from "react";

interface ButtonProps {
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
  loadingLabel?: string;
}

const variants = {
  danger: "border-error bg-error text-text-on-primary enabled:hover:bg-error/90",
  primary: "border-primary bg-primary text-text-on-primary enabled:hover:border-primary-hover enabled:hover:bg-primary-hover",
  secondary: "border-border bg-surface text-text-primary enabled:hover:bg-background enabled:hover:border-field",
};

export function Button({
  variant = "primary",
  type = "button",
  loading = false,
  loadingLabel = "Enviando…",
  disabled,
  className = "",
  children,
  onClick,
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border px-5 py-2.5 text-sm font-semibold leading-5 transition-colors motion-reduce:transition-none disabled:cursor-not-allowed ${disabled && !loading ? "border-border bg-background text-text-secondary" : variants[variant]} ${className}`}
    >
      {loading && <LoaderCircle aria-hidden="true" className="size-4 shrink-0 animate-spin motion-reduce:animate-none" />}
      {loading ? loadingLabel : children}
    </button>
  );
}
