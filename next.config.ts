import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  async redirects() {
    return [
      { source: "/recorrencias/nova", destination: "/recorrencias?modal=NewRecurring", permanent: false },
      { source: "/modelos/nova", destination: "/modelos?modal=NewTemplate", permanent: false },
      { source: "/atividades/nova", destination: "/?modal=NewEvent", permanent: false },
      { source: "/recorrencias/:id", destination: "/recorrencias?modal=RecurringDetails&id=:id", permanent: false },
      { source: "/recorrencias/:id/dividir", destination: "/recorrencias?modal=SplitRecurring&id=:id", permanent: false },
      { source: "/recorrencias/:id/encerrar", destination: "/recorrencias?modal=EndRecurring&id=:id", permanent: false },
      { source: "/ocorrencias/:id/:date", destination: "/?modal=Occurrence&id=:id&date=:date", permanent: false },
      { source: "/modelos/:id", destination: "/modelos?modal=TemplateDetails&id=:id", permanent: false },
      { source: "/modelos/:id/aplicar", destination: "/modelos?modal=ApplyTemplate&id=:id", permanent: false },
      { source: "/modelos/:id/editar", destination: "/modelos?modal=EditTemplate&id=:id", permanent: false },
      { source: "/atividades/:id", destination: "/?modal=EventDetails&id=:id", permanent: false },
      { source: "/atividades/:id/editar", destination: "/?modal=EditEvent&id=:id", permanent: false },
    ];
  },
};

export default nextConfig;
