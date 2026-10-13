# Chrono — implementação gradual do frontend

## Objetivo

Construir o frontend em entregas pequenas, definindo e revisando o padrão visual, os componentes e a organização do código antes de expandir a aplicação.

A implementação anterior foi descartada por solicitação do usuário. Este documento passa a orientar o ritmo de execução. Não implementar o plano inteiro em uma única tarefa.

## Como trabalhar

1. Executar somente a etapa ou subetapa solicitada pelo usuário.
2. Antes de editar, examinar o estado atual do repositório e preservar alterações existentes.
3. Apresentar brevemente o que será entregue, quais arquivos serão envolvidos e como será validado.
4. Dentro da etapa autorizada, tomar decisões rotineiras sem pedir confirmação para cada detalhe.
5. Entregar algo pequeno, executável e fácil de revisar. Não antecipar componentes, telas ou infraestrutura de etapas futuras.
6. Validar proporcionalmente, apresentar o resultado e aguardar a revisão do usuário antes de avançar à próxima etapa.
7. Se o padrão não for aprovado, ajustar a entrega atual antes de expandi-lo para outras telas.
8. Ao encerrar cada etapa, registrar neste documento o que foi aprovado, arquivos relevantes, verificações, pendências e próximo passo. Não registrar segredos.

**Estado inicial:** repositório sem implementação de frontend; referências originais preservadas. Nenhuma etapa abaixo está aprovada ou implementada.

## Fontes de verdade e prioridade

- [contexto.md](./contexto.md): domínio e limitações do backend.
- [contrato.md](./contrato.md): endpoints, payloads, validações, efeitos e erros.
- [models.md](./models.md): tipos públicos de entrada e saída.
- [frontend-execucao.md](./frontend-execucao.md): requisitos funcionais e decisões técnicas já documentadas.
- Este documento: sequência gradual de execução e pontos de revisão.

O pedido posterior de trabalhar em etapas substitui a orientação anterior de executar tudo de uma vez. Os contratos do backend continuam válidos. Em divergências, verificar a implementação disponível sem modificar o backend.

## Decisões já estabelecidas

- Next.js com App Router, React, TypeScript estrito, Tailwind CSS e Lucide.
- Yarn, com versão definida em `packageManager` e lockfile próprio do repositório.
- Componentes próprios e calendário próprio.
- Sem TanStack Query, SWR, shadcn/ui, Radix, FullCalendar, Axios, Zod ou outras bibliotecas rejeitadas no plano original.
- Server Components para leitura inicial; Server Actions para mutações; acesso ao backend por `fetch` numa camada `server-only`.
- Route Handlers GET específicos somente quando uma leitura sob demanda for necessária. Sem proxy arbitrário.
- JWT em cookie HttpOnly; nunca em props, armazenamento do navegador ou bundle client. Sem refresh token inventado.
- Interface em português do Brasil.
- Não alterar backend, criar endpoints fictícios ou apresentar dados simulados como integração real.
- Não criar testes automatizados de frontend. Validar com TypeScript, lint, build e inspeção manual no navegador conforme a etapa.

### Regra de estilos

**Usar Tailwind nos componentes.** O `globals.css` deve conter apenas paleta, tokens e base do design system, como tipografia e foco. Não concentrar nele estilos de páginas, formulários, sidebar, calendário, cards ou modais.

Centralizar variantes em componentes pequenos, como `Button` e controles de formulário. Evitar tanto classes duplicadas extensas quanto componentes genéricos com responsabilidades demais. CSS Modules só devem ser considerados para uma necessidade concreta do calendário que fique mais clara dessa forma.

**Props dos componentes:** declarar cada propriedade explicitamente em TypeScript e repassá-la pelo nome no JSX, sem `{...props}` nem herança genérica de todos os atributos HTML. Usar tipos específicos do React para eventos, refs e acessibilidade. Preferência aplicada em `Button`, `Input`, `Label` e `FieldError`; TypeScript e lint passaram após o ajuste.

### Direção visual já definida

Preservar a paleta de `frontend-execucao.md`: azul petróleo como principal; pendente amarelo, em andamento azul, concluído verde e cancelado vermelho. Hoje usa azul petróleo; seleção usa azul claro. Cor nunca deve ser o único indicador de status.

