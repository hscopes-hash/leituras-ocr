# Instruções de Deploy Gratuito

## 1. Criar Banco PostgreSQL Gratuito (Supabase)

1. Acesse: https://supabase.com
2. Crie uma conta gratuita
3. Crie um novo projeto
4. Vá em Settings > Database
5. Copie a "Connection string" (URI)

## 2. Configurar Variáveis de Ambiente

Na Vercel, adicione:
- DATABASE_URL = "postgresql://postgres:[SUA_SENHA]@db.[PROJETO].supabase.co:5432/postgres"

## 3. Deploy na Vercel

1. Acesse: https://vercel.com
2. Importe do GitHub
3. Adicione a variável DATABASE_URL
4. Deploy!

## 4. Executar Migrações

Após o deploy, execute:
```bash
npx prisma db push
npx prisma db seed
```

---

## Credenciais Padrão
- Usuário: admin
- Senha: admin123

## Links Úteis
- Vercel: https://vercel.com
- Supabase: https://supabase.com
- Railway: https://railway.app (alternativa com DB incluso)
