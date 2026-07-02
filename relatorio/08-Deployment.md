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
