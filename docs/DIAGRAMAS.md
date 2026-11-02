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
        Container(api, "API (NestJS)", "Node.js + NestJS", "Regras de negócio, Auth, validação do cabeçalho de idempotência e Cache")
        ContainerDb(postgres, "PostgreSQL", "Relational DB", "Usuários e Autenticação")
        ContainerDb(mongo, "MongoDB", "NoSQL DB", "Cursos e Matrículas")
        ContainerDb(redis, "Redis", "In-Memory DB", "Cache")
    }

    Rel(user, api, "HTTP REST", "HTTPS")
    Rel(api, postgres, "Persiste Usuários", "Prisma ORM")
    Rel(api, mongo, "Persiste Cursos e Matrículas", "Mongoose")
    Rel(api, redis, "Gerencia Cache", "cache-manager-redis-yet")
```

---

### 3. Diagrama de Componentes (Components)

```mermaid
C4Component
    UpdateLayoutConfig($c4ShapeInRow="2", $c4BoundaryInRow="1")

    Container_Boundary(api_boundary, "NestJS Application Core") {
        Component(users, "Users / Auth", "Module", "Login, JWT e RBAC")
        Component(courses, "Courses", "Module", "Gestão de Cursos")
        Component(enrollments, "Enrollments", "Module", "Matrículas (Strategy & Observers)")
        Component(infra, "Core / Infra", "Filter, Interceptor & Middleware", "RFC 7807, Correlation-ID, validação do cabeçalho de idempotência e Cache")
    }

    ContainerDb(postgres, "PostgreSQL", "SQL DB", "Tabela Users")
    ContainerDb(mongo, "MongoDB", "Doc DB", "Coleções Courses e Enrollments")
    ContainerDb(redis, "Redis", "In-Memory", "Armazenamento Temporário e Cache")

    Rel(users, postgres, "Acessa Dados", "SQL")
    Rel(courses, mongo, "Acessa Dados", "NoSQL")
    Rel(enrollments, mongo, "Acessa Dados", "NoSQL")
    Rel(enrollments, postgres, "Valida Aluno", "SQL")
    Rel(infra, redis, "Valida/Armazena Chaves", "Redis Commands")

```
---
