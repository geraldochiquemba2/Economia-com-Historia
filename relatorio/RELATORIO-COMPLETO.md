# RELATÓRIO DE FIM DE CURSO

---

## **PLATAFORMA EDUCATIVA "ECONOMIA COM HISTÓRIA"**

### Aplicação Web Interativa para Aprendizagem da História, Cultura e Economia de Angola

---

**Curso:** Engenharia de Software

**Unidades Curriculares:** Engenharia de Software I & II

**Área de Concentração:** Desenvolvimento de Aplicações Web

---

**Autor:** Geraldo Abreu Chiquemba

**20240043@isptec.co.ao**

**Instituto Superior Politécnico de Tecnologias e Ciências (ISPTEC)**

---

**Local:** Luanda, Angola

**Data:** Julho de 2026


---

# ÍNDICE

1. Resumo
2. Introdução
   2.1 Contextualização
   2.2 Problema
   2.3 Objetivos
   2.4 Metodologia
3. Revisão da Literatura
   3.1 Tecnologias Utilizadas
   3.2 Trabalhos Relacionados
4. Análise e Especificação
   4.1 Requisitos Funcionais
   4.2 Requisitos Não Funcionais
   4.3 Modelos de Dados
   4.4 Casos de Uso
5. Arquitetura do Sistema
   5.1 Arquitetura Geral
   5.2 Arquitetura Backend
   5.3 Arquitetura Frontend
   5.4 Base de Dados
6. Implementação
   6.1 Stack Tecnológica
   6.2 Estrutura do Projeto
   6.3 Funcionalidades Implementadas
   6.4 Sistema de Autenticação e Autorização
   6.5 Sistema de Conteúdo
   6.6 Sistema de Comentários
   6.7 Sistema de Quiz e Gamificação
   6.8 Sistema de Notificações
   6.9 Integração com Inteligência Artificial
   6.10 Painel Administrativo
7. Testes e Validação
8. Deployment
9. Conclusão
   9.1 Resultados Alcançados
   9.2 Limitações
   9.3 Trabalhos Futuros
10. Referências Bibliográficas
11. Anexos


---

# 1. RESUMO

O presente relatório descreve o desenvolvimento da plataforma educativa **"Economia com História"**, uma aplicação web interativa concebida para promover a aprendizagem da história, cultura, geografia, economia e sociedade de Angola. A plataforma integra funcionalidades de conteúdo educativo, sistema de quiz gamificado, fórum de debate, comentários com menções, sistema de notificações em tempo real e assistente de inteligência artificial.

A aplicação foi desenvolvida utilizando uma arquitetura fullstack com **React** (TypeScript) no frontend, **Express.js** (Node.js) no backend, e **PostgreSQL** (Neon Cloud) como base de dados. A integração com **Groq AI** permite a geração automática de perguntas de quiz, um assistente virtual e moderação inteligente de comentários.

O sistema implementa cinco níveis de acesso (admin, revisor, escritor, elite, student) com fluxos de aprovação de conteúdo, gestão de utilizadores, e um sistema completo de gamificação com pontos XP, rankings e streaks diários.

A plataforma encontra-se funcional e acessível em **https://economia-com-historia.onrender.com**, com deployment automatizado via Render.com.

**Palavras-chave:** Plataforma educativa, gamificação, inteligência artificial, React, Node.js, PostgreSQL, Angola


---

# 2. INTRODUÇÃO

## 2.1 Contextualização

Angola possui um rico património histórico e cultural que permanece pouco acessível em formato digital interativo. A maioria dos recursos educativos disponíveis encontra-se em formato estático (PDFs, livros), não explorando as potencialidades das tecnologias web modernas para criar experiências de aprendizagem imersivas e envolventes.

A crescente adoção de dispositivos móveis em Angola (mais de 14 milhões de utilizadores de telemóvel) apresenta uma oportunidade única para disponibilizar conteúdo educativo de qualidade através de aplicações web responsivas e acessíveis.

## 2.2 Problema

A falta de uma plataforma digital unificada que combine conteúdo educativo sobre Angola com mecanismos interativos de aprendizagem (quiz, debate, gamificação) dificulta:
- O acesso democrático ao conhecimento histórico e cultural angolano
- O engajamento de estudantes na aprendizagem autónoma
- A criação de uma comunidade de aprendizagem colaborativa
- A produção e partilha de conteúdo educativo de qualidade

## 2.3 Objetivos

### Objetivo Geral
Desenvolver uma plataforma web educativa interativa que promova a aprendizagem da história, cultura e economia de Angola através de conteúdo multimédia, gamificação e inteligência artificial.

### Objetivos Específicos
1. Implementar um sistema de conteúdo educativo com workflow de aprovação
2. Desenvolver um sistema de quiz gamificado com rankings e XP
3. Criar um fórum de debate com sistema de comentários e menções
4. Integrar inteligência artificial para geração de conteúdo e assistente virtual
5. Implementar um sistema de notificações em tempo real
6. Desenvolver um painel administrativo completo
7. Garantir a acessibilidade e responsividade em todos os dispositivos

## 2.4 Metodologia

O desenvolvimento seguiu uma abordagem iterativa e incremental, utilizando conceitos de:
- **Desenvolvimento Fullstack** com separação clara frontend/backend
- **API RESTful** para comunicação entre camadas
- **Componentização** no frontend com React
- **Migrações de base de dados** automáticas no arranque do servidor
- **Deploy contínuo** via integração com Git e Render.com


