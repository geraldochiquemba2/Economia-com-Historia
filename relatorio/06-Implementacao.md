# 5. IMPLEMENTAÇÃO

## 5.1 Arquitetura do Sistema

A plataforma "Economia com História" foi desenvolvida com uma arquitetura client-server, separando claramente o frontend (React) do backend (Express.js), comunicando através de uma API RESTful.

```
┌─────────────────────────────────────────────────────┐
│                    CLIENTE (Browser)                 │
│  ┌───────────────────────────────────────────────┐  │
│  │  React 18 + TypeScript + Tailwind CSS         │  │
│  │  ┌─────────┐ ┌──────────┐ ┌───────────────┐  │  │
│  │  │  Pages   │ │Components│ │   Layouts     │  │  │
│  │  │ (25)     │ │  (55)    │ │  (2)          │  │  │
│  │  └─────────┘ └──────────┘ └───────────────┘  │  │
│  │  React Router v7 (28 rotas)                   │  │
│  └───────────────────────────────────────────────┘  │
│                        │ HTTP/JSON                  │
└────────────────────────┼────────────────────────────┘
                         │
┌────────────────────────┼────────────────────────────┐
│                    SERVIDOR (Node.js)                │
│  ┌───────────────────────────────────────────────┐  │
│  │  Express.js 5.2.1 (55 endpoints)              │  │
│  │  ┌────────┐ ┌─────────┐ ┌──────────────────┐ │  │
│  │  │ Auth   │ │Business │ │   AI (Groq)      │ │  │
│  │  │ JWT    │ │ Logic   │ │   Chat/Quiz/Mod  │ │  │
│  │  └────────┘ └─────────┘ └──────────────────┘ │  │
│  └───────────────────────────────────────────────┘  │
│                        │ SQL                        │
│  ┌───────────────────────────────────────────────┐  │
│  │  PostgreSQL (Neon Cloud) - 11 tabelas          │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## 5.2 Estrutura de Diretórios

```
economia/
├── server.mjs                 # Backend - API (2.090 linhas)
├── .env                       # Variáveis de ambiente
├── package.json               # Dependências
├── src/
│   └── app/
│       ├── main.tsx           # Entry point React
│       ├── routes.tsx         # 28 rotas definidas
│       ├── index.css          # Estilos globais + Tailwind
│       ├── pages/             # 25 páginas
│       │   ├── Home.tsx       # Página principal
│       │   ├── Explore.tsx    # Explorar conteúdo
│       │   ├── ContentDetail.tsx
│       │   ├── Quiz.tsx       # Quiz gamificado
│       │   ├── Forum.tsx      # Fórum de debate
│       │   ├── Profile.tsx    # Perfil do utilizador
│       │   ├── Rankings.tsx   # Rankings
│       │   ├── Login.tsx
│       │   ├── Register.tsx
│       │   └── admin/         # 9 páginas admin
│       │       ├── AdminDashboard.tsx
│       │       ├── AdminContent.tsx
│       │       ├── AdminReview.tsx
│       │       ├── AdminUsers.tsx
│       │       ├── AdminQuiz.tsx
│       │       └── ...
│       ├── components/        # 55 componentes
│       │   ├── AIChatAssistant.tsx
│       │   ├── CommentSection.tsx
│       │   ├── NotificationsModal.tsx
│       │   └── ui/            # 46 componentes shadcn/ui
│       ├── layouts/
│       │   ├── UserLayout.tsx
│       │   └── AdminLayout.tsx
│       └── hooks/
│           └── usePolling.ts
└── relatorio/                 # Este relatório
```

## 5.3 Backend - API RESTful (server.mjs)

### 5.3.1 Configuração do Servidor

O servidor Express.js foi configurado com middleware para CORS, parsing de JSON e uploads via Multer. A base de dados PostgreSQL (Neon) é sincronizada automaticamente no arranque com migrações `CREATE TABLE IF NOT EXISTS` e `ALTER TABLE ADD COLUMN IF NOT EXISTS`.

```javascript
// Configuração principal
const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Pool de conexão PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
```

### 5.3.2 Autenticação e Autorização

O sistema de autenticação utiliza JWT (JSON Web Tokens) com middleware de verificação de roles:

- **`requireAuth`**: Verifica token JWT no header Authorization
- **`requireAdmin`**: Exige role "admin" no token JWT
- **Roles suportadas**: `admin`, `escritor`, `revisor`, `elite`, `base`

Passwords são hasheadas com bcrypt (10 rounds de salt) antes de armazenar.

### 5.3.3 Endpoints API

A API disponibiliza **55 endpoints** organizados por domínio:

| Domínio | Endpoints | Método |
|---------|-----------|--------|
| Autenticação | 4 | POST |
| Utilizadores | 13 | GET/PUT/DELETE/PATCH |
| Conteúdo | 12 | GET/POST/PUT/DELETE/PATCH |
| Comentários | 6 | GET/POST/PATCH |
| Quiz | 6 | GET/POST/PUT/DELETE |
| Notificações | 3 | GET/PATCH |
| Elite Requests | 5 | GET/POST/PATCH/DELETE |
| Categorias | 6 | GET/POST/PUT/DELETE/PATCH |
| Trivia | 6 | GET/POST/PUT/DELETE |
| IA (Groq) | 3 | POST/GET |
| Upload/Mídia | 2 | POST/GET |
| Rankings/Stats | 3 | GET |
| Password Reset | 2 | GET/POST |
| Health Check | 1 | GET |

### 5.3.4 Sistema de Upload (Telegram Bot)

Os ficheiros multimédia (avatares, thumbnails, documentos) são armazenados via Telegram Bot API, funcionando como storage cloud gratuito:

1. Utilizador seleciona ficheiro
2. Frontend envia via `POST /api/upload`
3. Backend reencaminha para Telegram Bot API
4. Retorna URL do ficheiro no Telegram

### 5.3.5 Migrações Automáticas

A base de dados é sincronizada no arranque do servidor com queries `CREATE TABLE IF NOT EXISTS` e `ALTER TABLE ADD COLUMN IF NOT EXISTS`. Este approach elimina a necessidade de scripts de migração separados, simplificando o deploy.

## 5.4 Frontend - React + TypeScript

### 5.4.1 Sistema de Rotas

O frontend utiliza React Router v7 com 28 rotas organizadas em:

- **Rotas públicas**: `/login`, `/register`, `/forgot-password`, `/change-password`
- **Rotas de utilizador** (UserLayout): `/app/*` — 14 rotas
- **Rotas de admin** (AdminLayout): `/admin/*` — 9 rotas

### 5.4.2 Layouts

Dois layouts principais com navegação inferior mobile:

- **`UserLayout.tsx`**: Barra de navegação inferior com 5 itens (Início, Explorar, Quiz, Fórum, Perfil) + botão IA flutuante
- **`AdminLayout.tsx`**: Painel administrativo com 9 itens de navegação + barra superior com notificações

### 5.4.3 Componentização

O projeto utiliza **55 componentes** organizados em:

- **6 componentes customizados**: AIChatAssistant, CommentSection, ImageModal, NotificationsModal, PageTransition, ScrollToTop
- **46 componentes UI** (shadcn/ui): Button, Card, Dialog, Input, Select, Table, Tabs, etc.
- **2 utilitários**: utils (cn), use-mobile

### 5.4.4 Tema Claro/Escuro

O suporte a temas é implementado com CSS custom properties e classes Tailwind:

```tsx
// Componentes alternam entre temas
<div className="bg-white dark:bg-[#1A0A0D] text-neutral-900 dark:text-white">
```

Cores da marca: `#3A0310` (maroon) e `#E8B4B8` (rosa), com classe `force-white` para texto que deve manter-se branco em ambos os temas.

### 5.4.5 Polling em Tempo Real

Todas as páginas implementam polling periódico para dados atualizados:

| Página | Intervalo | Dados |
|--------|-----------|-------|
| Home | 15s | Notificações |
| Explore | 30s | Estado saved/elite |
| Profile | 30s | Role, elite, saved, stats |
| Admin Dashboard | 30s | Estatísticas |
| Admin Review | 30s | Conteúdo pendente |
| Admin Content | 60s | Lista de conteúdo |
| Admin Users | 60s | Lista de utilizadores |
| Forum Detail | 60s | Tópicos |

## 5.5 Inteligência Artificial (Groq)

### 5.5.1 Assistente Virtual

O assistente IA (`AIChatAssistant.tsx`) permite aos utilizadores fazer perguntas sobre a plataforma. O system prompt inclui dados em tempo real (conteúdo, rankings, categorias, contagem de utilizadores).

```javascript
// Endpoint: POST /api/ai/chat
const completion = await groq.chat.completions.create({
  model: "llama-3.3-70b-versatile",
  messages: [
    { role: "system", content: systemPrompt },  // Contexto da plataforma
    { role: "user", content: message }
  ],
});
```

### 5.5.2 Geração de Quiz

Administradores podem gerar perguntas de quiz automaticamente por tema:

```javascript
// Endpoint: POST /api/admin/quiz/generate
// Gera 5 perguntas de múltipla escolha sobre o tema indicado
```

### 5.5.3 Análise de Comentários

O sistema analisa comentários para detetar conteúdo abusivo:

```javascript
// Endpoint: GET /api/admin/comments/analyze
// Classifica comentários como aprovados, suspeitos ou abusivos
```

## 5.6 Gamificação

### 5.6.1 Sistema de XP

- Cada resposta correta no quiz atribui pontos de XP
- XP determina o ranking do utilizador

### 5.6.2 Streak (Dias Ativos)

O streak é calculado com base na data de última atividade (`lastActiveDate`):
- Se a última atividade foi ontem → streak + 1
- Se a última atividade foi há mais de 1 dia → streak = 1
- Primeira atividade → streak = 1

### 5.6.3 Rankings

Rankings são calculados por XP total, exibindo top utilizadores com posição, avatar e XP.

## 5.7 Sistema de Notificações

Notificações são geradas automaticamente para:
- **Menções** em comentários (`mention`)
- **Likes** em conteúdo (`like`)
- **Promoção** de role (`role_promotion`)
- **Despromoção** de role (`role_demotion`)

O frontend pesquisa notificações a cada 15 segundos e exibe contador não lidas.

## 5.8 Controlo de Acesso por Roles

| Role | Permissões |
|------|-----------|
| `admin` | Acesso total, gestão de utilizadores, aprovação de conteúdo, IA |
| `escritor` | Criar conteúdo, ver próprio conteúdo |
| `revisor` | Criar e rever conteúdo, aprovar/rejeitar |
| `elite` | Acesso a conteúdo Jindungo |
| `base` | Consumir conteúdo, comentar, jogar quiz |

Conteúdo "Jindungo" é restrito a roles elite, admin, escritor e revisor.
