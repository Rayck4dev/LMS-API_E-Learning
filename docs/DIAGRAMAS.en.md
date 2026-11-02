# Data Model and Architecture Diagrams

## 1. UML class diagram

This diagram represents domain entities, enums, input DTOs validated with `class-validator`, and their relationships:

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
    User "1" -- "0..*" Course : teaches
    User "1" -- "0..*" Enrollment : enrolls
    Course "1" -- "0..*" Enrollment : contains
    User --> Role : has
    CreateUserDto ..> User : creates
    CreateCourseDto ..> Course : creates
    CreateEnrollmentDto ..> Enrollment : creates
```

## 2. Entity relationship diagram

Logical view of polyglot persistence across the relational model (PostgreSQL) and document model (MongoDB):

```mermaid
erDiagram
    USERS ||--o{ COURSES : "teaches (instructorId)"
    USERS ||--o{ ENROLLMENTS : "enrolls (studentId)"
    COURSES ||--o{ ENROLLMENTS : "contains (courseId)"
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
        uuid instructorId FK "Logical reference -> USERS.id"
        datetime createdAt
        datetime updatedAt
    }
    ENROLLMENTS {
        uuid id PK "PostgreSQL / MongoDB"
        uuid studentId FK "Logical reference -> USERS.id"
        objectId courseId FK "Logical reference -> COURSES.id"
        datetime createdAt
    }
```

## 3. C4 architecture diagrams

### System context

```mermaid
C4Context
    UpdateLayoutConfig($c4ShapeInRow="1", $c4BoundaryInRow="1")
    Person(user, "User", "Student or instructor using the API")
    System(lms_api, "LMS API", "Manages users, authentication, courses, and enrollments")
    System_Ext(email, "Notification Service", "Sends confirmation emails")
    Rel(user, lms_api, "REST requests", "HTTPS / JSON")
    Rel(lms_api, email, "Sends emails", "SMTP / API")
```

### Containers

```mermaid
C4Container
    UpdateLayoutConfig($c4ShapeInRow="2", $c4BoundaryInRow="1")
    Person(user, "User", "Student / Instructor")
    System_Boundary(c1, "LMS API scope") {
        Container(api, "API (NestJS)", "Node.js + NestJS", "Business rules, authentication, idempotency validation, and caching")
        ContainerDb(postgres, "PostgreSQL", "Relational DB", "Users and authentication")
        ContainerDb(mongo, "MongoDB", "NoSQL DB", "Courses and enrollments")
        ContainerDb(redis, "Redis", "In-memory DB", "Cache")
    }
    Rel(user, api, "HTTP REST", "HTTPS")
    Rel(api, postgres, "Stores users", "Prisma ORM")
    Rel(api, mongo, "Stores courses and enrollments", "Mongoose")
    Rel(api, redis, "Manages cache", "cache-manager-redis-yet")
```

### Components

```mermaid
C4Component
    UpdateLayoutConfig($c4ShapeInRow="2", $c4BoundaryInRow="1")
    Container_Boundary(api_boundary, "NestJS application core") {
        Component(users, "Users / Auth", "Module", "Login, JWT, and RBAC")
        Component(courses, "Courses", "Module", "Course management")
        Component(enrollments, "Enrollments", "Module", "Enrollments (Strategy and Observer)")
        Component(infra, "Core / Infrastructure", "Filter, Interceptor & Middleware", "RFC 7807, correlation ID, idempotency header validation, and cache")
    }
    ContainerDb(postgres, "PostgreSQL", "SQL DB", "Users table")
    ContainerDb(mongo, "MongoDB", "Document DB", "Courses and enrollments collections")
    ContainerDb(redis, "Redis", "In-memory", "Temporary storage and cache")
    Rel(users, postgres, "Accesses data", "SQL")
    Rel(courses, mongo, "Accesses data", "NoSQL")
    Rel(enrollments, mongo, "Accesses data", "NoSQL")
    Rel(enrollments, postgres, "Validates student", "SQL")
    Rel(infra, redis, "Validates / stores keys", "Redis commands")
```
