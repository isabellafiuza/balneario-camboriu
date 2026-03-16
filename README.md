# MVP Imobiliário - Next.js, Prisma & Railway

Este é um projeto MVP (Minimum Viable Product) de um site imobiliário completo, construído com Next.js, TailwindCSS, Prisma ORM e PostgreSQL. O sistema possui uma área pública para visualização de imóveis e uma área administrativa para a corretora gerenciar os anúncios. O projeto é 100% exportável e foi projetado para ser facilmente implantado na plataforma [Railway](https://railway.app).

## 🚀 Visão Geral

O objetivo deste projeto é fornecer uma solução rápida e funcional para corretores de imóveis que desejam ter uma presença online profissional, com total controle sobre seus dados e sem dependência de plataformas de terceiros.

### ✨ Funcionalidades

| Área Pública | Área Administrativa |
| :--- | :--- |
| ✅ Página inicial com destaques | ✅ Login seguro para a corretora |
| ✅ Listagem de imóveis com filtros | ✅ Dashboard com estatísticas |
| ✅ Página de detalhes do imóvel | ✅ CRUD completo de imóveis |
| ✅ Filtros por tipo, bairro, preço, etc. | ✅ Upload de múltiplas imagens |
| ✅ Botão de contato via WhatsApp | ✅ Alteração de status (Disponível, Vendido, etc.) |
| ✅ SEO otimizado para imóveis | ✅ Sincronização com base de dados do Notion |
| ✅ Design responsivo | ✅ Gerenciamento de comodidades |

### 🛠️ Stack de Tecnologia

*   **Framework:** [Next.js](https://nextjs.org/) (com App Router)
*   **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
*   **Estilização:** [TailwindCSS](https://tailwindcss.com/)
*   **Banco de Dados:** [PostgreSQL](https://www.postgresql.org/)
*   **ORM:** [Prisma](https://www.prisma.io/)
*   **Autenticação:** [NextAuth.js](https://next-auth.js.org/)
*   **Ícones:** [Lucide React](https://lucide.dev/)
*   **Deploy:** [Railway](https://railway.app)

---

## 🏁 Começando

Siga estas instruções para configurar e executar o projeto em seu ambiente local.

### 📋 Pré-requisitos

*   [Node.js](https://nodejs.org/en/) (versão 18 ou superior)
*   [pnpm](https://pnpm.io/installation) (ou npm/yarn)
*   [Docker](https://www.docker.com/get-started) (para rodar o banco de dados PostgreSQL localmente)

### ⚙️ Instalação

1.  **Clone o repositório:**

    ```bash
    git clone <URL_DO_SEU_REPOSITORIO>
    cd imoveis-mvp
    ```

2.  **Instale as dependências:**

    ```bash
    pnpm install
    ```

### 🔑 Configuração do Ambiente

1.  **Crie o arquivo de variáveis de ambiente:**

    Copie o arquivo `.env.example` para um novo arquivo chamado `.env.local`.

    ```bash
    cp .env.example .env.local
    ```

2.  **Preencha as variáveis em `.env.local`:**

    *   `DATABASE_URL`: A URL de conexão com seu banco de dados PostgreSQL. O valor padrão é para o ambiente Docker local.
    *   `NEXTAUTH_SECRET`: Uma chave secreta para o NextAuth.js. Gere uma com o comando:
        ```bash
        openssl rand -base64 32
        ```
    *   `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`: Credenciais para o usuário administrador que será criado no seed do banco.
    *   `NOTION_API_KEY`, `NOTION_DATABASE_ID`: (Opcional) Credenciais para a integração com o Notion.

### 🐘 Rodando o Banco de Dados com Docker

Se você não tiver um servidor PostgreSQL, pode iniciar um facilmente com Docker.

1.  **Inicie o container do PostgreSQL:**

    ```bash
    docker run --name imoveis-db -e POSTGRES_PASSWORD=password -e POSTGRES_USER=postgres -e POSTGRES_DB=imoveis_mvp -p 5432:5432 -d postgres
    ```

    Isso iniciará um banco de dados PostgreSQL na porta `5432` com as credenciais definidas no comando, que correspondem ao `DATABASE_URL` padrão.

### 🚀 Rodando o Projeto

1.  **Aplique as migrações do Prisma:**

    Este comando criará as tabelas no seu banco de dados com base no `schema.prisma`.

    ```bash
    pnpm prisma migrate deploy
    ```

2.  **Popule o banco com dados iniciais (seeding):**

    Este comando criará o usuário administrador e alguns imóveis de exemplo.

    ```bash
    pnpm db:seed
    ```

3.  **Inicie o servidor de desenvolvimento:**

    ```bash
    pnpm dev
    ```

Agora você pode acessar:
*   **Site Público:** [http://localhost:3000](http://localhost:3000)
*   **Painel Admin:** [http://localhost:3000/login](http://localhost:3000/login)
    *   **Email:** `corretora@exemplo.com` (ou o que você definiu em `.env.local`)
    *   **Senha:** `senha-segura-aqui` (ou o que você definiu em `.env.local`)

---

## ☁️ Deploy no Railway

O Railway simplifica o processo de deploy. Siga estes passos para colocar seu site no ar.

### 1. Crie um Projeto no Railway

*   Vá para o seu [Dashboard do Railway](https://railway.app/dashboard).
*   Clique em **New Project**.
*   Selecione **Deploy from GitHub repo** e escolha o repositório do seu projeto.

### 2. Adicione o Banco de Dados PostgreSQL

*   Dentro do seu projeto no Railway, clique em **New**.
*   Selecione **Database** → **Add PostgreSQL**.
*   Um novo serviço de banco de dados será criado.

### 3. Configure as Variáveis de Ambiente

*   Vá para o serviço da sua aplicação Next.js (não o do banco de dados).
*   Clique na aba **Variables**.
*   O Railway injetará automaticamente a variável `DATABASE_URL` conectada ao seu banco de dados PostgreSQL. Você não precisa alterá-la.
*   Adicione as outras variáveis de ambiente que você configurou em seu arquivo `.env.local`:
    *   `NEXTAUTH_SECRET`
    *   `NEXTAUTH_URL` (a URL pública do seu deploy no Railway, ex: `https://imoveis-mvp.up.railway.app`)
    *   `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`
    *   `NEXT_PUBLIC_WHATSAPP_NUMBER`
    *   `NEXT_PUBLIC_SITE_URL` (a mesma URL do `NEXTAUTH_URL`)
    *   (Opcional) `NOTION_API_KEY`, `NOTION_DATABASE_ID`

### 4. Configure o Comando de Build

*   Vá para a aba **Settings** da sua aplicação Next.js.
*   Na seção **Build**, certifique-se de que o **Build Command** está configurado como:

    ```bash
    pnpm install && pnpm build
    ```

    O Railway geralmente detecta isso automaticamente.

### 5. Deploy

O Railway iniciará o deploy automaticamente após a configuração. Você pode acompanhar o progresso na aba **Deployments**. Após o primeiro deploy, o Railway fará o deploy de novas versões a cada `git push` para o seu repositório.

### 6. Seed do Banco de Dados em Produção

Após o primeiro deploy, o banco de dados estará vazio. Para populá-lo:

*   Conecte-se ao shell da sua aplicação no Railway.
*   Execute o comando de seed:

    ```bash
    pnpm db:seed
    ```

Isso criará o usuário administrador em seu ambiente de produção.

---

## 📂 Estrutura do Projeto

```
/imoveis-mvp
├── app/                      # App Router (páginas e layouts)
│   ├── (public)/             # Grupo de rotas para páginas públicas
│   ├── admin/                # Grupo de rotas para o painel administrativo
│   ├── api/                  # API Routes (backend)
│   ├── globals.css           # Estilos globais
│   └── layout.tsx            # Layout raiz
├── components/               # Componentes React
│   ├── admin/                # Componentes específicos do painel admin
│   ├── public/               # Componentes específicos do site público
│   └── ui/                   # Componentes de UI genéricos (se necessário)
├── lib/                      # Funções utilitárias, config, etc.
│   ├── auth.ts               # Configuração do NextAuth.js
│   ├── prisma.ts             # Instância singleton do Prisma Client
│   ├── utils.ts              # Funções utilitárias (formatação, etc.)
│   └── validations.ts        # Schemas de validação com Zod
├── prisma/                   # Configuração do Prisma ORM
│   ├── schema.prisma         # Schema do banco de dados
│   ├── migrations/           # Migrações do banco de dados
│   └── seed.ts               # Script para popular o banco
├── public/                   # Arquivos estáticos
│   └── uploads/              # Diretório para imagens de imóveis
├── scripts/                  # Scripts CLI
│   └── notion-sync.ts        # Script para sincronização com Notion
├── .env.example              # Exemplo de variáveis de ambiente
├── next.config.js            # Configuração do Next.js
└── package.json              # Dependências e scripts do projeto
```
