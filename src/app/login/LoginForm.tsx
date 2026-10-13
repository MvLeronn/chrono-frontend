"use client";

import { useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { FieldError } from "../../components/ui/FieldError";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { passwordError } from "../../lib/password-validation";
import { loginAction } from "./actions";
import type { LoginState } from "./state";

interface LoginFormProps {
  notice?: string;
}

const initialState: LoginState = {};

export function LoginForm({ notice }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [localError, setLocalError] = useState<string>();
  const passwordRef = useRef<HTMLInputElement>(null);
  const submitted = useRef(false);
  const error = localError ?? state.passwordError;

  useEffect(() => {
    if (!pending) {
      submitted.current = false;
      if (state.passwordError) passwordRef.current?.focus();
    }
  }, [pending, state]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (pending || submitted.current) {
      event.preventDefault();
      return;
    }
    const validation = passwordError(password);
    setLocalError(validation);
    if (validation) {
      event.preventDefault();
      passwordRef.current?.focus();
      return;
    }
    submitted.current = true;
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} noValidate className="space-y-6">
      {notice && <p role="status" className="rounded-control bg-primary-soft p-3 text-sm leading-5 text-text-primary">{notice}</p>}
      <div>
        <Label htmlFor="password" className="mb-2">Senha</Label>
        <div className="relative">
          <Input
            ref={passwordRef}
            id="password"
            name="password"
            type={visible ? "text" : "password"}
            autoComplete="current-password"
            autoCapitalize="none"
            spellCheck={false}
            required
            readOnly={pending}
            value={password}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={error ? "password-error" : undefined}
            onChange={(event) => {
              setPassword(event.target.value);
              setLocalError(undefined);
            }}
            className="pr-14"
          />
          <button
            type="button"
            aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
            aria-controls="password"
            disabled={pending}
            onClick={() => setVisible(!visible)}
            className="absolute inset-y-0 right-0 flex min-h-11 w-11 items-center justify-center rounded-control text-text-secondary enabled:hover:bg-background enabled:hover:text-primary disabled:cursor-not-allowed"
          >
            {visible ? <EyeOff aria-hidden="true" className="size-5" /> : <Eye aria-hidden="true" className="size-5" />}
          </button>
        </div>
        {error && <FieldError id="password-error" role="alert" className="mt-1">{error}</FieldError>}
      </div>
      {state.message && <FieldError role="alert">{state.message}</FieldError>}
      <Button type="submit" loading={pending} loadingLabel="Entrando…" className="w-full">Entrar</Button>
      <p role="status" className="sr-only">{pending ? "Verificando acesso…" : ""}</p>
    </form>
  );
}
