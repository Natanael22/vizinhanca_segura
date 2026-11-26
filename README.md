# Vizinhança Segura

**Vizinhança Segura** é uma aplicação colaborativa para moradores comunicarem rapidamente situações suspeitas em sua região. O projeto combina alertas geolocalizados, mapa interativo, conversa comunitária, contatos de emergência e cadastro de parceiros locais em uma interface progressiva para dispositivos móveis.

[🌐 Aplicação publicada](https://app.vizinhancasegura.nex3n.com/)

## Funcionalidades

- Cadastro e autenticação de usuários com perfil comunitário.
- Publicação de alertas com tipo, descrição, localização, referência e foto.
- Mapa com marcadores e agrupamento de ocorrências.
- Confirmação, resolução e denúncia de alertas.
- Comentários em ocorrências.
- Feed comunitário e tópicos locais.
- Geolocalização e busca de CEP/endereço.
- Contatos de emergência e lista de parceiros da comunidade.
- Verificação de telefone por OTP via WhatsApp.
- Atualização em tempo real dos alertas por meio do Supabase Realtime.
- Instalação como PWA, incluindo suporte a modo standalone.

## Tecnologias

- React 19
- TypeScript 5.9
- Vite 7
- React Router 7
- Tailwind CSS 3
- Supabase Auth, Database, Storage e Realtime
- Leaflet e React Leaflet
- WhatsApp Cloud API por uma Supabase Edge Function
- vite-plugin-pwa
- Lucide React e date-fns

## Estrutura do projeto

```text
.
├── public/                 # Ícones, manifest assets, robots.txt e sitemap
├── src/
│   ├── components/         # Componentes reutilizáveis, mapa, feed e navegação
│   ├── context/            # Estado global de autenticação, alertas e localização
│   ├── hooks/              # Hooks React específicos da aplicação
│   ├── layout/             # Estrutura visual e navegação mobile
│   ├── lib/                # Cliente Supabase e tipos principais
│   ├── pages/              # Páginas da aplicação e suas rotas
│   ├── services/           # Integrações com Supabase, CEP e WhatsApp
│   ├── types/              # Tipos de domínio
│   └── utils/              # Funções auxiliares
├── supabase/
│   ├── functions/          # Edge Functions, incluindo OTP por WhatsApp
│   └── config.toml         # Configuração local do Supabase
├── supabase_*.sql          # Scripts auxiliares de criação/atualização do banco
└── vite.config.ts          # Build, PWA e divisão de bundles
```

## Como executar

### Pré-requisitos

- Node.js 20 ou superior
- npm
- Projeto configurado no [Supabase](https://supabase.com/)

### Instalação

```bash
git clone https://github.com/Natanael22/vizinhanca_segura.git
cd vizinhanca_segura
npm install
```

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

Em seguida, execute:

```bash
npm run dev
```

A aplicação será disponibilizada pelo Vite, normalmente em `http://localhost:5173`.

## Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Executa a verificação TypeScript e gera o build de produção |
| `npm run lint` | Executa o ESLint no projeto |
| `npm run preview` | Serve localmente a versão construída |

## Configuração do Supabase

A interface espera tabelas e recursos configurados no Supabase, incluindo:

- `profiles`
- `alerts`
- `alert_confirmations`
- `alert_reports`
- `alert_comments`
- `otp_requests`
- `topics` e `topic_replies`, usados pela área comunitária
- Storage bucket `alert-photos`

Os arquivos SQL na raiz podem ser usados como ponto de partida para criar ou atualizar parte da estrutura do banco:

- `supabase_schema_update.sql`
- `supabase_feedback_table.sql`
- `supabase_otp_table.sql`

### Variáveis da Edge Function

A função `whatsapp-otp` exige as seguintes variáveis no ambiente do Supabase:

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
WHATSAPP_PHONE_NUMBER_ID=seu-phone-number-id
WHATSAPP_ACCESS_TOKEN=seu-token-da-meta
```

Para executar o projeto Supabase localmente:

```bash
npx supabase start
npx supabase functions serve whatsapp-otp --env-file supabase/.env
```

> Nunca exponha a `SUPABASE_SERVICE_ROLE_KEY` ou o token do WhatsApp no arquivo `.env` usado pelo frontend.

## Rotas principais

| Rota | Acesso | Finalidade |
|---|---|---|
| `/` | Público | Apresentação inicial |
| `/register` | Público | Cadastro |
| `/login` | Público | Login |
| `/onboarding` | Público | Configuração inicial |
| `/home` | Autenticado | Visão geral e mapa |
| `/feed` | Autenticado | Alertas da comunidade |
| `/create-alert` | Autenticado | Publicação de alerta |
| `/alert/:id` | Autenticado | Detalhes e comentários |
| `/emergency` | Autenticado | Contatos de emergência |
| `/partners` | Autenticado | Parceiros locais |
| `/topic/:id` | Autenticado | Tópicos comunitários |
| `/profile` | Autenticado | Perfil público |
| `/my-account` | Autenticado | Conta do usuário |
| `/support` | Autenticado | Feedback e suporte |

## Fluxo da aplicação

O ponto de entrada é `src/main.tsx`, que monta `src/App.tsx`. A aplicação envolve as páginas com provedores de autenticação, localização, alertas, notificações e tour guiado.

`AlertContext` carrega os dados por meio do cliente Supabase e se inscreve em mudanças da tabela `alerts`. Os serviços em `src/services` concentram operações como criação e resolução de alertas, confirmações, denúncias, comentários, CEP, geocodificação e OTP.

A `MobileLayout` organiza a navegação principal, enquanto `vite-plugin-pwa` gera o comportamento de aplicativo instalável e atualização automática.

## Build de produção

```bash
npm run build
npm run preview
```

Os arquivos gerados ficam em `dist/` e podem ser publicados em um provedor de hospedagem estática compatível com aplicações SPA. Como o React Router usa caminhos do navegador, a hospedagem deve redirecionar requisições desconhecidas para `index.html`.

## Segurança comunitária

A plataforma foi criada para facilitar comunicação rápida, mas não substitui os serviços oficiais de emergência. Em situações reais de risco, os usuários devem contatar imediatamente os serviços locais competentes.

## Licença

Nenhuma licença foi definida neste repositório até o momento. Antes de reutilizar ou distribuir o projeto, entre em contato com o proprietário do repositório para confirmar os termos de uso.
