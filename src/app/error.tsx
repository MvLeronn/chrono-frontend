"use client";

import { Button } from "../components/ui/Button";

interface CalendarErrorProps {
  reset: () => void;
}

export default function CalendarError({ reset }: CalendarErrorProps) {
  return (
    <main className="mx-auto max-w-xl space-y-4 px-4 py-12">
      <h1 className="text-2xl font-semibold">Não foi possível abrir o calendário</h1>
      <p role="alert" className="text-text-secondary">Tente novamente para carregar o período selecionado.</p>
      <Button onClick={reset}>Tentar novamente</Button>
    </main>
  );
}
