# Guia de Deploy - NexusOS 🚀

Este guia detalha como preparar e realizar o deploy do NexusOS em produção.

## 1. Variáveis de Ambiente

Renomeie os arquivos `.env.example` para `.env` em cada aplicação e configure os valores:

### Backend (apps/api)
- `DATABASE_URL`: URL de conexão com o banco. Se for usar PostgreSQL em produção, altere o provider no `schema.prisma`.
- `JWT_SECRET`: Uma chave aleatória e segura para assinar os tokens.

### Frontend (apps/web)
- `NEXT_PUBLIC_API_URL`: A URL pública onde o seu backend estará rodando.

## 2. Banco de Dados

Se você for usar um banco diferente do SQLite (recomendado para produção):
1. No `apps/api/prisma/schema.prisma`, mude o provider: `provider = "postgresql"`
2. Execute `npx prisma generate`
3. No deploy, execute `npx prisma migrate deploy` para criar as tabelas.

## 3. Deploy Sugerido

### Railway / Render / Fly.io (Backend)
- Conecte o repositório.
- Aponte para a pasta `apps/api`.
- Adicione as variáveis de ambiente.
- Build Command: `npm install && npm run build`
- Start Command: `npm run start:prod` (ou `node dist/main`)

### Vercel / Netlify (Frontend)
- Conecte o repositório.
- Aponte para a pasta `apps/web`.
- Adicione a variável `NEXT_PUBLIC_API_URL`.
- O Vercel detectará automaticamente o Next.js e fará o build.

## 4. Build de Produção Local
Se quiser testar o build localmente antes de subir:
```bash
# No backend
cd apps/api
npm run build
npm run start:prod

# No frontend
cd apps/web
npm run build
npm run start
```
