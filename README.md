# Project Setup

## Stack

- Node.js + NestJS
- Prisma + Postgres
- Zod para validacao de config
- Jest para testes

## Requisitos

- Node.js LTS
- Postgres local ou remoto

## Setup rapido

```bash
npm install
```

Crie um `.env` a partir do exemplo:

```bash
cp .env.example .env
```

## Variaveis de ambiente

- `NODE_ENV`: development | test | production
- `PORT`: porta da aplicacao
- `CORS_ORIGINS`: lista separada por virgula (ex: http://localhost:3000)
- `DATABASE_URL`: string de conexao do Postgres
- `DATABASE_SCHEMA`: schema do banco

## Banco de dados

```bash
# gera o client
npm run db:generate

# aplica migrations e regenera o client
npm run db:migrate

# seed (opcional)
npm run db:seed
```

## Rodar a aplicacao

```bash
# desenvolvimento
npm run start

# modo watch
npm run dev
```

## Testes

```bash
npm test
```

## Qualidade e padronizacao

```bash
# lint + format
npm run lint
npm run format

# pre-commit e pre-push
npx lint-staged
npm run knip
```

## Licenca

Uso restrito. Consulte o arquivo LICENSE.