---

# 3. REVISÃO DA LITERATURA

## 3.1 Tecnologias Utilizadas

### 3.1.1 React (Frontend)
React é uma biblioteca JavaScript criada pelo Facebook (Meta) para a construção de interfaces de utilizador baseadas em componentes. O seu modelo virtual DOM permite atualizações eficientes da interface, enquanto o sistema de hooks (useState, useEffect) simplifica a gestão de estado e efeitos laterais. Para esta plataforma, React 18.3.1 foi escolhido pela sua maturidade, ecossistema vasto e suporte a TypeScript.

### 3.1.2 Express.js (Backend)
Express.js é o framework web mais popular para Node.js, proporcionando uma abordagem minimalista e flexível para criação de APIs RESTful. A sua arquitetura baseada em middleware permite uma configuração modular e eficiente dos endpoints. Na versão 5.2.1 utilizada, oferece suporte nativo a async/await e melhorias de segurança.

### 3.1.3 PostgreSQL (Base de Dados)
PostgreSQL é um sistema de base de dados relacional open-source conhecido pela sua robustez, conformidade com SQL e suporte a tipos avançados como JSONB e arrays. O projeto utiliza Neon PostgreSQL (serverless cloud), que oferece escalabilidade automática e connection pooling.

### 3.1.4 Groq AI (Inteligência Artificial)
Groq é uma plataforma de inferência de IA de alta velocidade que utiliza os modelos Llama da Meta. A API permite geração de texto, classificação e análise com latência extremamente baixa. Foi integrada para: geração de quiz, assistente virtual e moderação de conteúdo.

### 3.1.5 Tailwind CSS
Framework CSS utility-first que permite design responsivo e personalizado através de classes pré-definidas. Combinado com o plugin Vite, oferece hot-reloading e optimização automática para produção.

### 3.1.6 Telegram Bot API
Utilizado como serviço de armazenamento cloud gratuito para ficheiros multimédia (avatares, thumbnails, documentos), eliminando a necessidade de servidor de ficheiros dedicado.

## 3.2 Trabalhos Relacionados

| Plataforma | Tipo | Gamificação | IA | Fórum | Mobile |
|------------|------|-------------|-----|-------|--------|
| Coursera | Cursos online | Certificados | Não | Fórum por curso | App nativo |
| Khan Academy | Tutoriais | Pontos/Badges | Não | Não | App nativo |
| Duolingo | Línguas | XP/Streak/S排行榜 | Sim (LLM) | Não | App nativo |
| **Economia com História** | **Educativo** | **XP/Streak/Rankings** | **Sim (Groq)** | **Sim** | **PWA/Responsive** |

A plataforma "Economia com História" distingue-se pela combinação de todos estes elementos num contexto educativo específico para Angola, com integração de IA para geração de conteúdo e assistente virtual.


---

# 4. ANÁLISE E ESPECIFICAÇÃO

## 4.1 Requisitos Funcionais

### RF-01: Registo e Autenticação
- **RF-01.1:** O utilizador deve poder registar-se com nome, email, palavra-passe e profissão
- **RF-01.2:** O utilizador deve poder iniciar sessão com email e palavra-passe
- **RF-01.3:** O sistema deve validar credenciais e retornar token JWT
- **RF-01.4:** O utilizador deve poder solicitar recuperação de palavra-passe
- **RF-01.5:** O administrador deve poder processar pedidos de recuperação

### RF-02: Gestão de Conteúdo
- **RF-02.1:** Escritores devem criar conteúdo (texto, vídeo, áudio, jindungo)
- **RF-02.2:** Conteúdo criado por escritores entra em estado "pendente"
- **RF-02.3:** Revisores/admins devem aprovar ou rejeitar conteúdo
- **RF-02.4:** Rejeição deve obrigatoriamente incluir motivo
- **RF-02.5:** Utilizadores devem navegar e filtrar conteúdo por tipo
- **RF-02.6:** Conteúdo deve suportar likes e dislikes
- **RF-02.7:** Admin deve poder destaque/recomendar conteúdo

### RF-03: Sistema de Comentários
- **RF-03.1:** Utilizadores devem comentar em conteúdos
- **RF-03.2:** Suporte a respostas aninhadas (2 níveis)
- **RF-03.3:** Sistema de menções (@utilizador) com notificações
- **RF-03.4:** Likes e dislikes em comentários
- **RF-03.5:** Admin pode ocultar comentários

### RF-04: Quiz e Gamificação
- **RF-04.1:** Quiz com 4 opções de resposta
- **RF-04.2:** Sistema de pontos XP por respostas corretas
- **RF-04.3:** Rankings de utilizadores por XP
- **RF-04.4:** Streak de dias ativos
- **RF-04.5:** Admin pode gerar quiz com IA

### RF-05: Notificações
- **RF-05.1:** Notificações por menções em comentários
- **RF-05.2:** Notificações por likes/dislikes
- **RF-05.3:** Notificações por promoção/despromoção de roles
- **RF-05.4:** Marcar notificações como lidas

### RF-06: Sistema Elite
- **RF-06.1:** Utilizadores podem solicitar acesso Elite
- **RF-06.2:** Admin aprova/rejeita pedidos
- **RF-06.3:** Conteúdo "Jindungo" restrito a Elite/Admin/Escritor/Revisor

### RF-07: Inteligência Artificial
- **RF-07.1:** Assistente IA conversacional para todos os utilizadores
- **RF-07.2:** Geração automática de quiz por tema com IA
- **RF-07.3:** Análise de comentários abusivos com IA (admin)