Layout, densidade, tipografia, espaçamento e aparência dos controles ainda precisam ser aprovados gradualmente. Não considerar o visual descartado uma referência aprovada.

## Etapa 0 — alinhar a primeira referência

**Entrega:** uma proposta curta para a direção visual, antes de implementar telas.

- Revisar os documentos e eventuais referências fornecidas pelo usuário.
- Definir o que será mostrado primeiro e quais decisões essa tela deve permitir avaliar.
- Propor tipografia sem dependência de download externo, densidade, espaçamentos, raios e comportamento mobile.
- Não produzir várias telas nem um design system completo.

**Ponto de revisão:** concordar com a direção e com o tamanho da primeira entrega.

### Proposta da etapa 0 — aprovada

**Inspeção:** o repositório contém somente README e os cinco documentos de referência/plano, sem código, `package.json`, configuração, dependências ou testes de frontend. Foram consultados `frontend-execucao.md`, `contexto.md`, `contrato.md` e `models.md`. O produto é um calendário pessoal de eventos e tarefas, com login apenas por senha. As referências do backend não representam arquivos implementados neste frontend.

**Direção proposta:** uma agenda de trabalho clara e de densidade moderada, com superfícies contínuas, divisórias discretas e hierarquia guiada pelo tempo. O elemento característico será a leitura alinhada de datas/horários e o marcador de hoje em azul petróle
o, a desenvolver nas etapas do calendário. Evitar cartões decorativos e sombras fortes.

| Aspecto | Proposta para revisão |
| --- | --- |
| Tipografia | Família local `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`, sem download de fontes. Títulos 24/32 px e peso 600; corpo e campos 16/24 px e peso 400; labels e botões 14/20 px e peso 600; metadados 12/16 px. Datas e horários com algarismos tabulares. |
| Densidade e espaçamento | Escala de 4, 8, 12, 16, 24 e 32 px. Label a 8 px do campo; mensagem a 4 px; grupos a 16 px; seções a 24–32 px. Controles com altura mínima de 44 px e conteúdo sem altura fixa. Padding de 24 px no desktop e 16 px no mobile. |
| Raios e limites | 8 px em campos e botões; 12 px em superfícies de formulário; círculo reservado ao marcador de hoje. Bordas de 1 px; usar o token de texto secundário para delimitar campos, mantendo a borda suave nas divisórias. Foco com contorno de 2 px em azul petróleo e afastamento de 2 px. |
| Paleta | Preservar integralmente os tokens de `frontend-execucao.md`: fundo `#F4F7FA`, superfície `#FFFFFF`, principal `#155E75`, hover `#164E63`, seleção `#E0F2FE` e textos/bordas definidos. Manter os quatro pares de cores de status originais, sempre acompanhados de texto ou ícone identificável. Hoje terá número branco sobre azul petróleo; seleção terá fundo azul claro e contorno petróleo. |
| Mobile | Composição em uma coluna, margem de 16 px, campos e ação principal com largura disponível; funcionar a partir de 320 px, com quebra de texto e rolagem vertical natural, inclusive com teclado aberto e zoom de 200%. Nas etapas futuras, reorganizar a toolbar e oferecer dia/agenda; a semana terá rolagem horizontal restrita à grade, sem comprimir sete colunas. |
| Estilos | Tailwind nos componentes, com variantes pequenas e compartilhadas. `globals.css` restrito à paleta, tokens e base do design system, como tipografia e foco; nenhum estilo específico de tela, formulário, sidebar ou calendário. |

**Primeira entrega visual para revisão:** depois da base neutra da etapa 1, a etapa 2 apresentará uma única composição compacta, de até 400 px de largura, com `Button`, campo de texto, label e mensagem de erro. Será possível avaliar estados normal, foco por teclado, desabilitado, envio e erro em desktop e mobile. Essa amostra permitirá aprovar tipografia, densidade, espaçamento, raios, contraste e controles antes da primeira tela de domínio: o login visual da etapa 3, somente com senha, mostrar/ocultar e botão de entrada. Não antecipar login, sidebar ou calendário na amostra de controles.

