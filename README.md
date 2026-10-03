# SmartLar

[![React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)](https://vite.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ecf8e?logo=supabase&logoColor=white)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

Sistema de gestão para uma empresa de automação residencial. Acompanha cada instalação desde o orçamento até o faturamento, com agenda de técnicos e indicadores do mês.

## Sobre o projeto

A SmartLar vendia no caderno: o orçamento ficava em um lugar, a agenda em outro e o valor faturado em uma planilha. O resultado era pedido perdido, técnico no endereço errado e total que não batia com os itens.

O SmartLar resolve isso com um fluxo único.

- **Clientes** com telefone (WhatsApp) e endereço da instalação.
- **Produtos** em catálogo por categoria, com preço usado no orçamento.
- **Pedidos** que nascem como orçamento e andam em uma direção: orçamento, aprovado, agendado, em andamento, concluído. Cancelar só sai de orçamento ou aprovado.
- **Agenda** por técnico ou a semana inteira, com Lucas e Pedro lado a lado.
- **Equipe** com especialidade, WhatsApp, carga da semana e próxima instalação.
- **Relatórios** com faturamento dos últimos 6 meses, pedidos por status, produtos e comparação dos técnicos.
- **Dashboard** com pedidos do mês, valor faturado, valor a receber, o que falta agendar e o gráfico de faturamento.
- **Automações** que avisam sobre pedido novo, instalações de amanhã, faturamento e orçamento parado.
- **Login** com Supabase Auth e Row Level Security: só entra quem tem usuário criado.

O total do pedido é a soma dos itens, menos o desconto do orçamento. Com desconto zero, dois itens de 450 e um de 180 continuam em 1080. O banco recalcula o valor salvo para o total nunca divergir da tela.

## Tecnologias utilizadas

### Front-end

- React 19 e TypeScript
- Vite 8
- Tailwind CSS 4 com tokens de cor em OKLCH
- shadcn/ui (estilo radix-nova) sobre Radix
- React Router 7, com rotas carregadas sob demanda
- TanStack Query 5 para dados do servidor
- react-hook-form e zod para formulários
- date-fns, sonner, lucide-react e recharts

### Back-end e banco

- Supabase com Postgres 17
- Supabase Auth para o login
- Row Level Security: acesso completo para usuários autenticados, nenhum para anônimos
- RPC `criar_pedido`, triggers de total e de fluxo de status, e views de dashboard e agenda

### Bibliotecas e ferramentas

- oxlint para lint
- `node:test` para os testes de domínio
- Tailwind Merge e clsx para classes

### Integrações

- n8n com quatro e-mails para o cliente do pedido: novo orçamento, instalações de amanhã, faturamento e orçamento parado há 3 dias
- Gatilho no Postgres (`notificar_n8n`) que chama os webhooks de produção do n8n
- Deploy na Vercel (`vercel.json` reescreve as rotas para o `index.html`)

## Acesso na Vercel

A Vercel só publica o frontend. Ela não cria usuário e não guarda senha. O login é o Supabase Auth: a tela pede e-mail e senha, e o banco só libera as telas depois que a sessão existe.

Abra https://temporary-prompt-krypton-xweiyzs.vercel.app e entre com:

- E-mail: `rafael@smartlar.dev`
- Senha: `SmartLar-rafael-2026`

Esse usuário já está em Authentication no projeto `cpnsbtrlagsqemldzcif`. Não há cadastro público. Para criar outro acesso, o caminho é o painel do Supabase, em Authentication > Users, e não as configurações da Vercel.

O endereço acima é o link temporário que já está no ar. A publicação que acompanha o GitHub é outra, e eu não consigo entrar na sua conta da Vercel por você.

1. Em [vercel.com](https://vercel.com), escolha Add New > Project e importe `marowyck/smartlar`.
2. Framework Vite, comando de build `npm run build`, pasta de saída `dist`.
3. Em Environment Variables, coloque `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` com os mesmos valores do `.env` local. A `service_role` não entra aqui.
4. Cada push na `master` publica sozinho. O `vercel.json` já manda qualquer rota interna para o `index.html`.

Quando o projeto estiver importado, o endereço definitivo substitui o link temporário neste README e em [docs/ENTREGA.md](docs/ENTREGA.md).

## Estrutura do projeto

```
src/
  main.tsx            entrada da aplicação
  App.tsx             junta providers e rotas
  assets/             logo e imagens do app
  components/
    ui/               componentes do shadcn (arquivos soltos, gerados pelo CLI)
    common/           componentes reutilizáveis sem regra de negócio
    layout/           blocos estruturais: marca, sidebar, menu, cabeçalho de página
  layouts/            AppLayout, que compõe os blocos de layout
  pages/              uma pasta por rota; a página só compõe componentes de features
  features/           um domínio por pasta: auth, agenda, clientes, dashboard, pedidos, produtos, relatorios
    components/       componentes da feature, cada um na própria pasta
    hooks/            consultas e mutations (TanStack Query)
    services/         chamadas ao Supabase e mapeadores
    types/ schemas/   tipos e validação zod
    domain/           regras puras, com testes ao lado
    context/          estado de interface da feature
  routes/             rotas, guarda de autenticação e redirecionamentos
  providers/          tema, query client, roteador, autenticação e toasts
  store/              estado global de interface (painel de modais)
  hooks/              hooks genéricos
  utils/              formatação, dinheiro, telefone, erros e classes
  constants/          chaves de consulta e rotas
  config/             variáveis de ambiente, nome do app e navegação
  services/supabase/  cliente único do Supabase
  styles/             globals.css, tokens.css e animations.css
  types/              tipos globais, inclusive as variáveis de ambiente
supabase/             migrations, seed e RLS
n8n/                  workflows importáveis
docs/                 entrega e roteiro de teste
```

### Regras de dependência

As dependências andam em uma direção só.

- `pages` usa `layouts` e `features`.
- `features` usa `components`, `utils`, `hooks` e `services`.
- `components/common` e `components/layout` usam `components/ui`.
- `services` usa `config`.
- Uma feature importa de outra o arquivo que precisa: componente, hook, tipo ou serviço.

## Como executar o projeto

### Requisitos

- Node.js 22 ou superior
- npm
- Uma conta no Supabase com um projeto vazio

### Instalação

```bash
git clone <url-do-repositorio>
cd smartlar
npm install
```

### Variáveis de ambiente

Copie o exemplo e preencha com a URL e a chave `anon` do projeto. A `service_role` nunca entra aqui: ela fica só no n8n.

```bash
cp .env.example .env
```

```
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
```

### Banco de dados

No SQL Editor do Supabase, rode nesta ordem os arquivos de [supabase/README.md](supabase/README.md): as migrations, o seed e o histórico. Em seguida crie um usuário em Authentication > Users. O sistema não tem cadastro público.

### Comandos

```bash
npm run dev      # sobe o Vite em http://localhost:5173
npm run build    # checagem de tipos e build de produção
npm run preview  # serve o build
npm run lint     # oxlint
npm test         # testes de domínio com node:test
```

## Banco e automações

- Banco, RLS e seed: [supabase/README.md](supabase/README.md)
- Workflows do n8n: [n8n/README.md](n8n/README.md)

## Documentos de entrega

- [docs/ENTREGA.md](docs/ENTREGA.md): o que foi entregue e as decisões
- [docs/TESTE.md](docs/TESTE.md): roteiro para testar o fluxo completo