## 4.2 Requisitos Não Funcionais

| ID | Requisito | Descrição |
|----|-----------|-----------|
| RNF-01 | Performance | Tempo de resposta < 2s para operações CRUD |
| RNF-02 | Disponibilidade | 99.5% de uptime via Render.com |
| RNF-03 | Escalabilidade | Suporte a 1000+ utilizadores simultâneos |
| RNF-04 | Segurança | Passwords com bcrypt (10 rounds), JWT com expiração |
| RNF-05 | Usabilidade | Interface responsiva (mobile-first) |
| RNF-06 | Acessibilidade | Tema claro/escuro, contraste adequado |
| RNF-07 | Manutenibilidade | Código modular, componentização, TypeScript |

## 4.3 Modelo de Dados

A base de dados contém 10 tabelas principais:

```
┌─────────────┐     ┌──────────────┐     ┌────────────────┐
│    User      │────<│   Comment     │────>│    Content     │
│─────────────│     │──────────────│     │────────────────│
│ id (UUID)   │     │ id (UUID)    │     │ id (UUID)      │
│ name        │     │ contentId    │     │ type           │
│ email       │     │ userId (FK)  │     │ title          │
│ password    │     │ author       │     │ description    │
│ role        │     │ text         │     │ fullText       │
│ xp          │     │ parentId(FK) │     │ thumbnail      │
│ streak      │     │ likes[]      │     │ status         │
│ blocked     │     │ dislikes[]   │     │ featured       │
└─────────────┘     └──────────────┘     │ recommended    │
       │                                   └────────────────┘
       │                                          │
       ├────> ┌────────────────┐                  │
       │      │ QuizQuestion   │                  │
       │      │────────────────│                  │
       │      │ question       │                  │
       │      │ options (JSONB)│                  │
       │      │ correctAnswer  │                  │
       │      │ feedback       │                  │
       │      │ points         │                  │
       │      └────────────────┘                  │
       │                                          │
       ├────> ┌────────────────┐    ┌─────────────┴──┐
       │      │  Notification  │    │ SavedContent   │
       │      │────────────────│    │────────────────│
       │      │ userId (FK)    │    │ userId (FK)    │
       │      │ actorName      │    │ contentId      │
       │      │ type           │    └────────────────┘
       │      │ isRead         │
       │      └────────────────┘    ┌────────────────┐
       │                            │ CompletedStudy │
       ├────> ┌────────────────┐    │────────────────│
       │      │ EliteRequest   │    │ userId (FK)    │
       │      │────────────────│    │ contentId      │
       │      │ userId (FK)    │    └────────────────┘
       │      │ status         │
       │      └────────────────┘    ┌────────────────┐
       │                            │   Category     │
       ├────> ┌────────────────┐    │────────────────│
       │      │ PasswordReset  │    │ name           │
       │      │────────────────│    │ icon           │
       │      │ userId (FK)    │    │ color          │
       │      │ status         │    │ hidden         │
       │      │ newPassword    │    └────────────────┘
       │      └────────────────┘
       │
       └────> ┌────────────────┐
              │    Trivia      │
              │────────────────│
              │ title          │
              │ fact           │
              │ imageUrl       │
              │ isActive       │
              └────────────────┘
```

## 4.4 Casos de Uso Principais

### CU-01: Registo de Utilizador
- **Ator:** Utilizador não registado
- **Pré-condição:** Utilizador não tem conta
- **Fluxo:** Preencher formulário → Validar dados → Criar conta → Redirecionar para login
- **Pós-condição:** Conta criada com role "student"

### CU-02: Criação de Conteúdo (Escritor)
- **Ator:** Escritor/Revisor
- **Pré-condição:** Utilizador com role "escritor" ou "revisor"
- **Fluxo:** Selecionar tipo → Preencher dados → Submeter → Conteúdo fica "pending"
- **Pós-condição:** Conteúdo aguarda revisão

### CU-03: Revisão de Conteúdo
- **Ator:** Revisor/Admin
- **Pré-condição:** Conteúdo em estado "pending"
- **Fluxo:** Verificar conteúdo → Aprovar ou Rejeitar (com motivo)
- **Pós-condição:** Conteúdo "approved" ou "rejected"

### CU-04: Jogo de Quiz
- **Ator:** Utilizador registado
- **Pré-condição:** Quiz com perguntas disponíveis
- **Fluxo:** Iniciar quiz → Responder perguntas → Ver feedback → Ganhar XP
- **Pós-condição:** XP adicionado ao perfil

### CU-05: Assistente IA
- **Ator:** Qualquer utilizador
- **Pré-condição:** Nenhum
- **Fluxo:** Clicar no botão IA → Escrever pergunta → Receber resposta
- **Pós-condição:** Resposta gerada com contexto da plataforma


---

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


---

# 6. TESTES

## 6.1 Estratégia de Testes

Devido à natureza do projeto (desenvolvimento fullstack com ciclo iterativo curto), a estratégia de testes focou-se em testes manuais exploratórios e testes de integração via API, complementados por validação visual da interface.

## 6.2 Testes de API (Integração)

### 6.2.1 Autenticação