**Validação e limite desta etapa:** revisão documental da proposta contra a sequência do plano, a paleta e os contratos; conferência de que somente este plano foi alterado. Nenhuma dependência instalada, tela implementada ou teste criado. TypeScript, lint, build e inspeção no navegador não se aplicam ao estado atual sem aplicação; contraste efetivo, foco e responsividade serão verificados na entrega visual da etapa 2.

**Decisão:** direção e tamanho da primeira entrega visual aprovados pelo usuário, com autorização para executar a etapa 1. A aprovação não antecipa a revisão dos controles da etapa 2.

## Etapa 1 — base mínima do projeto

**Entrega:** aplicação Next executável, com uma página neutra e configuração mínima.

- Instalar versões estáveis compatíveis com o Node disponível.
- Configurar TypeScript, Tailwind, Lucide, lint e scripts de desenvolvimento/build.
- Criar `.gitignore`, `.env.example`, lockfile e instruções mínimas no README.
- Usar porta 3001 por padrão. Se ocupada, preservar o processo existente e documentar a porta alternativa.
- Não criar antecipadamente pastas e arquivos de todos os módulos.

**Validar:** iniciar a aplicação, executar TypeScript, lint e build.

**Ponto de revisão:** base técnica pronta, sem implementação de domínio.

### Entrega da etapa 1 — aprovada

- Base criada com Next 16.3.6, React 19.3.0, TypeScript 6.0.3, Tailwind 4.3.3, Lucide 1.48.0 e ESLint 9.39.5. Node local 24.19.0; Yarn fixado em 4.13.0. TypeScript e ESLint foram selecionados dentro das faixas aceitas pelas ferramentas do Next.
- Instalação exclusivamente pelo Yarn, com lockfile próprio e as cinco configurações solicitadas: `checksumBehavior: throw`, `enableScripts: false`, `enableHardenedMode: true`, `npmMinimalAgeGate: 20160` e `nodeLinker: node-modules`. Nenhuma exceção adicionada ao age gate ou ao bloqueio de scripts.
- Arquivos: `package.json`, `yarn.lock`, `.yarnrc.yml`, `.gitignore`, `.env.example`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `postcss.config.mjs`, `src/app/{layout.tsx,page.tsx,globals.css}` e README. A geração automática de `AGENTS.md` e `CLAUDE.md` foi desativada com `agentRules: false`, e os arquivos gerados foram removidos conforme revisão do usuário. Configurações locais de editor, incluindo `.vscode`, ficam fora do Git.
- Página neutra em português, com fonte do sistema e apenas os tokens de fundo/texto necessários da paleta aprovada. Tailwind no componente; estilos globais limitados a tokens/base. Paleta completa e controles permanecem na etapa 2.
- Verificações concluídas: `yarn typecheck`, `yarn lint` e `yarn build` com sucesso; `yarn dev` iniciou na porta 3001 e a página foi conferida no navegador. O lint inicialmente identificou um export anônimo no PostCSS, corrigido antes da nova execução bem-sucedida.
- Avisos de instalação: scripts de `unrs-resolver` bloqueados conforme solicitado; peer transitivo de ESLint não declarado por `@next/eslint-plugin-next` (`p3900b3`), identificado por `yarn explain peer-requirements`. O projeto fornece ESLint e lint/build funcionaram sem flexibilizar a configuração.
- Limites: sem telas de domínio, autenticação, integração com API ou testes automatizados. A revisão completa de mobile, zoom, foco e contraste dos controles fica para a etapa 2. A base foi conferida no viewport disponível do navegador.

## Etapa 2 — primeiro conjunto de componentes visuais

**Entrega:** uma pequena composição visual para revisar o padrão dos controles.

- Definir tokens da paleta e a base tipográfica.
- Implementar somente `Button`, campo de texto, label e mensagem de erro.
- Mostrar estados normal, foco, desabilitado e envio.
- Aplicar estilos com Tailwind dentro dos componentes.
- Usar uma área temporária de apresentação apenas se necessária; não criar uma infraestrutura permanente de catálogo.

**Validar:** foco por teclado, contraste, desktop, mobile e verificações estáticas.

**Ponto de revisão:** aprovar ou ajustar os controles antes de reutilizá-los.

### Entrega da etapa 2 — aprovada

