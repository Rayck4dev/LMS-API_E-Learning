# 🎓 LMS API — Plataforma de Gestão de Aprendizado

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black" alt="Swagger" />
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="Licença MIT" />
</p>

**Idiomas:** [English](./README.md) | Português (Brasil)

---

## Sobre o projeto

API RESTful escalável para gerenciamento de cursos, alunos e matrículas, desenvolvida com **NestJS**. O projeto utiliza arquitetura em camadas e persistência poliglota: **PostgreSQL** para dados relacionais de usuários, **MongoDB** para cursos e matrículas e **Redis** como backend de cache configurado.

## Documentação

| Tema | English | Português (Brasil) |
| --- | --- | --- |
| Arquitetura e padrões de projeto | [Architecture](./docs/ARQUITETURA.en.md) | [Arquitetura](./docs/ARQUITETURA.md) |
| Modelo de dados e diagramas | [Diagrams](./docs/DIAGRAMAS.en.md) | [Diagramas](./docs/DIAGRAMAS.md) |
| Acesso à API e segurança | [API and Security](./docs/API_E_SEGURANCA.en.md) | [API e Segurança](./docs/API_E_SEGURANCA.md) |
| Relatório de otimização arquitetural | [Report](./docs/ARCHITECTURE_OPTIMIZATION.md) | [Relatório](./docs/DOCUMENTACAO_ARQUITETURA.md) |
| Checklist de requisitos do projeto | [Checklist](./docs/CHECKLIST.en.md) | [Checklist](./docs/CHECKLIST.md) |

## Requisitos

- Node.js e npm
- Docker e Docker Compose para os serviços locais
- PostgreSQL, MongoDB e Redis (disponibilizados pelo Docker Compose)

## Configuração

1. Crie um arquivo `.env` na raiz do projeto usando `.env.example` como referência. Defina as credenciais e URLs dos bancos, `JWT_SECRET` e as configurações do storage Supabase:

```env
POSTGRES_USER=seu-usuario
POSTGRES_PASSWORD=sua-senha
POSTGRES_DB=seu-banco

MONGO_INITDB_ROOT_USERNAME=seu-usuario
MONGO_INITDB_ROOT_PASSWORD=sua-senha

DATABASE_URL="postgresql://seu-usuario:sua-senha@localhost:5432/seu-banco?schema=public"
MONGO_URI="mongodb://seu-usuario:sua-senha@localhost:27017/seu-banco?authSource=admin"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="sua-chave-secreta"

SUPABASE_URL=sua-url
SUPABASE_SERVICE_ROLE_KEY=sua-chave-de-service-role
SUPABASE_STORAGE_BUCKET=seu-bucket
```

`MONGO_URI` é obrigatória, pois a API conecta ao MongoDB ao iniciar. Em produção, configure as variáveis necessárias no ambiente de hospedagem; nunca envie `.env` ao repositório.

2. Inicie os serviços de banco de dados:

```bash
docker compose up -d
```

3. Instale as dependências, aplique as migrations do Prisma e inicie a API:

```bash
npm install
npx prisma migrate dev
npm run start:dev
```

A documentação interativa OpenAPI fica disponível em <http://localhost:3333/api/docs>.

## Testes

```bash
npm run test       # Testes unitários
npm run test:e2e   # Testes end-to-end
npm run test:cov   # Relatório de cobertura
```

## Licença

Este projeto está sob a [Licença MIT](./LICENSE).