| Teste | Método | Endpoint | Resultado |
|-------|--------|----------|-----------|
| Registo com dados válidos | POST | `/api/auth/register` | ✅ Pass |
| Registo com email duplicado | POST | `/api/auth/register` | ✅ Pass (erro 400) |
| Login com credenciais corretas | POST | `/api/auth/login` | ✅ Pass (token JWT) |
| Login com password errada | POST | `/api/auth/login` | ✅ Pass (erro 401) |
| Acesso sem token | GET | `/api/users` | ✅ Pass (erro 401) |
| Acesso com token de admin | GET | `/api/users` | ✅ Pass |

### 6.2.2 Gestão de Conteúdo

| Teste | Método | Endpoint | Resultado |
|-------|--------|----------|-----------|
| Criar conteúdo (escritor) | POST | `/api/content` | ✅ Pass |
| Listar conteúdo aprovado | GET | `/api/content` | ✅ Pass |
| Conteúdo pendente aparece para admin | GET | `/api/content/pending` | ✅ Pass |
| Aprovar conteúdo | PATCH | `/api/content/:id/approve` | ✅ Pass |
| Rejeitar conteúdo com motivo | PATCH | `/api/content/:id/reject` | ✅ Pass |
| Like em conteúdo | POST | `/api/content/:id/react` | ✅ Pass |

### 6.2.3 Quiz e Gamificação

| Teste | Método | Endpoint | Resultado |
|-------|--------|----------|-----------|
| Obter perguntas | GET | `/api/quiz` | ✅ Pass |
| Submeter pontuação | POST | `/api/quiz/score` | ✅ Pass |
| Rankings atualizados | GET | `/api/rankings` | ✅ Pass |
| Gerar quiz com IA | POST | `/api/admin/quiz/generate` | ✅ Pass |
| Criar pergunta manual | POST | `/api/admin/quiz` | ✅ Pass |
| Eliminar pergunta | DELETE | `/api/admin/quiz/:id` | ✅ Pass |

### 6.2.4 Comentários

| Teste | Método | Endpoint | Resultado |
|-------|--------|----------|-----------|
| Criar comentário | POST | `/api/comments` | ✅ Pass |
| Responder a comentário | POST | `/api/comments` (parentId) | ✅ Pass |
| Like em comentário | POST | `/api/comments/:id/react` | ✅ Pass |
| Ocultar comentário (admin) | PATCH | `/api/comments/:id/hide` | ✅ Pass |
| Análise IA de comentários | GET | `/api/admin/comments/analyze` | ✅ Pass |

### 6.2.5 Notificações

| Teste | Método | Endpoint | Resultado |
|-------|--------|----------|-----------|
| Notificações geradas por menção | GET | `/api/users/:id/notifications` | ✅ Pass |
| Marcar como lida | PATCH | `/api/notifications/:id/read` | ✅ Pass |
| Marcar todas como lidas | PATCH | `/api/users/:id/notifications/read-all` | ✅ Pass |

### 6.2.6 Utilizadores e Admin

| Teste | Método | Endpoint | Resultado |
|-------|--------|----------|-----------|
| Listar utilizadores (admin) | GET | `/api/users` | ✅ Pass |
| Bloquear utilizador | PUT | `/api/users/:id/block` | ✅ Pass |
| Desbloquear utilizador | PUT | `/api/users/:id/unblock` | ✅ Pass |
| Utilizador bloqueado não faz login | POST | `/api/auth/login` | ✅ Pass (erro 403) |
| Promover a elite | PATCH | `/api/users/:id` | ✅ Pass |
| Upload de avatar | PUT | `/api/users/:id/avatar` | ✅ Pass |

### 6.2.7 Inteligência Artificial

| Teste | Método | Endpoint | Resultado |
|-------|--------|----------|-----------|
| Chat IA retorna resposta | POST | `/api/ai/chat` | ✅ Pass |
| Chat IA com contexto da plataforma | POST | `/api/ai/chat` | ✅ Pass |
| Geração de quiz por tema | POST | `/api/admin/quiz/generate` | ✅ Pass |
| Análise de comentários | GET | `/api/admin/comments/analyze` | ✅ Pass |

## 6.3 Testes de Interface (UI)

### 6.3.1 Responsividade

| Dispositivo | Resolução | Resultado |
|-------------|-----------|-----------|
| iPhone SE | 375×667 | ✅ Pass |
| iPhone 14 | 390×844 | ✅ Pass |
| iPad | 768×1024 | ✅ Pass |
| Desktop HD | 1920×1080 | ✅ Pass |

Testes realizados com as ferramentas de responsividade do Chrome DevTools.

### 6.3.2 Navegação

| Cenário | Resultado |
|---------|-----------|
| Navegação entre páginas (mobile nav) | ✅ Pass |
| Navegação admin (sidebar/bottom nav) | ✅ Pass |
| Botão voltar no browser | ✅ Pass |
| Links diretos (deep linking) | ✅ Pass |
| Redirecionamento para login (não autenticado) | ✅ Pass |

### 6.3.3 Tema Claro/Escuro

| Cenário | Resultado |
|---------|-----------|
| Alternância de tema | ✅ Pass |
| Texto visível em ambos os temas | ✅ Pass |
| Botões com contraste adequado | ✅ Pass |
| Cards e borders visíveis | ✅ Pass |
| force-white em elementos sobre fundo escuro | ✅ Pass |

### 6.3.4 Formulários

| Cenário | Resultado |
|---------|-----------|
| Validação de email | ✅ Pass |
| Validação de password (mínimo 6 caracteres) | ✅ Pass |
| Mensagens de erro | ✅ Pass |
| Submissão com Enter | ✅ Pass |
| Estados de loading | ✅ Pass |

