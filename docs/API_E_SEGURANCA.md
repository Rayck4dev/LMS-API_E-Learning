# 🛡️ Guia de Endpoints, Segurança e Resiliência

## Controle de Accesso (RBAC)

- **Público:** `/auth/login`, `/users` (POST).
- **Autenticado (JWT):** Listagem de usuários, criação de matrículas e upload de arquivos.
- **Instrutor:** Criação e gerenciamento de cursos.

## Mecanismos de Resiliência

- **Idempotência:** Rotas críticas `POST` exigem o cabeçalho obrigatório `idempotency-key` para prevenir execuções duplicadas em falhas de rede.
- **Tratamento de Erros (RFC 7807):** Exceções globais padronizadas no formato _Problem Details_ (`type`, `title`, `status`, `detail`, `instance`).
- **Observabilidade:** Interceptor para rastreamento de requisições utilizando `Correlation-ID`.
- **Rate Limiting:** Proteção contra abusos e ataques de força bruta integrada via `@nestjs/throttler`.

---

## 🚀 Endpoints Principais & Controle de Acesso (RBAC)

| Módulo          | Método | Endpoint          | Acesso       | Descrição                                                                 |
| --------------- | ------ | ----------------- | ------------ | ------------------------------------------------------------------------- |
| **Auth**        | `POST` | `/auth/login`     | Público      | Autentica usuário e retorna o Token JWT                                   |
| **Users**       | `POST` | `/users`          | Público      | Cadastra um novo usuário no PostgreSQL (`STUDENT` / `INSTRUCTOR`)         |
| **Users**       | `GET`  | `/users`          | Autenticado  | Lista todos os usuários cadastrados                                       |
| **Courses**     | `POST` | `/courses`        | `INSTRUCTOR` | Cria um novo curso (Exige `idempotency-key`)                              |
| **Courses**     | `GET`  | `/courses`        | Público      | Lista todos os cursos disponíveis                                         |
| **Enrollments** | `POST` | `/enrollments`    | Autenticado  | Processa e realiza a matrícula (Aplica Strategy e dispara Observers)      |
| **Storage**     | `POST` | `/storage/upload` | Autenticado  | Realiza o upload de arquivos/mídia da plataforma                          |
| **Config**      | `GET`  | `/system-config`  | Público      | **[Singleton]** Retorna as configurações globais unificadas da plataforma |
| **Health**      | `GET`  | `/`               | Público      | Endpoint de Health Check da API                                           |

---
