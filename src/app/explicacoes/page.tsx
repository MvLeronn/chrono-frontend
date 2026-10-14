"use client";

import { PageHeading } from "../../components/ui/PageHeading";
import { FilterTabs, FilterTab } from "../../components/ui/FilterTabs";
import { useRef, useState } from "react";

const categories = [
  { title: "Calendário", sections: [
    ["Agenda", "Veja as atividades agrupadas por dia. Use De e Até para escolher um período de até 366 dias, contando as duas datas. As setas avançam ou voltam um período; Hoje retorna à semana a partir de hoje."],
    ["Mês", "Selecione a data para consultar a lista completa abaixo do calendário. Cada célula mostra até quatro atividades; + atividades abre as demais. No celular, o número menor indica a quantidade de atividades."],
    ["Semana e dia", "Selecione uma atividade na grade para ir aos detalhes na lista. Selecione um espaço livre para criar uma atividade naquele horário. Em telas menores ou com atividades simultâneas, role a grade horizontalmente."],
    ["Visão reduzida", "Por padrão, a grade mostra das 08h às 22h. Use Mostrar 24 horas para ver a madrugada e a noite. A preferência vale para Dia e Semana e fica salva neste navegador. A lista de atividades continua incluindo todos os horários."],
    ["Datas e fuso", "Hoje usa o fuso do seu planejamento. Use o seletor de data ou o calendário do menu lateral para ir a outro dia, semana ou mês."],
  ] },
  { title: "Atividades", sections: [
    ["Eventos e tarefas", "Crie uma atividade em Criar atividade ou em um horário livre da grade. Atividades sem horário aparecem separadas da grade."],
    ["Detalhes e descrição", "Selecione o título na lista para abrir a atividade ou ocorrência. Expanda Descrição para ler o texto sem sair do calendário."],
    ["Status e origem", "O status indica se a atividade está pendente, em andamento, concluída ou cancelada. A origem informa se ela é avulsa, faz parte de uma recorrência ou foi criada a partir de um modelo semanal."],
    ["Duração na grade", "Atividades curtas recebem uma altura mínima para facilitar a leitura. Isso não altera o horário de fim. Sem fim indica que nenhum horário de término foi definido."],
  ] },
  { title: "Recorrências", sections: [
    ["Regras e ocorrências", "Uma recorrência define atividades que se repetem. Cada data gerada é uma ocorrência, que pode ser aberta pelo calendário."],
    ["Trechos de uma série", "Uma mesma série pode ter vários trechos. A aba Atuais mostra os trechos vigentes com ocorrências após hoje. Hoje continua no calendário, mesmo após o encerramento das futuras repetições. A aba Histórico reúne os trechos anteriores e as recorrências encerradas ou esgotadas. Cada trecho aparece separadamente."],
    ["Alterações", "Abra a recorrência para consultar seus detalhes e as opções de alteração e encerramento. Confira a data de início do trecho e o término antes de confirmar uma mudança."],
  ] },
  { title: "Modelos", sections: [
    ["Planejamento semanal", "Um modelo reúne atividades organizadas por dia da semana para reutilizar. Criar um modelo não preenche o calendário."],
    ["Aplicar um modelo", "Abra o modelo e use a opção de aplicar para criar atividades no período escolhido. Confira os dados antes de confirmar."],
    ["Arquivar", "Arquivar um modelo mantém as atividades que já foram criadas no calendário."],
  ] },
];

export default function ExplanationsPage() {
  const [selected, setSelected] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  return <div className="space-y-6">
    <PageHeading title="Explicações" description="Encontre o que precisa para organizar seu planejamento." />
    <FilterTabs role="tablist" aria-label="Categorias de explicações">
      {categories.map((category, index) => <FilterTab key={category.title} ref={(element) => { tabs.current[index] = element; }} id={`help-tab-${index}`} role="tab" aria-selected={selected === index} aria-controls={`help-panel-${index}`} tabIndex={selected === index ? 0 : -1} onClick={() => setSelected(index)} onKeyDown={(event) => {
        let next = index;
        if (event.key === "ArrowRight") next = (index + 1) % categories.length;
        else if (event.key === "ArrowLeft") next = (index + categories.length - 1) % categories.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = categories.length - 1;
        else return;
        event.preventDefault();
        setSelected(next);
        tabs.current[next]?.focus();
      }}>{category.title}</FilterTab>)}
    </FilterTabs>
    {categories.map((category, index) => <section key={category.title} id={`help-panel-${index}`} role="tabpanel" aria-labelledby={`help-tab-${index}`} hidden={selected !== index} tabIndex={0} className="max-w-3xl divide-y divide-border rounded-surface border border-border bg-background/40 px-5 sm:px-6">
      {category.sections.map(([title, description]) => <section key={title} className="py-5"><h2 className="mb-2 font-medium">{title}</h2><p className="text-sm leading-6 text-text-secondary">{description}</p></section>)}
    </section>)}
  </div>;
}
