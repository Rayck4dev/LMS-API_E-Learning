<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<h1 align="center">🎓 LMS API - Plataforma de Gestão de Aprendizado</h1>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black" alt="Swagger" />
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="License MIT" />
</p>

---

## 📖 Sobre o Projeto

API RESTful escalável para gerenciamento de cursos, alunos e matrículas desenvolvida com **NestJS**. O projeto implementa uma **Arquitetura em Camadas** combinada com **Persistência Poliglota** (_Polyglot Persistence_), utilizando **PostgreSQL** para dados transacionais, **MongoDB** para dados dinâmicos e **Redis** para cache e controle de idempotência.

---

## 📚 Documentação e Relatório Arquitetural

Para acessar a análise detalhada da arquitetura atual, proposta de evolução e justificativa das táticas operacionais:

- 🇧🇷 [Relatório de Otimização da Arquitetura (Português)](./docs/DOCUMENTACAO_ARQUITETURA.md)
- 🇺🇸 [Architecture Optimization Report (English)](./docs/ARCHITECTURE_OPTIMIZATION.md)

## 📌 Guias e Documentação Modular

Para facilitar a navegação, a documentação técnica foi dividida em módulos menores na pasta `docs/`:

- 📂 [Guia de Arquitetura e Padrões de Projeto](./docs/ARQUITETURA.md) — Detalhes sobre Singleton, Strategy, Observer e persistência poliglota.
- 📂 [Modelagem e Diagramas (C4 & UML)](./docs/DIAGRAMAS.md) — Diagramas de Classes, DER e C4 Model (Contexto, Contêineres e Componentes).
- 📂 [Guia de Endpoints e Segurança](./docs/API_E_SEGURANCA.md) — RBAC, RFC 7807, Idempotência e Correlation-ID.

---

## 🛠️ Infraestrutura e Execução

### 1. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com base no `.env.example`:

```env
# PostgreSQL Configs
POSTGRES_USER=seu-usuario
POSTGRES_PASSWORD=sua-senha
POSTGRES_DB=seu-banco

# MongoDB Configs
MONGO_INITDB_ROOT_USERNAME=seu-usuario
MONGO_INITDB_ROOT_PASSWORD=sua-senha

DATABASE_URL="postgresql://seu-usuario:sua-senha@seu-host:5432/seu-banco?schema=public"
MONGO_URI="mongodb://seu-usuario:sua-senha@seu-host:27017/seu-banco?authSource=admin"
REDIS_URL="redis://localhost:6379"

JWT_SECRET="sua-chave-secreta"

# Supabase Storage
SUPABASE_URL=sua-url
SUPABASE_SERVICE_ROLE_KEY=sua-chave
SUPABASE_STORAGE_BUCKET=seu-bucket

```

### 2. Subir Infraestrutura (Docker Compose)

Suba a API e os bancos de dados (PostgreSQL + MongoDB + Redis) com um único comando:

```bash
docker compose up -d

```

### 3. Executar a Aplicação Localmente

```bash
# Instalar dependências
npm install

# Rodar migrations do Prisma
npx prisma migrate dev

# Modo de desenvolvimento
npm run start:dev

```

### 4. Documentação Swagger (OpenAPI)

Após iniciar a aplicação, acesse o contrato interativo da API no navegador:

- 🔗 `http://localhost:3333/api/docs`

---

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes End-to-End (E2E)
npm run test:e2e

# Cobertura de testes
npm run test:cov

```

---

## 📝 Licença

Este projeto está sob a licença [MIT](https://opensource.org/licenses/MIT).
