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
  <img src="https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white" alt="Nginx" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black" alt="Swagger" />
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="License MIT" />
</p>

---

## 📖 Sobre o Projeto

API RESTful escalável para gerenciamento de cursos, alunos e matrículas desenvolvida com **NestJS**. O projeto implementa uma **Arquitetura em Camadas** combinada com **Persistência Poliglota** (_Polyglot Persistence_), utilizando **PostgreSQL** para dados transacionais e **MongoDB** para dados dinâmicos.

---

## 📌 Checklist de Requisitos do Projeto

Abaixo está o mapeamento dos requisitos solicitados para a entrega:

- [x] **Arquitetura Definida:** Arquitetura em Camadas (Controllers, Services, Repositories/Models).
- [x] **Modelagem de Dados:** Estrutura relacional (PostgreSQL) e não-relacional (MongoDB) integrada.
- [x] **Autenticação e Autorização:** JWT com controle de acesso baseado em papéis (RBAC - _STUDENT vs INSTRUCTOR_).
- [x] **Resiliência e Idempotência:** Exigência do cabeçalho `idempotency-key` em rotas `POST` críticas.
- [x] **Tratamento Global de Exceções:** Exception Filter padronizando respostas em **RFC 7807 (Problem Details)**.
- [x] **Observabilidade Básica:** Interceptor de logs estruturados em JSON com rastreamento via `Correlation-ID`.
- [x] **Controle de Vazão:** _Rate Limiting_ ativado em rotas de autenticação e rotas públicas.
- [x] **Contrato de API:** Documentação viva via **OpenAPI / Swagger** acessível em `/api/docs`.
- [x] **Infraestrutura como Código:** `docker-compose.yml` para subida da API e dos bancos com um único comando.
- [x] **Documentação Arquitetural:** Diagramas C4 Model e Relatório de Evolução da Arquitetura ([Acesse aqui](./docs/DOCUMENTACAO_ARQUITETURA.md)).

---

## 📚 Documentação e Relatório Arquitetural

Para acessar a análise detalhada da arquitetura atual, proposta de evolução (Load Balancer, Redis Cluster, Read Replicas) e justificativa das táticas operacionais:

* 🇧🇷 [Relatório de Otimização da Arquitetura (Português)](./docs/DOCUMENTACAO_ARQUITETURA.md)
* 🇺🇸 [Architecture Optimization Report (English)](./docs/ARCHITECTURE_OPTIMIZATION.md)

---

## 🚀 Endpoints Principais & Controle de Acesso (RBAC)

| Módulo | Método | Endpoint | Acesso | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/auth/login` | Público | Autentica usuário e retorna o Token JWT |
| **Users** | `POST` | `/users` | Público | Cadastra um novo usuário no PostgreSQL (`STUDENT` / `INSTRUCTOR`) |
| **Users** | `GET` | `/users` | Autenticado | Lista todos os usuários cadastrados |
| **Courses** | `POST` | `/courses` | `INSTRUCTOR` | Cria um novo curso (Exige `idempotency-key`) |
| **Courses** | `GET` | `/courses` | Público | Lista todos os cursos disponíveis |
| **Enrollments** | `POST` | `/enrollments` | Autenticado | Matricula um aluno em um curso (Exige `idempotency-key`) |
| **Health** | `GET` | `/` | Público | Endpoint de Health Check da API |

---

## 📊 Modelagem de Dados

### 1. Diagrama de Classes UML

Diagrama representando as entidades do domínio, enums, DTOs de entrada validados com `class-validator` e seus relacionamentos:

```mermaid
classDiagram
    direction TB

    class Role {
        <<enumeration>>
        STUDENT
        INSTRUCTOR
        ADMIN
    }

    class User {
        +UUID id
        +String name
        +String email
        +String password
        +Role role
        +Date createdAt
        +Date updatedAt
    }

    class Course {
        +ObjectId id
        +String title
        +String description
        +Number price
        +UUID instructorId
        +Date createdAt
        +Date updatedAt
    }

    class Enrollment {
        +UUID id
        +UUID studentId
        +ObjectId courseId
        +Date createdAt
    }

    class CreateUserDto {
        +String name
        +String email
        +String password
        +Role role
    }

    class CreateCourseDto {
        +String title
        +String description
        +Number price
        +UUID instructorId
    }

    class CreateEnrollmentDto {
        +UUID studentId
        +ObjectId courseId
    }

    User "1" -- "0..*" Course : ministra (como Instrutor)
    User "1" -- "0..*" Enrollment : realiza (como Aluno)
    Course "1" -- "0..*" Enrollment : possui
    User --> Role : possui

    CreateUserDto ..> User : cria
    CreateCourseDto ..> Course : cria
    CreateEnrollmentDto ..> Enrollment : cria

