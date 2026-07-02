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
