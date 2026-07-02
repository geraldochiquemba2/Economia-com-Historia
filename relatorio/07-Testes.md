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
