export function AgendaLoading() {
  return (
    <div role="status" aria-live="polite" className="space-y-6 p-4 sm:p-6">
      <p className="text-sm text-text-secondary">Carregando atividades…</p>
      <div aria-hidden="true" className="space-y-4">
        {[0, 1, 2].map((row) => <div key={row} className="h-20 rounded-control bg-background motion-safe:animate-pulse" />)}
      </div>
    </div>
  );
}
