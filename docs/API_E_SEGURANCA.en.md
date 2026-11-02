# API Access and Security

## Roles and authorization

- `POST /users`: public; always creates a `STUDENT`. Passwords use bcrypt.
- `GET /users`: requires a JWT and the `ADMIN` role.
- `GET /users/:id`, `PATCH /users/:id`, `DELETE /users/:id`: requires a JWT; users can act on their own account and `ADMIN` can act on others. Updates accept only name and email.
- `POST /auth/login`: public; accepts bcrypt hashes and upgrades a legacy plaintext password to bcrypt after a successful login.
- `GET /courses` and `GET /courses/:id`: public.
- `POST /courses`: requires `INSTRUCTOR` or `ADMIN`; the authenticated user is set as owner.
- `PATCH /courses/:id` and `DELETE /courses/:id`: course owner instructor or `ADMIN`.
- `POST /enrollments`: requires a student JWT. Student ID comes from the token; the body contains only `courseId`.
- `GET /enrollments/student/:studentId` and `DELETE /enrollments/:id`: enrollment owner or `ADMIN`.
- `GET /enrollments/course/:courseId`: course owner instructor or `ADMIN`.
- `PATCH /enrollments/:id/progress`: enrollment owner or `ADMIN`; updates progress from 0 to 100 and sets `COMPLETED` at 100.
- `GET /enrollments`: requires `ADMIN`.
- `POST /storage/upload`: requires a JWT; accepts JPG, PNG, WEBP, and PDF files up to 25 MB.

`JWT_SECRET` must be set in the environment. The API does not use a fallback secret.

## Course search

`GET /courses` returns a list. Optional filters:

- `search`: case-insensitive title search.
- `instructorId`: filter by instructor UUID.
- `page` and `limit`: optional pagination; `limit` accepts 1–100 and defaults to 20 when only `page` is provided.

Example: `GET /courses?search=nestjs&page=1&limit=20`.

## Resilience and observability

- The global interceptor requires an `idempotency-key` header on every `POST`. It currently checks only that the header is present; it does not store responses or prevent duplicate requests by key.
- Enrollment creation checks for duplicates before writing and maps MongoDB unique-index errors to `409 Conflict` if a unique index is configured.
- HTTP errors pass through the global Problem Details filter.
- Middleware adds and logs `X-Correlation-ID`.
- The global request limit is provided by Nest Throttler.
- The PostgreSQL health check in Docker Compose uses `POSTGRES_USER` and `POSTGRES_DB` from the service configuration.

## Known limitations

- MongoDB enrollment storage does not share a transaction with PostgreSQL.
- The service performs a preliminary duplicate check, but protection against concurrent duplicate enrollments requires a MongoDB unique index on `{ studentId, courseId }`. Check and resolve existing duplicates before adding this index to a populated database.
- Upload type validation checks the extension, declared MIME type, and basic file signature; it does not replace antivirus or advanced content analysis.
