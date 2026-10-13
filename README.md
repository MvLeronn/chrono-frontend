# Chrono frontend

Base em Next.js App Router, React e TypeScript estrito, com Tailwind CSS e Lucide. Login, consulta de sessão e logout local estão integrados. A etapa 6 implementa a agenda por período com leitura real no servidor, agrupamento por dia e estados de carregamento, vazio e falha. Criação e grades serão implementadas nas etapas seguintes.

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

`src/app/login` contém a tela, o formulário e a Server Action de login. `src/server` contém configuração privada, transporte e sessão, protegidos por `server-only`. `src/components/ui` contém `Button`, `Input`, `Label` e `FieldError`. Os componentes usam Tailwind; `globals.css` fica restrito aos tokens e à base. Os controles temporários de simulação foram removidos.

O formulário envia somente a senha para a Server Action, que chama `POST /auth/login`. A resposta é validada antes de salvar o JWT no cookie `chrono_session`: HttpOnly, SameSite=Lax, Path=/, Secure em produção e validade baseada em `expiresIn`. Use HTTPS em produção. Token e resposta bruta de login não são retornados ao JavaScript do navegador.

A raiz e o login consultam `GET /auth/me` no servidor para conferir a sessão. Um cookie presente não é prova de acesso. HTTP 401 retorna ao login sem loop; falhas de rede/serviço não são tratadas como senha incorreta. O transporte usa `no-store`, timeout de 10 segundos e não repete mutações automaticamente. Logout apaga o cookie por Server Action, sem endpoint fictício ou refresh token; não revoga cópias externas do JWT.

`src/components/PrivateShell.tsx` organiza a área privada; `src/components/calendar` contém a toolbar e a agenda. O período fica em `/?from=YYYY-MM-DD&to=YYYY-MM-DD`, com anterior/próximo/hoje e formulário nativo. O padrão é de sete dias; `?date=` continua aceito como início desse período. Hoje é calculado no servidor no fuso da conta. Intervalos inválidos ou acima de 366 dias exibem orientação sem consultar a API.

`src/server/api/calendar.ts` consulta `GET /calendar` com autenticação e `no-store`, valida a resposta e ordena por data, horário e `calendarKey`. A agenda exibe todos os status e distingue categoria de origem, inclusive cópias de modelos e ocorrências virtuais. Não há busca no mount, proxy público ou token nas props. A nova tentativa de falha preserva o período.

Validação da etapa 6: lint, TypeScript, build e diff conferidos; sem testes automatizados novos. A consulta autenticada e seus estados não foram reproduzidos contra a API nesta etapa. A recusa de acesso ao navegador local registrada na etapa 5 foi respeitada; desktop/mobile, teclado e zoom permanecem pendentes. A agenda aguarda revisão antes da grade mensal (7A).

O Yarn informa um peer transitivo ausente de `eslint` em `@next/eslint-plugin-next`, embora o projeto forneça ESLint. O lint deve ser validado antes de aceitar futuras atualizações. O aviso de scripts bloqueados de `unrs-resolver` é esperado pela política de instalação.

Consulte [o plano em etapas](./implementacao-em-etapas.md) e as referências preservadas: [execução](./frontend-execucao.md), [contexto](./contexto.md), [contrato](./contrato.md) e [modelos](./models.md).
