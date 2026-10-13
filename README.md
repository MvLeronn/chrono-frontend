# Chrono frontend

Base em Next.js App Router, React e TypeScript estrito, com Tailwind CSS e Lucide. Login, consulta de sessão e logout local estão integrados. Agenda por período e visualizações mensal, semanal e diária usam leitura real no servidor. Eventos/tarefas concretos têm criação, detalhe, edição parcial, reagendamento, alteração de status e exclusão com confirmação (etapas 8A e 8B).

## Ambiente e instalação

Use Node.js 24.19.0 ou superior na linha 24 e Yarn 4.13.0 via Corepack.

```sh
corepack enable
yarn install --immutable
yarn dev
```

Abra http://localhost:3001. Se a porta estiver ocupada, preserve o processo existente e use `yarn exec next dev --port 3002` (ou outra porta livre). A validação desta etapa usou a porta 3001.

O `.yarnrc.yml` define `checksumBehavior: throw`, `enableScripts: false`, `enableHardenedMode: true`, `npmMinimalAgeGate: 20160` (14 dias) e `nodeLinker: node-modules`. Preserve essas políticas e o `yarn.lock`; não é necessário habilitar scripts de dependências para executar a base.

Copie `.env.example` para `.env.local` e configure `API_BASE_URL` (padrão local: `http://127.0.0.1:3000`). Essa variável é usada somente pelo servidor; não use prefixo `NEXT_PUBLIC_`. O arquivo local é ignorado pelo Git. Para autenticar, o backend deve estar disponível e o proprietário deve estar configurado nele. O frontend não precisa da senha administrativa no ambiente nem do segredo de assinatura JWT.

## Comandos

| Comando | Finalidade |
| --- | --- |
| `yarn dev` | Desenvolvimento na porta 3001 |
| `yarn typecheck` | Gera os tipos de rotas do Next e verifica TypeScript |
| `yarn lint` | ESLint, sem tolerar avisos |
| `yarn build` | Build de produção |
| `yarn start` | Serve o build de produção na porta 3001 |

## Organização e continuidade

Os tipos seguem uma organização híbrida. `src/models/{calendar,event,auth}.ts` contém domínio e contratos da API. Tipos de transporte (`ApiResult`, `ApiFailure`, `ApiRequest`) ficam em `src/server/api/types.ts`. Props são declaradas no próprio componente ou página; estados compartilhados de formulário ficam em `src/app/login/state.ts` e `src/app/atividades/nova/state.ts`. Tipos do cálculo visual, como `PositionedActivity` e `MonthGrid`, ficam junto dos helpers que os produzem. Use `interface` para objetos, `type` para aliases, uniões e tipos derivados, propriedades em linhas separadas e `import type` nos consumidores. Models não contêm lógica; validação e acesso à API permanecem em `lib` e `server`.

`EventDraft` representa campos ainda não validados, por isso mantém strings livres. `CreateEventInput` representa o payload validado e restringe categoria/status às uniões do contrato.

`src/app/login` contém a tela, o formulário e a Server Action de login. `src/server` contém configuração privada, transporte e sessão, protegidos por `server-only`. `src/components/ui` contém `Button`, `Input`, `Label` e `FieldError`. Os componentes usam Tailwind; `globals.css` fica restrito aos tokens e à base. Os controles temporários de simulação foram removidos.

O formulário envia somente a senha para a Server Action, que chama `POST /auth/login`. A resposta é validada antes de salvar o JWT no cookie `chrono_session`: HttpOnly, SameSite=Lax, Path=/, Secure em produção e validade baseada em `expiresIn`. Use HTTPS em produção. Token e resposta bruta de login não são retornados ao JavaScript do navegador.

A raiz e o login consultam `GET /auth/me` no servidor para conferir a sessão. Um cookie presente não é prova de acesso. HTTP 401 retorna ao login sem loop; falhas de rede/serviço não são tratadas como senha incorreta. O transporte usa `no-store`, timeout de 10 segundos e não repete mutações automaticamente. Logout apaga o cookie por Server Action, sem endpoint fictício ou refresh token; não revoga cópias externas do JWT.