- Implementados `src/components/ui/{Button,Input,Label,FieldError}.tsx`, com atributos HTML nativos, variantes principal/secundária de botão, estado de envio bloqueado, labels associados e mensagem vinculada por `aria-describedby`/`aria-invalid`.
- `src/app/globals.css` contém a paleta completa preservada, tokens semânticos separados para erro/ação destrutiva, raios e base tipográfica/foco. Layout e aparência dos controles ficam em Tailwind nos componentes.
- `src/app/page.tsx` apresenta uma amostra temporária em uma coluna de até 400 px: normal, foco real por Tab, erro, desabilitado e envio. Estados ilustrativos explicitamente identificados, sem simulação de API ou persistência. Nenhuma dependência nova ou teste automatizado criado.
- Validações: `yarn build`, `yarn lint` e `yarn typecheck` passaram; inspeção no navegador em desktop e viewport de 320 px, sem transbordamento horizontal; Tab conferido no campo e no botão. Contraste calculado para texto principal dos botões, texto secundário, erros e foco. Movimento do spinner respeita `prefers-reduced-motion`. Zoom de 200%, leitor de tela e teclado virtual não foram verificados nesta entrega.
- Próximo passo: revisar controles e composição antes de autorizar a etapa 3. Nenhuma tela de login ou calendário implementada.

## Etapa 3 — login visual

**Entrega:** somente a tela de login, usando o padrão aprovado.

- Campo de senha, mostrar/ocultar senha e botão de entrada.
- Estados visuais de envio e erro, sem fingir que há autenticação funcionando.
- Layout responsivo, texto direto e hierarquia simples.
- Não criar calendário, sidebar completa ou telas adicionais nesta etapa.

**Validar:** teclado, legibilidade, largura mobile e zoom de 200%.

**Ponto de revisão:** aprovar a tela e consolidar os ajustes do padrão visual.

### Entrega da etapa 3 — aprovada

- Login visual em `src/app/login/page.tsx` e `LoginForm.tsx`; a raiz redireciona para `/login`, substituindo a amostra temporária da etapa 2.
- Reutilizados Button, Input, Label e FieldError; Input aceita ref nativa para retorno de foco ao campo vazio. Apenas o formulário é Client Component. Paleta e estilos Tailwind preservados.
- Senha, mostrar/ocultar, entrada por teclado, erro de campo vazio e seletor temporário de estados normal/envio/erro. Prévia identificada: não envia senha, não salva dados, não cria sessão e não simula sucesso de autenticação.
- `yarn build`, `yarn lint`, `yarn typecheck` e `git diff --check` passaram. Navegador: desktop, 320 px sem overflow horizontal, mostrar/ocultar por teclado, foco no erro, bloqueio dos controles em envio e erro ilustrativo.
- Limitações: atalhos de zoom não alteraram a escala do navegador integrado; zoom real de 200% permanece pendente, assim como leitor de tela e teclado virtual. Sem novas dependências ou testes automatizados.
- Próximo passo: revisão visual do usuário antes de autorizar autenticação real na etapa 4.

## Etapa 4 — autenticação real

**Entrega:** login, sessão e logout integrados ao backend.

- Configurar `API_BASE_URL` somente no servidor.
- Implementar transporte com timeout, tratamento de JSON inválido e erros tipados.
- Integrar `POST /auth/login` e `GET /auth/me`.
- Validar estruturalmente a resposta antes de salvar o cookie HttpOnly, com validade baseada em `expiresIn`.
- Implementar logout local e redirecionamento em 401, sem loops nem refresh token.
- Diferenciar senha incorreta, sessão expirada e API indisponível.

**Validar:** TypeScript, lint, build e login real quando houver API e acesso disponíveis. Se não houver, registrar exatamente o que não foi verificado; não substituir a API por um mock.

**Ponto de revisão:** autenticação pronta antes de acrescentar telas privadas.

### Entrega da etapa 4 — aguardando revisão

