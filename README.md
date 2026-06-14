# Project Setup

## Stack

- Node.js + NestJS
- Zod para validacao de config
- Jest para testes

## Requisitos

- Node.js LTS

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