`src/components/PrivateShell.tsx` organiza a área privada; `src/components/calendar` contém a toolbar e a agenda. O período fica em `/?from=YYYY-MM-DD&to=YYYY-MM-DD`, com anterior/próximo/hoje e formulário nativo. O padrão é de sete dias; `?date=` continua aceito como início desse período. Hoje é calculado no servidor no fuso da conta. Intervalos inválidos ou acima de 366 dias exibem orientação sem consultar a API.

`src/server/api/calendar.ts` consulta `GET /calendar` com autenticação e `no-store`, valida a resposta e ordena por data, horário e `calendarKey`. A agenda exibe todos os status e distingue categoria de origem, inclusive cópias de modelos e ocorrências virtuais. Não há busca no mount, proxy público ou token nas props. A nova tentativa de falha preserva o período.

O seletor Agenda/Mês/Semana/Dia preserva a agenda como padrão. O mês usa `/?view=month&date=YYYY-MM-DD`, semanas iniciadas na segunda-feira e consulta também os dias adjacentes visíveis. `CalendarDateToolbar.tsx` compartilha navegação entre mês, semana e dia; `MonthView.tsx` exibe até três atividades por célula e a lista completa do dia selecionado abaixo da grade. No mobile, as células priorizam data e quantidade. `ActivityRow.tsx` compartilha a apresentação completa entre as visualizações.

O dia usa `/?view=day&date=YYYY-MM-DD` e consulta apenas essa data. `DayView.tsx` separa atividades sem horário e posiciona as demais na grade de 24 horas. `src/lib/day-layout.ts` distribui sobreposições em colunas determinísticas; alturas mínimas são apenas visuais, sem inventar horário de fim. A grade permite rolagem local e oferece links para o conteúdo completo de cada atividade abaixo dela.

A semana usa `/?view=week&date=YYYY-MM-DD` e consulta uma vez o período de segunda a domingo. `WeekView.tsx` mantém dias alinhados, faixa sem horário e rolagem restrita à grade. Os blocos de horário são compartilhados com o dia em `TimedActivityBlocks.tsx`; sobreposições preservam largura de leitura. Links abrem o conteúdo completo, cada dia ou a semana inteira na agenda. A última semana do ano 9999 é limitada aos dias válidos.

`/atividades/nova` oferece criação com data e início sugeridos pelo calendário. A Server Action verifica sessão e valida campos antes de chamar POST `/events`; o preenchimento permanece em erros e envios simultâneos são bloqueados na interface. Sucesso invalida o calendário e abre `/atividades/[id]`, que consulta GET `/events/:id` sem cache. Campos gerenciados pelo backend não são enviados. Ocorrências recorrentes continuam fora desse fluxo de criação/detalhe concreto.

O backend não possui idempotência para criação: falhas de conexão ou respostas inesperadas podem deixar o resultado incerto. A interface orienta conferir a agenda em outra aba antes de reenviar; não repete o POST automaticamente. Sessão expirada durante envio mantém o formulário preenchido e oferece login em outra aba.

`/atividades/[id]/editar` consulta os dados atuais e reutiliza o editor. PATCH envia somente diferenças em relação ao formulário aberto, incluindo `null` para limpar descrição/horários; valida também a combinação com a leitura atual antes de salvar. Os quatro status são livres, e `completedAt` permanece controlado pelo backend. Cópias de modelos são editadas individualmente. O contrato não oferece controle de versão atômico: alterações concorrentes no mesmo campo continuam sujeitas à última gravação.

O detalhe oferece exclusão com confirmação explícita e explica a diferença para o status Cancelado. DELETE exige resposta 204 e não lê JSON. Excluir cópia de modelo preserva a aplicação; reaplicar a mesma semana não recria a cópia. Sucesso atualiza detalhe/calendário e mostra feedback; falhas preservam o editor e resultados incertos orientam conferir a agenda antes de repetir, sem retry automático.

`/ocorrencias/[id]/[date]` consulta e edita somente uma ocorrência (etapa 9). O endereço usa o ID do segmento e a data original, inclusive após reagendamento ou enquanto o ID do estado é nulo. Os links ficam na apresentação completa das atividades em todas as visualizações; a chave visual do calendário continua sendo `calendarKey`.