- Login real por Server Action em `src/app/login/actions.ts`, consulta de sessão com `GET /auth/me` e logout local em `src/app/actions/session.ts`. A raiz confirma acesso e oferece sair, sem calendário ou navegação da etapa 5.
- Transporte em `src/server/api/request.ts`: `fetch` com `no-store`, timeout de 10 segundos, erros tipados, JSON inválido tratado, resposta 204 sem parsing e sem retry automático. Caminhos restritos às duas operações de autenticação.
- Respostas verificadas estruturalmente em `src/server/api/auth.ts`: usuário/fuso, formato do token, tipo Bearer e validade. Cookie HttpOnly, SameSite=Lax, Path=/ e Secure em produção; `maxAge` vem de `expiresIn`. Cookie escrito/apagado apenas nas actions. HTTP 401 retorna ao login sem loop; indisponibilidade preserva a distinção de erro.
- `API_BASE_URL` privada em `src/server/env.ts`, documentada no `.env.example`; `.env.local` configurado para o endereço confirmado pelo usuário e ignorado pelo Git. Nenhum segredo do backend foi lido. `server-only` adicionado após autorização explícita, sem alterar as cinco políticas do Yarn.
- Removidos exemplos de envio/erro e o seletor de revisão do login. Validação de senha vazia e limite de 72 bytes no client e no servidor, sem trim. Preenchimento preservado em erro; submit bloqueado enquanto pendente; token não enviado em props ou retorno de action.
- Verificações: `yarn lint`, `yarn typecheck`, `yarn build` e `git diff --check` passaram. API `/health` respondeu 200. Navegador confirmou campo vazio, envio e senha incorreta real. O usuário confirmou login bem-sucedido. Requisições locais confirmaram 307 para `/login` sem sessão, 307 para `/login?reason=expired` com token inválido e login 200 com aviso de expiração, sem loop. Inspeção dos chunks client não encontrou `API_BASE_URL`, `chrono_session`, header Authorization ou endereço privado local.
- Limites: a sessão bem-sucedida do usuário não estava acessível no navegador da ferramenta; logout autenticado permanece para conferência manual. Expiração natural, indisponibilidade após configuração, timeout e JSON malformado foram tratados no código, mas não reproduzidos contra a API. Cookie Secure em produção, leitor de tela e zoom real de 200% não foram verificados. Sem mocks ou testes automatizados novos.
- Próximo passo: revisar a autenticação antes de autorizar a etapa 5.

## Etapa 5 — estrutura privada e composição do calendário

**Entrega:** estrutura de navegação e uma primeira composição do calendário.

- Definir largura de navegação, título da página e área principal.
- Revisar toolbar, seleção de data, botão de criação e estado vazio.
- Validar a densidade da interface em desktop e mobile.
- Não mostrar links ou controles que prometam ações ainda inexistentes.
- Não implementar as quatro visualizações de uma vez.

**Ponto de revisão:** aprovar a organização da tela principal antes de desenvolver a grade.

### Entrega da etapa 5 — aguardando revisão

- Escopo autorizado pelo usuário: estrutura privada e composição visual; preservada a direção de cores, tipografia e controles já aprovada. Nenhuma aprovação visual desta nova composição foi presumida.
- `src/components/PrivateShell.tsx` organiza navegação de 224 px no desktop, cabeçalho compacto no mobile, link para pular ao conteúdo e logout existente. Somente Calendário aparece na navegação; não há links para módulos futuros.
- `src/components/calendar/{CalendarToolbar,CalendarPreview}.tsx` compõem título, seleção nativa de data, anterior/próximo/hoje, marcador da data e área sem atividades, explicitamente identificada como prévia. Nova atividade está desabilitado com indicação de disponibilidade futura, sem simular criação ou afirmar que a agenda real está vazia.
- `src/app/page.tsx` mantém a verificação real da sessão antes de exibir a composição. Falhas de acesso preservam a tela de erro e nova tentativa. A URL é a fonte da data selecionada; o formulário funciona sem estado client duplicado.
- `src/lib/calendar-date.ts` contém somente os helpers necessários à toolbar: data civil validada por round-trip, aritmética em UTC, limites 0001–9999 e hoje no fuso retornado pela API. Essa parte mínima de datas foi antecipada da etapa 6 para permitir seleção funcional, sem consultas de calendário.
- Verificações: `yarn lint`, `yarn typecheck`, `yarn build` e `git diff --check` passaram. Lint e typecheck precisaram de execução fora do sandbox porque o Corepack não conseguiu acessar o Yarn no ambiente restrito. Sem novas dependências, testes automatizados, endpoints ou alterações no backend.
- Limites: inspeção no navegador bloqueada pela política de segurança, que informou permissão recusada para localhost:3001. Desktop, mobile, teclado, zoom de 200%, leitor de tela e logout autenticado não foram conferidos visualmente nesta etapa. Responsividade e foco foram revisados no código.
- Próximo passo: revisão da composição pelo usuário; depois, mediante autorização, etapa 6 com leitura real da agenda por período. Grades e criação continuam nas etapas posteriores.

