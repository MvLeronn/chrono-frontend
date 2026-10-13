import type { ReactNode } from "react";
import { CircleAlert } from "lucide-react";

type FieldErrorProps = {
  id?: string;
  role?: "alert";
  children: ReactNode;
  className?: string;
};

export function FieldError({ id, role, children, className = "" }: FieldErrorProps) {
  return (
    <p id={id} role={role} className={`flex items-start gap-2 text-sm leading-5 text-error ${className}`}>
      <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </p>
  );
}