Título, categoria, descrição e horários começam em Manter sem alteração. Personalizar cria uma alteração intencional somente nesse campo; Herdar envia `null`. Descrição personalizada vazia envia `""`; remover horários envia o par `{ startTime: null, endTime: null }`, diferente de herdar horários. Data/status são enviados somente quando mudam. Envio sem alteração não faz PATCH nem cria estado persistido. A API retorna valores resolvidos, sem informar a origem individual de cada campo; o editor não tenta inferir quais já são personalizados.

Voltar à data original altera somente o reagendamento ao salvar. Restaurar ocorrência exige confirmação e remove todo o estado, inclusive personalizações, reagendamento, status e conclusão; a ocorrência continua existindo, pendente e herdando a regra. DELETE `/state` exige 200 com JSON e a resposta virtual esperada. A tela faz leitura fresca após sucesso e invalida o calendário. Falhas preservam o formulário, sem retry automático; mudanças na recorrência que invalidem o endereço orientam retornar ao calendário.

`/recorrencias` lista regras com paginação por URL (`page`, `limit`, padrão 20 itens), preservando a ordem do backend e incluindo trechos históricos. O total conta regras/segmentos, não séries únicas. Parâmetros inválidos não consultam a API; páginas além do total exibem retorno à primeira página. A navegação privada oferece Calendário e Recorrências com seção atual identificada.

`/recorrencias/nova` cria regras diárias, semanais, mensais ou anuais, com intervalo, data de referência, horários opcionais e término exclusivo por data/quantidade ou sem limite. A data inicial usa o fuso da conta; datas passadas são permitidas. Validação compartilhada entre client e Server Action cobre campos e limites; somente o DTO de criação é enviado, sem status ou campos internos. Falhas mantêm o preenchimento; resultado incerto orienta conferir a lista, pois repetir POST pode duplicar a série.

`/recorrencias/[id]` consulta o detalhe atualizado, mostra referência, repetição, término e limites efetivos separadamente, aceita trechos sem datas efetivas e oferece o trecho anterior quando informado pela API. Não infere a existência de continuação. Repetições semanais têm um dia da semana; mensal/anual preservam a âncora usando o último dia válido. A expansão permanece no backend. Criação invalida lista/calendário e abre o detalhe com feedback.

Na tela de ocorrência, Editar esta e as próximas abre `/recorrencias/[id]/dividir?from=YYYY-MM-DD`, usando a data original e o ID do segmento. A página e a action verificam que a data é hoje/futura no fuso da conta, e consultam a ocorrência real. O editor usa os valores da regra, não os overrides individuais, e envia somente mudanças selecionadas. Conteúdo/horário/término preservam a âncora; uma nova referência é explícita, enquanto frequência/intervalo alterados usam a data escolhida quando a referência é omitida. O frontend não calcula expansão nem contagem restante.

A confirmação explica o alcance, a preservação de concluídas/personalizações compatíveis e o risco de trecho vazio. Término não selecionado é omitido; substituição explícita envia um único limite e limpa o outro. Conflitos mostram datas/status quando fornecidos, preservando o draft e sem apagar estados. Regra modificada desde a abertura, histórico protegido e continuação já existente têm orientação própria. POST `/split` não é repetido automaticamente; sucesso exige novo segmento válido, invalida calendário/recorrências/ocorrências e abre o novo ID.

O detalhe da regra oferece `/recorrencias/[id]/encerrar` (etapa 10C). A data de corte é exclusiva, pode ser qualquer dia e deve ser hoje/futura no fuso da conta e igual/posterior a `effectiveFrom`. A confirmação explica a preservação do histórico, inclusive ocorrências anteriores reagendadas para depois do corte, e a ausência de reabertura. Corte no início deixa o trecho sem ocorrências; corte posterior ao limite existente mantém esse limite. O frontend não presume se há continuação: a API decide se o trecho pode ser encerrado.

POST `/recurring-events/:id/end` envia apenas `fromDate`, valida resposta 200 e identidade/limite do trecho. A action verifica sessão e dados atuais; mudanças desde a abertura exigem nova consulta. Conflitos exibem datas/status validados e links para consultar ocorrências em outra aba, sem apagar estados. Data e confirmação permanecem em falhas; mudar a data exige nova confirmação. Sucesso atualiza calendário/lista/detalhe e distingue limite alterado de limite mantido. Não há retry automático.

