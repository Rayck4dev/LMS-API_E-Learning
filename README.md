<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# 🎓 LMS API - Plataforma de Gestão de Aprendizado

API RESTful escalável para gerenciamento de cursos, alunos e matrículas desenvolvida com **NestJS**. O projeto implementa uma **Arquitetura em Camadas** combinada com **Persistência Poliglota** (_Polyglot Persistence_), utilizando **PostgreSQL** para dados transacionais e **MongoDB** para dados dinâmicos.

---

## 📌 Checklist de Requisitos do Projeto

Abaixo está o mapeamento dos requisitos solicitados para a entrega:

- **[x] Arquitetura Definida:** Arquitetura em Camadas (Controllers, Services, Repositories/Models).
- **[x] Modelagem de Dados:** Estrutura relacional (PostgreSQL) e não-relacional (MongoDB) integrada.
- **[x] Autenticação e Autorização:** JWT com controle de acesso baseado em papéis (RBAC - _STUDENT vs INSTRUCTOR_).
- **[x] Resiliência e Idempotência:** Exigência do cabeçalho `idempotency-key` em rotas `POST` críticas.
- **[x] Tratamento Global de Exceções:** Exception Filter padronizando respostas em **RFC 7807 (Problem Details)**.
- **[x] Observabilidade Básica:** Interceptor de logs estruturados em JSON com rastreamento via `Correlation-ID`.
- **[x] Controle de Vazão:** _Rate Limiting_ ativado em rotas de autenticação e rotas públicas.
- **[x] Contrato de API:** Documentação viva via **OpenAPI / Swagger** acessível em `/api/docs`.
- **[x] Infraestrutura como Código:** `docker-compose.yml` para subida da API e dos bancos com um único comando.
- **[x] Documentação Arquitetural:** Diagramas de Contexto, Contêineres e Componentes no modelo **C4 Model**.

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

    %% Relacionamentos de Domínio
    User "1" -- "0..*" Course : ministra (como Instrutor)
    User "1" -- "0..*" Enrollment : realiza (como Aluno)
    Course "1" -- "0..*" Enrollment : possui
    User --> Role : possui

    %% Relações com DTOs de Entrada
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

- **PostgreSQL (Relacional):** Escolhido para **Usuários** e **Autenticação** por exigir garantias **ACID**, consistência forte, e-mails únicos e integridade referencial nativa.
- **MongoDB (Não-Relacional):** Escolhido para **Cursos** e **Matrículas**, permitindo esquema flexível para conteúdos dinâmicos (aulas, vídeos, quizzes) e buscas rápidas em documentos aninhados sem dependência de `JOINs` custosos.

---

## 🛠️ Infraestrutura e Execução

### 1. Subir Infraestrutura (Docker Compose)

Suba a API e os bancos de dados (PostgreSQL + MongoDB) com um único comando:

```bash
docker compose up -d

```

### 2. Executar a Aplicação Localmente

```bash
# Instalar dependências
npm install

# Modo de desenvolvimento
npm run start:dev

```

### 3. Documentação Swagger (OpenAPI)

Após iniciar a aplicação, acesse o contrato interativo da API no navegador:

- `http://localhost:3000/api/docs`

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

Este projeto está sob a licença [MIT](LICENSE).
