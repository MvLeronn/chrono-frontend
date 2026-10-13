import Link from "next/link";
import { redirect } from "next/navigation";
import { getTemplate } from "../../../../server/api/templates";
import { templateDraft } from "../../../../lib/template-input";
import { TemplateForm } from "../../nova/TemplateForm";
import { updateTemplateAction } from "./actions";

interface EditTemplatePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditTemplatePage({ params }: EditTemplatePageProps) {
  const { id } = await params;
  const result = await getTemplate(id);
  if (!result.ok) {
    if (result.status === 401) redirect("/login?reason=expired");
    const missing = result.status === 404;
    return <div className="space-y-4"><h1 className="text-2xl font-semibold">{missing ? "Modelo não encontrado" : "Não foi possível abrir a edição"}</h1><p role="alert" className="text-text-secondary">{missing ? "O modelo não está disponível ou foi arquivado." : "Tente novamente para consultar os dados atualizados."}</p>{!missing && <a href={`/modelos/${encodeURIComponent(id)}/editar`} className="inline-flex min-h-11 items-center text-primary underline">Tentar novamente</a>}<Link href="/modelos" className="inline-flex min-h-11 items-center text-primary underline">Voltar aos modelos</Link></div>;
  }
  const initial = templateDraft(result.data);
  const action = updateTemplateAction.bind(null, id, result.data.updatedAt, initial);
  return <div className="mx-auto max-w-2xl space-y-6"><header className="space-y-2"><h1 className="text-2xl font-semibold">Editar modelo semanal</h1><p className="wrap-anywhere text-text-secondary">{result.data.name}</p><p className="text-sm text-text-secondary">Altere o nome, adicione, ajuste ou remova itens. As atividades já criadas a partir deste modelo permanecem como estão.</p></header><TemplateForm initialDraft={initial} saveAction={action} detailHref={`/modelos/${id}`} /></div>;
}