## Etapa 6 — leitura real em agenda

**Entrega:** agenda por período, carregada no servidor com `GET /calendar`.

- Criar tipos públicos a partir do contrato e helpers de datas civis.
- Obter hoje no fuso do usuário, sem depender do fuso da máquina.
- Usar a URL como fonte do período selecionado.
- Mostrar categoria, status, horário e origem de cada atividade.
- Usar `calendarKey`, inclusive para ocorrências com `id: null`.
- Implementar carregamento, vazio, indisponibilidade e nova tentativa.
- Sem criar ou editar atividades nesta etapa.

**Validar:** período correto, navegação, ausência de busca duplicada no mount e estados de falha.

**Ponto de revisão:** aprovar o padrão de leitura antes de criar grades mais complexas.

### Entrega da etapa 6 — aguardando revisão

- Implementada leitura real de `GET /calendar?from=…&to=…` em `src/server/api/calendar.ts`, pelo transporte `server-only` existente. Resposta validada estruturalmente, incluindo datas, horários, origem, chaves únicas e intervalo retornado. Não há mocks, novos endpoints ou alterações no backend.
- Tipos públicos em `src/lib/calendar-types.ts`; helpers em `calendar-date.ts` validam intervalo inclusivo de 1–366 dias e limitam navegação a 0001–9999. A URL `/?from=YYYY-MM-DD&to=YYYY-MM-DD` define o período. Padrão de sete dias a partir de hoje; `?date=` da fase 5 continua aceito. Hoje é calculado uma vez no servidor, no fuso da conta, e compartilhado com a agenda.
- `CalendarToolbar.tsx` permite escolher início/fim e navegar entre períodos. Intervalos inválidos mostram orientação e não disparam leitura. A prévia e o botão de criação indisponível foram removidos; criar/editar continua fora do escopo.
- `Agenda.tsx` agrupa itens por data e mostra categoria, status textual com cores aprovadas, origem e horários. Descrição usa expansão nativa. Itens sem horário ou sem fim não recebem duração inventada. Concluídos/cancelados permanecem visíveis; ocorrências virtuais usam `calendarKey`, independentemente de `id` nulo.
- `AgendaLoading.tsx`, Suspense por período, `app/loading.tsx` e `app/error.tsx` cobrem carregamento e falhas. Erros de API distinguem timeout/resposta inválida/indisponibilidade; nova tentativa recarrega o mesmo período. HTTP 401 redireciona ao login. Consulta inicial apenas no Server Component, sem fetch client, efeito no mount ou prefetch dos links de período.
- Verificações: `yarn lint`, `yarn typecheck`, `yarn build` e `git diff --check`. Nenhuma dependência ou teste automatizado adicionado. A execução de lint/TypeScript fora do sandbox usa o Yarn local após bloqueio de rede do Corepack no ambiente restrito.
- Limites: não houve validação autenticada de `GET /calendar` nem reprodução de vazio/erro/ocorrência virtual contra a API. A recusa de acesso ao navegador local registrada na fase 5 foi respeitada; não se contornou a restrição. Desktop/mobile, teclado, zoom e comportamento de rede permanecem pendentes de inspeção manual; a ausência de busca no mount foi conferida no código.
- Próximo passo: revisão da agenda pelo usuário; somente após autorização, etapa 7A (mês). Criação/edição permanece na etapa 8.

## Etapa 7 — visualizações do calendário, separadamente

Cada subetapa exige uma entrega e uma revisão próprias:

### 7A — mês

- Semanas começando na segunda-feira e consulta dos dias adjacentes exibidos.
- Destaques distintos para hoje e dia selecionado.
- Títulos longos, indicador de atividades excedentes e acesso à lista completa do dia.

