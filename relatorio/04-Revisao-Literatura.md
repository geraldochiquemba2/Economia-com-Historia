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