`/modelos` lista modelos semanais ativos com paginação por URL; `/modelos/nova` cria uma definição com nome e até 200 itens, inclusive vazia (etapa 11A). Cada item tem dia da semana, categoria, título, descrição e horários opcionais. Chaves locais mantêm o preenchimento ao adicionar/remover itens e não são enviadas ao backend. A validação client/server também verifica o limite total de 100 KB do JSON aceito pela API. Criar um modelo não adiciona atividades ao calendário.

POST `/week-templates` envia somente os campos contratados, valida resposta 201 e redireciona para `/modelos/[id]`, com nova leitura no servidor. O detalhe apresenta os itens por dia da semana. Falhas preservam o formulário; sessão expirada permite login em outra aba, e resultado incerto orienta conferir a lista antes de repetir, pois a criação não é idempotente. Alterar um modelo não modifica cópias já criadas.

`/modelos/[id]/editar` reutiliza o editor para alterar nome/itens (etapa 11B), preservando chaves locais, até 200 itens e suporte a modelo vazio. PATCH envia somente campos alterados: renomear omite a coleção; alterar itens substitui a lista completa, sem IDs internos; esvaziar envia `items: []`. O tamanho de 100 KB é verificado no payload efetivo. Envio sem mudanças não altera o modelo. A action consulta dados frescos e recusa salvar se `updatedAt` mudou desde a abertura; essa consulta não é uma garantia atômica contra concorrência.

Falhas mantêm o preenchimento e oferecem consulta em outra aba quando o resultado é incerto ou a versão mudou. Sucesso valida resposta 200 e identidade, atualiza lista/detalhe/edição e mostra confirmação no detalhe. Eventos e aplicações existentes permanecem independentes; salvar ou reaplicar não atualiza semanas já preenchidas.

`/modelos/[id]/aplicar` permite aplicar o modelo a uma semana (etapa 11C). A segunda-feira inicial vem da semana atual no fuso da conta; semanas passadas são aceitas, mas o domingo deve caber no ano 9999. A confirmação apresenta o período completo e precisa ser renovada ao mudar a data. Aplicar adiciona cópias pendentes e preserva atividades existentes. Modelo vazio registra aplicação sem criar atividades.

POST `/week-templates/:id/apply` envia somente `weekStart`, após validar sessão, confirmação e versão atual do modelo. O resultado distingue primeira aplicação (201) de reaplicação idempotente (200), sem executar POST durante leitura de página. Reaplicar não duplica, não recria removidas nem incorpora alterações posteriores do modelo. A lista mostra as atividades atuais vinculadas, inclusive reagendadas para fora da semana, com datas/status e acesso aos detalhes. Sucesso invalida calendário/modelos; data e confirmação permanecem em erros, sem retry automático. Resultado incerto orienta repetir a mesma segunda-feira, pois outra semana representa outra aplicação.

O detalhe do modelo oferece arquivamento (etapa 11D) com confirmação explícita. DELETE `/week-templates/:id` não envia body e exige 204 sem leitura de JSON. O modelo deixa de estar disponível para consulta, edição e aplicação/reaplicação, sem opção de restauração. Itens, aplicações e atividades já criadas são preservados.

A action verifica sessão, confirmação e versão atual; mudanças desde a abertura exigem revisão. Falhas mantêm a confirmação, sem retry automático; 404 informa indisponibilidade ou arquivamento anterior sem alegar novo sucesso. Sucesso invalida lista/detalhe/edição/aplicação e retorna à lista com feedback. Nenhum endpoint de restauração ou listagem de arquivados foi inventado.

Validação da etapa 11D: TypeScript, lint, build e conferência do diff registrados no plano. Nenhum teste automatizado novo. Arquivamento autenticado, preservação real de cópias e inspeção visual de desktop/mobile, teclado, foco e zoom permanecem pendentes. A leitura prévia não garante atomicidade contra edição concorrente. Próxima etapa: 12, revisão integrada e documentação, após revisão.

O Yarn informa um peer transitivo ausente de `eslint` em `@next/eslint-plugin-next`, embora o projeto forneça ESLint. O lint deve ser validado antes de aceitar futuras atualizações. O aviso de scripts bloqueados de `unrs-resolver` é esperado pela política de instalação.

Consulte [o plano em etapas](./implementacao-em-etapas.md) e as referências preservadas: [execução](./frontend-execucao.md), [contexto](./contexto.md), [contrato](./contrato.md) e [modelos](./models.md).
