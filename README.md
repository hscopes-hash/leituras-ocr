# Sistema de Gestão de Leituras OCR

Sistema mobile para captura e processamento de leituras de máquinas via OCR com IA Vision.

## 🔗 Demo

Deploy na Vercel: [Configure seu deploy]

## 📱 Funcionalidades

- 🔐 **Autenticação** - Login com níveis de acesso (Admin/Operador)
- 📷 **OCR com IA** - Captura de foto e extração de valores
- 📊 **Tarja Vermelha** - Exibe DATA/HORA, TEMPO IA, ENTRADAS e SAÍDAS
- 📱 **WhatsApp** - Compartilhamento de leituras
- 📋 **Cadastros** - Tipos de Máquina, Máquinas, Locais, Usuários
- 📜 **Histórico** - Registro de todas as leituras

## 🛠️ Tecnologias

- Next.js 16 + TypeScript
- Prisma ORM + PostgreSQL
- Tailwind CSS + shadcn/ui
- z-ai-web-dev-sdk (IA Vision)

## 🚀 Deploy na Vercel

### 1. Criar Banco PostgreSQL (Supabase)

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Crie um novo projeto
3. Vá em **Settings** → **Database**
4. Copie as connection strings:
   - **URI** (pooler): `postgresql://postgres.[PROJETO]:[SENHA]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
   - **Direct URI**: `postgresql://postgres.[PROJETO]:[SENHA]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres`

### 2. Deploy na Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Importe este repositório do GitHub
3. Adicione as variáveis de ambiente:
   - `DATABASE_URL` = Connection string com pgbouncer
   - `DIRECT_DATABASE_URL` = Connection string direta
4. Clique em **Deploy**

### 3. Criar Tabelas e Dados Iniciais

Após o deploy, execute no terminal local:

```bash
# Configure o .env com suas credenciais do Supabase
DATABASE_URL="sua_connection_string"
DIRECT_DATABASE_URL="sua_direct_connection_string"

# Crie as tabelas
npx prisma db push

# Crie o usuário admin
npx prisma db seed
```

Ou use o Prisma Studio:

```bash
npx prisma studio
```

## 🔑 Credenciais Padrão

- **Usuário:** admin
- **Senha:** admin123

## 📁 Estrutura do Projeto

```
├── prisma/
│   ├── schema.prisma    # Schema do banco
│   └── seed.ts          # Dados iniciais
├── src/
│   ├── app/
│   │   ├── api/         # APIs REST
│   │   ├── cadastros/   # Páginas de cadastro
│   │   ├── dashboard/   # Menu principal
│   │   └── leitura/     # OCR Reader
│   ├── components/      # Componentes React
│   └── lib/             # Utilitários
└── package.json
```

## 📋 Scripts

```bash
npm run dev        # Desenvolvimento
npm run build      # Build para produção
npm run db:push    # Criar tabelas
npm run db:seed    # Dados iniciais
```

## 📄 Licença

MIT
