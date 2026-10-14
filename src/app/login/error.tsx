"use client";

import { Button } from "../../components/ui/Button";

interface LoginErrorProps {
  reset: () => void;
}

export default function LoginError({ reset }: LoginErrorProps) {
  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <section className="w-full max-w-100 space-y-6 rounded-surface border border-border bg-surface p-6">
        <h1 className="text-2xl font-medium tracking-tight leading-8">Não foi possível concluir a entrada.</h1>
        <p role="alert" className="text-text-secondary">Confira sua conexão e tente novamente.</p>
        <Button onClick={reset} className="w-full">Tentar novamente</Button>
      </section>
    </main>
  );
}