## 6.4 Testes de Performance

| Métrica | Resultado |
|---------|-----------|
| Tempo de carregamento inicial (LCP) | < 3s |
| Tempo de resposta API (CRUD) | < 1s |
| Tamanho do bundle de produção | ~450KB gzipped |
| Lighthouse Performance Score | > 85 |

## 6.5 Testes de Segurança

| Cenário | Resultado |
|---------|-----------|
| Passwords hasheadas com bcrypt | ✅ Pass |
| Tokens JWT com expiração | ✅ Pass |
| SQL Injection (parâmetros $1, $2...) | ✅ Pass (protegido) |
| CORS configurado | ✅ Pass |
| Rate limiting no upload | ✅ Pass |
| Utilizador bloqueado não autentica | ✅ Pass |

## 6.6 Problemas Detetados e Corrigidos

| # | Problema | Severidade | Estado |
|---|----------|------------|--------|
| 1 | Grid categorias 4 colunas em mobile (inutilizável) | Alta | ✅ Corrigido |
| 2 | Tabela quiz sem overflow-x em mobile | Alta | ✅ Corrigido |
| 3 | Modais admin com padding excessivo em mobile | Média | ✅ Corrigido |
| 4 | Texto corpo demasiado grande em mobile | Média | ✅ Corrigido |
| 5 | SMTP Outlook bloqueado na rede | Alta | ✅ Corrigido (Resend) |
| 6 | Animações framer-motion pesadas no chat IA | Média | ✅ Corrigido (CSS transitions) |
| 7 | Senhas "Bloqueado" visíveis em todos os temas | Baixa | ✅ Corrigido |
| 8 | Forum link incorreto para admin | Baixa | ✅ Corrigido |


---

# 7. DEPLOYMENT

## 7.1 Plataforma de Deploy

O projeto utiliza **Render.com** como plataforma de deployment, com integração direta ao repositório GitHub para deploy contínuo.

## 7.2 Configuração do Ambiente

### 7.2.1 Variáveis de Ambiente (.env)

| Variável | Descrição | Valor |
|----------|-----------|-------|
| `DATABASE_URL` | URL de conexão PostgreSQL (Neon) | `postgresql://neondb_owner:...` |
| `JWT_SECRET` | Segredo para assinatura JWT | `segredo_super_seguro_para_jwt_123` |
| `RESEND_API_KEY` | API key do Resend (emails) | `re_SBpn7zXh_...` |
| `GROQ_API_KEY` | API key do Groq (IA) | `gsk_RFEyDy77bTF...` |
| `TELEGRAM_BOT_TOKEN` | Token do bot Telegram (uploads) | `8944322068:AAF_...` |
| `TELEGRAM_CHAT_ID` | ID do chat Telegram | `6695102150` |

### 7.2.2 Base de Dados (Neon)

O Neon PostgreSQL é um serviço serverless que oferece:
- Connection pooling automático
- Escalabilidade sem intervenção manual
- Backup automático
- SSL obrigatório

A sincronização da base de dados é feita automaticamente no arranque do servidor via migrações `CREATE TABLE IF NOT EXISTS`.

## 7.3 Pipeline de Deploy

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Código   │───>│  Git Push │───>│  Render  │───>│  Deploy  │
│  Local    │    │  GitHub   │    │  Build   │    │  Ativo   │
└──────────┘    └──────────┘    └──────────┘    └──────────>
```

1. **Desenvolvimento local** em `localhost:5173` (Vite) e `localhost:3001` (API)
2. **Commit e push** para o repositório GitHub
3. **Render detecta** a mudança e inicia o build automático
4. **Build**: `npm install` + verificação de syntax
5. **Deploy**: Servidor inicia na porta designada pelo Render

## 7.4 Configuração Render

| Configuração | Valor |
|-------------|-------|
| Build Command | `npm install` |
| Start Command | `node server.mjs` |
| Runtime | Node.js |
| Região | Oregon (US West) |
| Auto Deploy | Ativado (a cada push) |

## 7.5 Domínio e URLs

| Serviço | URL |
|---------|-----|
| Frontend (Vite) | Servido pelo backend via `express.static` |
| Backend API | `https://economia-com-historia.onrender.com` |
| Base de Dados | Neon PostgreSQL (pooler connection) |

## 7.6 Processo de Build

