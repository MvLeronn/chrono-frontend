"use client";

import { Button } from "../components/ui/Button";

interface PageErrorProps {
  reset: () => void;
}

export default function PageError({ reset }: PageErrorProps) {
  return (
    <main className="mx-auto max-w-xl space-y-4 px-4 py-12">
      <h1 className="text-2xl font-semibold">Não foi possível abrir esta página</h1>
      <p role="alert" className="text-text-secondary">Tente novamente para carregar os dados. Se o erro ocorreu ao salvar, confira o resultado antes de repetir a operação.</p>
      <Button onClick={reset}>Tentar novamente</Button>
    </main>
  );
}
