# Project Requirements Checklist

This checklist maps the requested requirements to the current project implementation:

- [x] **Defined architecture:** layered structure using controllers, services, and repositories/models.
- [x] **Data modeling:** relational storage (PostgreSQL), document storage (MongoDB), and in-memory cache (Redis) are configured.
- [x] **Authentication and authorization:** JWT with role-based access control (RBAC).
- [x] **Design patterns:** Singleton, Strategy, and Observer patterns.
- [x] **Resilience and idempotency header:** the global interceptor requires `idempotency-key` on `POST` requests. It currently checks header presence only; it does not persist keys or deduplicate requests.
- [x] **Global exception handling:** exception filter formats responses as RFC 7807 Problem Details.
- [x] **Basic observability:** structured JSON logs and request tracing with `Correlation-ID`.
- [x] **Request throttling:** rate limiting is enabled through Nest Throttler.
- [x] **API contract:** live Swagger documentation is available at `/api/docs`.
- [x] **Infrastructure as code:** `docker-compose.yml` starts the API, PostgreSQL, MongoDB, and Redis.
- [x] **Updated documentation:** architecture diagrams and technical descriptions are maintained in the `docs/` folder in English and Brazilian Portuguese.
