# Architecture and Design Patterns

## Persistence

- PostgreSQL and Prisma store users and relational data.
- MongoDB and Mongoose store courses and enrollments.
- Redis is configured as the cache backend; the course catalog supports HTTP caching.

## Application structure

- Controllers receive and validate HTTP requests and DTOs, then delegate to services.
- Services apply business rules, ownership authorization, and persistence operations.
- Guards validate JWT identity and the roles required by routes.
- Separate DTOs define accepted fields for creation, updates, and searches.

## Patterns in use

- **Strategy:** free and paid enrollment strategies.
- **Observer:** enrollment events decouple logs and secondary tasks.
- **Singleton:** `LMSConfigSingleton` keeps configuration in memory.
- **Provider:** `StorageProvider` decouples the API from Supabase Storage.
- **Learning progress:** each enrollment tracks progress from 0 to 100 and an `ACTIVE` or `COMPLETED` status.

## Existing passwords

New accounts use bcrypt. To support accounts created by the previous version, a successful login with a legacy plaintext password replaces it with a bcrypt hash. A full password reset is not required for this change.