O Render executa os seguintes passos automaticamente:

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor (migrações DB executadas automaticamente)
node server.mjs
```

O servidor Express.js serve tanto a API (rotas `/api/*`) como o frontend estático (build do Vite na pasta `dist/`).

## 7.7 Variáveis de Produção

As variáveis de ambiente são configuradas no painel do Render, **não** no repositório Git (ficheiro `.env` não é commitado com valores reais de produção).

## 7.8 Monitorização

| Ferramenta | Função |
|------------|--------|
| Render Dashboard | Logs de deploy e uptime |
| `/api/health` | Endpoint de verificação de saúde |
| Console logs | Registo de erros de email e IA |

## 7.9 Backup e Recuperação

- **Base de dados**: Neon realiza backups automáticos diários
- **Código fonte**: Repositório Git no GitHub
- **Ficheiros multimédia**: Armazenados no Telegram Bot API (cloud gratuito)

## 7.10 Custo de Infraestrutura

| Serviço | Plano | Custo |
|---------|-------|-------|
| Render.com | Free tier | $0/mês |
| Neon PostgreSQL | Free tier | $0/mês |
| Groq AI | Free tier | $0/mês |
| Resend | Free tier (100 emails/dia) | $0/mês |
| Telegram Bot API | Gratuito | $0/mês |
| GitHub | Free | $0/mês |
| **Total** | | **$0/mês** |

A plataforma foi concebida para operar inteiramente em serviços gratuitos, ideal para um projeto educativo com budget limitado.


---

# 8. CONCLUSÃO

## 8.1 Síntese do Trabalho

O presente trabalho teve como objetivo o desenvolvimento da plataforma web educativa "Economia com História", uma aplicação interativa para aprendizagem da história, cultura e economia de Angola. A plataforma foi concebida e implementada com sucesso, integrando as seguintes funcionalidades principais:

1. **Sistema de conteúdo educativo** com workflow de aprovação (escritor → revisor → admin)
2. **Quiz gamificado** com sistema de XP, streak e rankings
3. **Fórum de debate** com comentários, respostas aninhadas e menções
4. **Inteligência artificial** (Groq/Llama) para assistente virtual, geração de quiz e moderação
5. **Sistema de notificações** em tempo real
6. **Painel administrativo** completo com gestão de utilizadores, conteúdo e configurações
7. **Sistema de roles** com controlo de acesso (admin, escritor, revisor, elite, base)
8. **Interface responsiva** com suporte a tema claro/escuro

## 8.2 Objetivos Alcançados

| Objetivo | Estado |
|----------|--------|
| Plataforma web educativa interativa | ✅ Alcançado |
| Conteúdo multimédia (texto, vídeo, áudio) | ✅ Alcançado |
| Gamificação (XP, streak, rankings) | ✅ Alcançado |
| Fórum de debate colaborativo | ✅ Alcançado |
| Integração de IA (chat, quiz, moderação) | ✅ Alcançado |
| Notificações em tempo real | ✅ Alcançado |
| Painel administrativo | ✅ Alcançado |
| Acessibilidade mobile (responsivo) | ✅ Alcançado |
| Deploy gratuito na cloud | ✅ Alcançado |

## 8.3 Contribuições do Trabalho

### 8.3.1 Para a Comunidade Educativa

A plataforma demonstra a viabilidade de criar ferramentas educativas interativas e acessíveis para o contexto angolano, utilizando tecnologias web modernas e infraestrutura gratuita.

### 8.3.2 Para o Desenvolvimento Técnico

O projeto explora a integração de múltiplas tecnologias num ecossistema coeso:
- IA generativa (Groq/Llama) para personalização educativa
- Gamificação como mecanismo de engajamento
- Arquitetura fullstack com separação clara de responsabilidades
- Sistema de roles e workflow editorial

### 8.3.3 Para o ISPTEC

O trabalho apresenta uma aplicação prática das competências adquiridas ao longo do curso de Engenharia de Software, demonstrando capacidades de:
- Análise e especificação de requisitos
- Desenvolvimento fullstack
- Deploy e manutenção de aplicações web
- Integração de serviços de terceiros

## 8.4 Limitações

| Limitação | Impacto | Mitigação |
|-----------|---------|-----------|
| Sem testes automatizados (unitários) | Manutenção mais demorada | Testes manuais exploratórios |
| Polling em vez de WebSockets | Uso de banda ligeiramente superior | Intervalos otimizados (15s-60s) |
| Upload via Telegram Bot API | Dependência de serviço externo | Alternativa viável: Cloudinary/S3 |
| Render Free tier (spin-down inatividade) | Primeira requisição após idle demora ~30s | Aceitável para contexto educativo |
| Conteúdo seed limitado | Plataforma precisa de conteúdo manual | Workflow de escritores resolve isto |

## 8.5 Trabalho Futuro

### 8.5.1 Curto Prazo
- **WebSockets** para notificações em tempo real (substituir polling)
- **Testes automatizados** (Jest + React Testing Library)
- **PWA** (Progressive Web App) para instalação em dispositivos
- **Modo offline** para conteúdo textual

### 8.5.2 Médio Prazo
- **App nativa** (React Native) para iOS e Android
- **Sistema de eventos** ao vivo (debates programados)
- **Certificados digitais** por conclusão de módulos
- **Integração com plataformas LMS** (Moodle, Canvas)

### 8.5.3 Longo Prazo
- **Áudio/texto em Português e Kimbundu** (multilingue)
- **Realidade aumentada** para locais históricos
- **Marketplace de conteúdo** educativo
- **Analytics avançados** de aprendizagem

## 8.6 Reflexão Pessoal

O desenvolvimento desta plataforma representou um desafio técnico significativo, exigindo a integração de múltiplas tecnologias (React, Express, PostgreSQL, IA, Telegram API) num sistema coeso e funcional. O processo de desenvolvimento iterativo permitiu refinar constantemente a experiência do utilizador, desde a responsividade mobile até à integração de inteligência artificial.

A escolha de manter a plataforma em serviços gratuitos (Render, Neon, Groq, Resend) demonstrou que é possível criar soluções educativas de qualidade sem infraestrutura dispendiosa, um aspeto particularmente relevante para o contexto angolano.


---

# 9. REFERÊNCIAS

## 9.1 Documentação Técnica

1. React. (2024). *React Documentation*. Meta. https://react.dev

2. Express.js. (2024). *Express.js Web Framework*. https://expressjs.com

3. PostgreSQL. (2024). *PostgreSQL Documentation*. The PostgreSQL Global Development Group. https://www.postgresql.org/docs/

4. Neon. (2024). *Neon Serverless PostgreSQL*. https://neon.tech/docs

5. Tailwind CSS. (2024). *Tailwind CSS Documentation*. Tailwind Labs. https://tailwindcss.com/docs

6. Vite. (2024). *Vite Documentation*. https://vitejs.dev/guide/

7. TypeScript. (2024). *TypeScript Documentation*. Microsoft. https://www.typescriptlang.org/docs/

## 9.2 APIs e Serviços

8. Groq. (2024). *Groq API Documentation*. https://console.groq.com/docs/api-reference

9. Resend. (2024). *Resend Email API Documentation*. https://resend.com/docs/introduction

10. Telegram. (2024). *Telegram Bot API Documentation*. https://core.telegram.org/bots/api

11. Render. (2024). *Render Documentation*. https://render.com/docs

## 9.3 Bibliotecas e Ferramentas

12. React Router. (2024). *React Router v7 Documentation*. https://reactrouter.com

13. Framer Motion. (2024). *Motion for React*. https://www.framer.com/motion/

14. shadcn/ui. (2024). *shadcn/ui Documentation*. https://ui.shadcn.com

15. Lucide React. (2024). *Lucide Icons*. https://lucide.dev

16. Recharts. (2024). *Recharts Documentation*. https://recharts.org

17. Axios. (2024). *Axios HTTP Client*. https://axios-http.com

18. bcrypt.js. (2024). *bcrypt.js Documentation*. https://github.com/nicolo-ribaudo/bcrypt.js

19. jsonwebtoken. (2024). *JSON Web Token Library*. https://github.com/auth0/node-jsonwebtoken

20. Multer. (2024). *Multer Middleware for Express*. https://github.com/expressjs/multer

21. Nodemailer. (2024). *Nodemailer Documentation*. https://nodemailer.com

22. dotenv. (2024). *dotenv Documentation*. https://github.com/motdotla/dotenv

## 9.4 Artigos e Publicações

23. MDN Web Docs. (2024). *Mozilla Developer Network*. https://developer.mozilla.org

24. Can I Use. (2024). *Browser Compatibility Tables*. https://caniuse.com

25. Web.dev. (2024). *Google Web Development*. https://web.dev

## 9.5 Recursos Educativos

26. Khan Academy. (2024). *Khan Academy Platform*. https://www.khanacademy.org

27. Coursera. (2024). *Coursera Online Learning*. https://www.coursera.org

28. Duolingo. (2024). *Duolingo Language Platform*. https://www.duolingo.com

## 9.6 Padrões e Normas

29. World Wide Web Consortium (W3C). (2024). *Web Accessibility Initiative (WAI)*. https://www.w3.org/WAI/

30. OpenJS Foundation. (2024). *Node.js Best Practices*. https://github.com/goldbergyoni/nodebestpractices


---

# 10. ANEXOS

## Anexo A: API Endpoints (Referência Rápida)

### Autenticação
```
POST /api/auth/register      - Registar utilizador
POST /api/auth/login          - Iniciar sessão
POST /api/auth/forgot-password - Pedir recuperação de senha
POST /api/auth/change-password - Alterar senha
```

### Utilizadores
```
GET    /api/users              - Listar utilizadores (admin)
GET    /api/users/:id          - Obter utilizador
DELETE /api/users/:id          - Eliminar utilizador
PATCH  /api/users/:id          - Atualizar utilizador
PUT    /api/users/:id/avatar   - Atualizar avatar
GET    /api/users/:id/stats    - Estatísticas
PUT    /api/users/:id/streak   - Atualizar streak
PUT    /api/users/:id/profile  - Atualizar perfil
PUT    /api/users/:id/block    - Bloquear utilizador
PUT    /api/users/:id/unblock  - Desbloquear utilizador
GET    /api/users/search       - Pesquisar utilizadores
```

### Conteúdo
```
GET    /api/content            - Listar conteúdo aprovado
GET    /api/content/all        - Listar todo o conteúdo (admin)
GET    /api/content/pending    - Conteúdo pendente
GET    /api/content/my         - Meu conteúdo
GET    /api/content/:id        - Obter conteúdo
POST   /api/content            - Criar conteúdo
PUT    /api/content/:id        - Editar conteúdo
DELETE /api/content/:id        - Eliminar conteúdo
PATCH  /api/content/:id/approve  - Aprovar
PATCH  /api/content/:id/reject   - Rejeitar
PATCH  /api/content/:id/feature  - Destacar
PATCH  /api/content/:id/recommend - Recomendar
POST   /api/content/:id/react    - Like/Dislike
```

### Comentários
```
GET    /api/comments/:contentId   - Listar comentários
POST   /api/comments              - Criar comentário
PATCH  /api/comments/:id/edit     - Editar
PATCH  /api/comments/:id/delete   - Eliminar
PATCH  /api/comments/:id/hide     - Ocultar (admin)
POST   /api/comments/:id/react    - Like/Dislike
```

### Quiz
```
GET    /api/quiz                - Obter perguntas
POST   /api/quiz/score          - Submeter pontuação
POST   /api/admin/quiz          - Criar pergunta
PUT    /api/admin/quiz/:id      - Editar pergunta
DELETE /api/admin/quiz/:id      - Eliminar pergunta
POST   /api/admin/quiz/generate - Gerar com IA
```

### Categorias
```
GET    /api/categories          - Listar categorias ativas
GET    /api/categories/all      - Todas (admin)
POST   /api/categories          - Criar
PUT    /api/categories/:id      - Editar
DELETE /api/categories/:id      - Eliminar
PATCH  /api/categories/:id/toggle-hidden - Mostrar/Ocultar
```

### Elite Requests
```
POST   /api/elite-requests         - Solicitar elite
GET    /api/elite-requests         - Listar pedidos (admin)
GET    /api/elite-requests/user/:id - Meu pedido
PATCH  /api/elite-requests/:id     - Aprovar/Rejeitar
DELETE /api/elite-requests/user/:id - Cancelar pedido
```

### Trivia
```
GET    /api/trivia/active      - trivia ativa
GET    /api/trivia             - Todas (admin)
POST   /api/trivia             - Criar
PUT    /api/trivia/:id         - Editar
PUT    /api/trivia/:id/activate   - Ativar
PUT    /api/trivia/:id/deactivate - Desativar
DELETE /api/trivia/:id         - Eliminar
```

### IA (Groq)
```
POST /api/ai/chat              - Chat assistente
GET  /api/admin/comments/analyze - Analisar comentários
```

### Upload/Mídia
```
POST /api/upload               - Upload de ficheiro
GET  /api/media/:fileId        - Obter ficheiro
```

### Password Reset (Admin)
```
GET  /api/admin/password-resets     - Listar pedidos
POST /api/admin/password-resets/:id/reset - Processar reset
```

### Sistema
```
GET  /api/stats                - Estatísticas gerais
GET  /api/health               - Health check
GET  /api/rankings             - Rankings de utilizadores
```

---

## Anexo B: Modelo de Dados SQL

```sql
-- Tabela User (criada pelo Prisma, colunas adicionadas via ALTER TABLE)
CREATE TABLE IF NOT EXISTS "User" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'base',
  xp INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  "lastActiveDate" TIMESTAMP,
  "mustChangePassword" BOOLEAN DEFAULT FALSE,
  avatar TEXT,
  profession VARCHAR(255),
  blocked BOOLEAN DEFAULT FALSE,
  "blockReason" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Tabela Content
CREATE TABLE IF NOT EXISTS "Content" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  "fullText" TEXT,
  thumbnail TEXT,
  "mediaUrl" TEXT,
  "authorId" UUID REFERENCES "User"(id),
  author VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  featured BOOLEAN DEFAULT FALSE,
  recommended BOOLEAN DEFAULT FALSE,
  "rejectReason" TEXT,
  likes TEXT[] DEFAULT '{}',
  dislikes TEXT[] DEFAULT '{}',
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Tabela QuizQuestion
CREATE TABLE IF NOT EXISTS "QuizQuestion" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  "correctAnswer" INTEGER NOT NULL,
  feedback TEXT,
  points INTEGER DEFAULT 10,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Tabela Comment
CREATE TABLE IF NOT EXISTS "Comment" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "contentId" UUID REFERENCES "Content"(id),
  "userId" UUID REFERENCES "User"(id),
  author VARCHAR(255),
  text TEXT NOT NULL,
  "parentId" UUID REFERENCES "Comment"(id),
  likes TEXT[] DEFAULT '{}',
  dislikes TEXT[] DEFAULT '{}',
  hidden BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Tabela Notification
CREATE TABLE IF NOT EXISTS "Notification" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID REFERENCES "User"(id),
  "actorName" VARCHAR(255),
  "actorAvatar" TEXT,
  type VARCHAR(50) NOT NULL,
  "contentId" UUID,
  "contentTitle" VARCHAR(500),
  text TEXT,
  "isRead" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Tabela Category
CREATE TABLE IF NOT EXISTS "Category" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(100),
  color VARCHAR(50),
  hidden BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Tabela EliteRequest
CREATE TABLE IF NOT EXISTS "EliteRequest" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID REFERENCES "User"(id),
  status VARCHAR(50) DEFAULT 'pending',
  reason TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Tabela SavedContent
CREATE TABLE IF NOT EXISTS "SavedContent" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID REFERENCES "User"(id),
  "contentId" UUID REFERENCES "Content"(id),
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Tabela CompletedStudy
CREATE TABLE IF NOT EXISTS "CompletedStudy" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID REFERENCES "User"(id),
  "contentId" UUID REFERENCES "Content"(id),
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Tabela Trivia
CREATE TABLE IF NOT EXISTS "Trivia" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  fact TEXT NOT NULL,
  "imageUrl" TEXT,
  "isActive" BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Tabela PasswordReset
CREATE TABLE IF NOT EXISTS "PasswordReset" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID REFERENCES "User"(id),
  status VARCHAR(50) DEFAULT 'pending',
  "newPassword" TEXT,
  "requestedAt" TIMESTAMP DEFAULT NOW(),
  "resetAt" TIMESTAMP,
  "sentAt" TIMESTAMP
);
```

---

## Anexo C: Credenciais de Teste

| Utilizador | Email | Password | Role |
|------------|-------|----------|------|
| Admin | admin@isptec.co.ao | 1234567890 | admin |

---

## Anexo D: Stack Tecnológica

```
Frontend:  React 18.3.1 + TypeScript + Tailwind CSS 4.1 + Vite 6.3
Backend:   Node.js + Express 5.2.1
Database:  PostgreSQL (Neon Cloud)
IA:        Groq API (Llama 3.3 70B)
Email:     Resend API
Upload:    Telegram Bot API
Deploy:    Render.com (Free Tier)
VCS:       Git + GitHub
```


---

