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