#### Entrega da etapa 7A — aguardando revisão

- Implementada alternância entre Agenda e Mês na página principal, preservando Agenda como padrão. O mês usa `/?view=month&date=YYYY-MM-DD`; links, seleção de data e nova tentativa preservam essa visualização. Somente 7A foi executada, sem grade diária/semanal ou criação/edição.
- `MonthToolbar.tsx` permite anterior/próximo/hoje e seleção nativa de data. `monthGrid`, `adjacentMonth` e `monthHref` em `src/lib/calendar-date.ts` calculam semanas completas iniciadas na segunda-feira, com aritmética UTC e consulta dos dias adjacentes exibidos. Nas bordas 0001–9999, posições sem data válida ficam vazias e navegação fora do limite é desabilitada.
- `MonthView.tsx` consulta a API uma vez por render no servidor, reutilizando validação/ordenação existentes. Cada célula mostra até três atividades no desktop, com título limitado a duas linhas, horário e status textual; quantidade excedente abre a lista completa do dia abaixo da grade. No mobile, a célula mostra data/quantidade e o detalhe completo permanece acessível abaixo. Selecionar um dia adjacente abre seu respectivo mês.
- Hoje usa número branco sobre círculo petróleo; seleção usa fundo azul claro e contorno, com indicação textual no detalhe e `aria-current` no link. Tabela semântica, links nativos, formulário rotulado e âncora focável para a lista do dia. Não foram criadas interações de drag ou semântica de grid que exigisse teclado customizado.
- `ActivityRow.tsx` extrai a apresentação já existente na agenda para compartilhar o detalhe completo, incluindo descrição, categoria e origem. Chaves de atividades continuam sendo `calendarKey`, inclusive ocorrências virtuais. Nenhum endpoint, dependência ou teste automatizado novo.
- Verificações concluídas: `yarn lint`, `yarn typecheck`, `yarn build` e `git diff --check`. Inspeção pontual dos helpers via Node exibiu intervalos corretos para 0001-01, 0099-12/0100-01, fevereiro de 0100/2024/2026, virada 2026/2027 e dezembro de 9999. Todas as semanas observadas começam na segunda-feira; o limite superior deixa duas células vazias sem consultar o ano 10000.
- Limites: consulta autenticada, densidade real de atividades, foco/rolagem da âncora, desktop/mobile, zoom e navegação por teclado não foram reproduzidos no navegador. A recusa anterior de acesso local foi respeitada; responsividade e acessibilidade foram revisadas no código. Nenhum dado fictício adicionado para substituir a integração.
- Próximo passo: revisão da visualização mensal pelo usuário; somente após autorização, etapa 7B (dia).

### 7B — dia

- Separar atividades sem horário da grade horária.
- Posicionar atividades simultâneas sem escondê-las.
- Aceitar início sem fim, sem inventar duração persistida.

### 7C — semana

- Reutilizar o padrão diário aprovado.
- Preservar leitura e interação com rolagem horizontal controlada no mobile.
- Oferecer acesso simples às visualizações dia e agenda.

**Validar em cada subetapa:** bordas de mês/ano, ano bissexto, limites 0001–9999, sobreposição quando aplicável e navegação por teclado. Não implementar drag-and-drop.

## Etapa 8 — eventos e tarefas concretos

Dividir em duas entregas:

### 8A — criar e consultar

- Aprovar um editor pequeno de atividade, com campos do contrato.
- Abrir criação com data/horário selecionados.
- Integrar criação real e detalhe atualizado por ID.
- Impedir envio duplicado, preservar preenchimento em erro e atualizar a leitura em sucesso.

### 8B — editar e remover

- Edição parcial, reagendamento e alteração entre os quatro status.
- `completedAt` permanece controlado pelo backend.
- Diferenciar cancelar de excluir e confirmar a exclusão com explicação específica.
- Tratar DELETE 204 sem tentar ler JSON.

**Ponto de revisão:** validar usabilidade do editor antes de reutilizá-lo para recorrências.

## Etapa 9 — ocorrência individual

**Entrega:** edição de somente uma ocorrência, sem operações em série.

