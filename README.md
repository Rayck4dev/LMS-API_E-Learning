# 🎓 LMS API — Learning Management Platform

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
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="MIT License" />
</p>

**Languages:** English | [Português (Brasil)](./README.pt-BR.md)

---

## About

A scalable REST API for managing courses, students, and enrollments, built with **NestJS**. The project uses a layered architecture and polyglot persistence: **PostgreSQL** for relational user data, **MongoDB** for courses and enrollments, and **Redis** as the configured cache backend.

## Documentation

| Topic | English | Português (Brasil) |
| --- | --- | --- |
| Architecture and design patterns | [Architecture](./docs/ARQUITETURA.en.md) | [Arquitetura](./docs/ARQUITETURA.md) |
| Data model and diagrams | [Diagrams](./docs/DIAGRAMAS.en.md) | [Diagramas](./docs/DIAGRAMAS.md) |
| API access and security | [API and Security](./docs/API_E_SEGURANCA.en.md) | [API e Segurança](./docs/API_E_SEGURANCA.md) |
| Architecture optimization report | [Report](./docs/ARCHITECTURE_OPTIMIZATION.md) | [Relatório](./docs/DOCUMENTACAO_ARQUITETURA.md) |
| Project requirements checklist | [Checklist](./docs/CHECKLIST.en.md) | [Checklist](./docs/CHECKLIST.md) |

## Requirements

- Node.js and npm
- Docker and Docker Compose for the local services
- PostgreSQL, MongoDB, and Redis (provided by Docker Compose)

## Setup

1. Create a `.env` file in the project root using `.env.example` as a reference. Set the database credentials and connection strings, `JWT_SECRET`, and Supabase storage settings:

```env
POSTGRES_USER=your-user
POSTGRES_PASSWORD=your-password
POSTGRES_DB=your-database

MONGO_INITDB_ROOT_USERNAME=your-user
MONGO_INITDB_ROOT_PASSWORD=your-password

DATABASE_URL="postgresql://your-user:your-password@localhost:5432/your-database?schema=public"
MONGO_URI="mongodb://your-user:your-password@localhost:27017/your-database?authSource=admin"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-secret-key"

SUPABASE_URL=your-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_STORAGE_BUCKET=your-bucket
```

`MONGO_URI` is required because the API connects to MongoDB at startup. Configure the required variables in your hosting environment for production; never commit `.env`.

2. Start the database services:

```bash
docker compose up -d
```

3. Install dependencies, apply Prisma migrations, and start the API:

```bash
npm install
npx prisma migrate dev
npm run start:dev
```

The interactive OpenAPI documentation is available at <http://localhost:3333/api/docs>.

## Tests

```bash
npm run test       # Unit tests
npm run test:e2e   # End-to-end tests
npm run test:cov   # Coverage report
```

## License

This project is licensed under the [MIT License](./LICENSE).
