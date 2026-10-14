import { TemplateForm } from "./TemplateForm";

export function NewTemplateScreen() {
  return <div className="mx-auto max-w-2xl space-y-6"><header className="space-y-2"><h1 className="text-2xl font-medium tracking-tight">Novo modelo semanal</h1><p className="text-text-secondary">Organize tarefas e eventos por dia da semana para reutilizar esse planejamento.</p></header><TemplateForm /></div>;
}