- Usar ID do segmento e data original nas rotas, mesmo após reagendamento.
- Carregar detalhe fresco e manter a identidade visual estável.
- Enviar apenas campos alterados; não transformar todos os valores resolvidos em overrides.
- Oferecer herança explícita e distinguir descrição vazia, horários removidos e horários herdados.
- Oferecer retorno à data original e restauração completa com confirmação dos efeitos.

**Validar:** ocorrência virtual, personalização, herança, reagendamento e reset com API real quando disponível.

## Etapa 10 — recorrências

Executar uma subetapa por vez:

- **10A:** criação, listagem paginada e detalhe da regra; frequência, intervalo, âncora e término.
- **10B:** escolha de escopo e edição “esta e as próximas” por split, enviando somente mudanças intencionais.
- **10C:** encerramento por data, confirmação e apresentação de conflitos com datas/status, preservando o draft.

Não recalcular a expansão de recorrências no frontend. Não inferir o último segmento a partir de uma página da lista. Não apagar estados automaticamente para resolver conflitos. Não inventar reabertura ou PATCH direto da regra.

## Etapa 11 — modelos semanais

Executar uma subetapa por vez:

- **11A:** listagem paginada, criação e detalhe; aprovar o editor de itens antes de ampliá-lo.
- **11B:** edição de nome/itens, com chaves locais estáveis, limite de 200 itens e suporte a modelo vazio.
- **11C:** aplicação com segunda-feira e semana explicitamente apresentadas; tratar primeira aplicação e reaplicação idempotente.
- **11D:** arquivamento com confirmação de que cópias existentes permanecem e não há restauração pública.

Não enviar IDs internos no payload dos itens. Explicar que editar um modelo não altera eventos já criados.

## Etapa 12 — revisão integrada e documentação

**Entrega:** revisão final dos fluxos já implementados, sem expansão de escopo.

- Conferir atualização de telas após mutações e recuperação de falhas.
- Revisar acessibilidade, foco de diálogos, Escape, retorno de foco, mobile e zoom.
- Conferir que JWT e configuração privada não chegam ao client.
- Remover artefatos temporários de apresentação criados durante as etapas.
- Executar TypeScript, lint e build; inspecionar os fluxos disponíveis no navegador.
- Atualizar README com instalação, ambiente, comandos, arquitetura e limitações reais.
- Registrar operações não verificadas por indisponibilidade da API ou ausência de acesso.

## Registro de continuidade

Preencher ao concluir cada etapa:

| Etapa | Situação | Decisões aprovadas | Arquivos relevantes | Validação | Pendências |
| --- | --- | --- | --- | --- | --- |
| Reinício | Concluído | Descartar a implementação anterior e trabalhar em entregas pequenas | Este plano e referências originais | Conferência dos arquivos preservados | Iniciar etapa 0 quando solicitada |
| 0 | Aprovada | Direção visual e tamanho da primeira entrega; execução da etapa 1 autorizada | `implementacao-em-etapas.md`; consulta às quatro referências | Inspeção do repositório e revisão documental | Validar o padrão visual na etapa 2 |
| 1 | Aprovada | Base e políticas do Yarn; avanço à etapa 2 autorizado | Configurações, lockfile, `src/app` e README | TypeScript, lint, build e inicialização na porta 3001; inspeção no navegador | Nenhuma pendência impeditiva |
| 2 | Aprovada | Controles aprovados; avanço para login visual autorizado | `src/components/ui`, `src/app`, README | Build, lint, TypeScript, teclado, contraste e desktop/mobile | Aprovar ou ajustar antes do login visual |
| 3 | Aprovada | Login visual aprovado; avanço à autenticação autorizado | `src/app/login`, `src/app/page.tsx`, `Input.tsx`, README | Build, lint, TypeScript, desktop/mobile e teclado | Zoom de 200% pendente |
| 4 | Aguardando revisão | Autenticação implementada; `server-only` autorizado | `src/server`, `src/app/login`, `src/app/actions`, `src/lib`, ambiente e lockfile | Checks passaram; erros e redirects conferidos; login real confirmado pelo usuário | Revisar antes da etapa 5; logout autenticado e limites acima |

Situações sugeridas: não iniciada, em implementação, aguardando revisão, aprovada.

**Próxima ação:** aguardar a revisão da autenticação da etapa 4. Iniciar a etapa 5 somente após aprovação.
