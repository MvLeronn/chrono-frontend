import type { AriaAttributes, ChangeEventHandler, Ref } from "react";

type InputProps = {
  id: string;
  name?: string;
  type?: "text" | "password";
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  autoComplete?: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  spellCheck?: boolean;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  ref?: Ref<HTMLInputElement>;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  "aria-invalid"?: AriaAttributes["aria-invalid"];
  "aria-describedby"?: string;
};

export function Input({
  id,
  name,
  type = "text",
  value,
  defaultValue,
  placeholder,
  autoComplete,
  autoCapitalize,
  spellCheck,
  required,
  disabled,
  readOnly,
  className = "",
  ref,
  onChange,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: InputProps) {
  return (
    <input
      id={id}
      name={name}
      type={type}
      value={value}
      defaultValue={defaultValue}
      placeholder={placeholder}
      autoComplete={autoComplete}
      autoCapitalize={autoCapitalize}
      spellCheck={spellCheck}
      required={required}
      disabled={disabled}
      readOnly={readOnly}
      ref={ref}
      onChange={onChange}
      aria-invalid={ariaInvalid}
      aria-describedby={ariaDescribedBy}
      className={`block min-h-11 w-full min-w-0 rounded-control border border-text-secondary bg-surface px-3 py-2 text-base leading-6 text-text-primary placeholder:text-text-secondary aria-invalid:border-error disabled:cursor-not-allowed disabled:border-border disabled:bg-background disabled:text-text-secondary ${className}`}
    />
  );
}