```

---

### 2. Diagrama Entidade-Relacionamento (DER / ERD)

Visão lógica da integração poliglota entre o modelo relacional (PostgreSQL) e o modelo orientado a documentos (MongoDB):

```mermaid
erDiagram
    USERS ||--o{ COURSES : "ministra (instructorId)"
    USERS ||--o{ ENROLLMENTS : "realiza (studentId)"
    COURSES ||--o{ ENROLLMENTS : "contém (courseId)"

    USERS {
        uuid id PK "PostgreSQL"
        string name
        string email UK
        string password
        enum role "STUDENT | INSTRUCTOR | ADMIN"
        datetime createdAt
        datetime updatedAt
    }

    COURSES {
        objectId id PK "MongoDB"
        string title
        string description
        number price
        uuid instructorId FK "Referência lógica -> USERS.id"
        datetime createdAt
        datetime updatedAt
    }

    ENROLLMENTS {
        uuid id PK "PostgreSQL / MongoDB"
        uuid studentId FK "Referência lógica -> USERS.id"
        objectId courseId FK "Referência lógica -> COURSES.id"
        datetime createdAt
    }

```

---

## 🏛️ Documentação Arquitetural (C4 Model)

### 1. Diagrama de Contexto (System Context)

```mermaid
C4Context
    UpdateLayoutConfig($c4ShapeInRow="1", $c4BoundaryInRow="1")

    Person(user, "Usuário", "Aluno ou Instrutor que consome a API")
    System(lms_api, "LMS API", "Gerencia usuários, autenticação, cursos e matrículas")
    System_Ext(email, "Serviço de Notificação", "Envio de e-mails de confirmação")

    Rel(user, lms_api, "Requisições REST", "HTTPS / JSON")
    Rel(lms_api, email, "Dispara e-mails", "SMTP / API")

```

---

### 2. Diagrama de Contêineres (Containers)

```mermaid
C4Container
    UpdateLayoutConfig($c4ShapeInRow="2", $c4BoundaryInRow="1")

    Person(user, "Usuário", "Aluno / Instrutor")

    System_Boundary(c1, "Escopo da LMS API") {
        Container(api, "API (NestJS)", "Node.js + NestJS", "Regras de negócio, Auth e Idempotência")
        ContainerDb(postgres, "PostgreSQL", "Relational DB", "Usuários e Autenticação")
        ContainerDb(mongo, "MongoDB", "NoSQL DB", "Cursos e Matrículas")
    }

    Rel(user, api, "HTTP REST", "HTTPS")
    Rel(api, postgres, "Persiste Usuários", "PrismaORM")
    Rel(api, mongo, "Persiste Cursos e Matrículas", "Mongoose")

```

---

### 3. Diagrama de Componentes (Components)

```mermaid
C4Component
    UpdateLayoutConfig($c4ShapeInRow="2", $c4BoundaryInRow="1")

    Container_Boundary(api_boundary, "NestJS Application Core") {
        Component(users, "Users / Auth", "Module", "Login e JWT (RBAC)")
        Component(courses, "Courses", "Module", "Gestão de Cursos")
        Component(enrollments, "Enrollments", "Module", "Matrículas e Progresso")
        Component(infra, "Core / Infra", "Filter & Interceptor", "RFC 7807, Correlation-ID e Idempotência")
    }

    ContainerDb(postgres, "PostgreSQL", "SQL DB", "Tabela Users")
    ContainerDb(mongo, "MongoDB", "Doc DB", "Coleções Courses e Enrollments")

    Rel(users, postgres, "Acessa Dados", "SQL")
    Rel(courses, mongo, "Acessa Dados", "NoSQL")
    Rel(enrollments, mongo, "Acessa Dados", "NoSQL")
    Rel(enrollments, postgres, "Valida Aluno", "SQL")

```

---

## 💡 Decisões de Arquitetura e Justificativa de Bancos

* **PostgreSQL (Relacional):** Escolhido para **Usuários** e **Autenticação** por exigir garantias **ACID**, consistência forte, e-mails únicos e integridade referencial nativa.
* **MongoDB (Não-Relacional):** Escolhido para **Cursos** e **Matrículas**, permitindo esquema flexível para conteúdos dinâmicos (aulas, vídeos, quizzes) e buscas rápidas em documentos aninhados sem dependência de `JOINs` custosos.

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

JWT_SECRET="sua-chave-secreta"

```

### 2. Subir Infraestrutura (Docker Compose)

Suba a API e os bancos de dados (PostgreSQL + MongoDB) com um único comando:

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

* 🔗 `http://localhost:3000/api/docs`

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

