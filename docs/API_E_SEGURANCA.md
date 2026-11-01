# API, acesso e segurança

## Perfis e autorização

- `POST /users`: público; cria sempre um usuário `STUDENT`. Senhas são guardadas com bcrypt.
- `GET /users`: exige JWT e papel `ADMIN`.
- `GET /users/:id`, `PATCH /users/:id`, `DELETE /users/:id`: exige JWT; o usuário pode operar sobre si mesmo e `ADMIN` pode operar sobre outros. A atualização permite somente nome e e-mail.
- `POST /auth/login`: público; aceita hashes bcrypt e converte a senha legada em texto puro para bcrypt após o primeiro login válido.
- `GET /courses` e `GET /courses/:id`: públicos.
- `POST /courses`: exige perfil `INSTRUCTOR` ou `ADMIN`; o proprietário é definido pelo usuário autenticado.
- `PATCH /courses/:id` e `DELETE /courses/:id`: instrutor proprietário ou `ADMIN`.
- `POST /enrollments`: exige JWT de estudante; o ID do aluno vem do token. O body contém somente `courseId`.
- `GET /enrollments/student/:studentId` e `DELETE /enrollments/:id`: estudante proprietário ou `ADMIN`.
- `GET /enrollments/course/:courseId`: instrutor proprietário do curso ou `ADMIN`.
- `PATCH /enrollments/:id/progress`: estudante proprietário ou `ADMIN`; atualiza progresso percentual entre 0 e 100, marcando status `COMPLETED` ao chegar a 100.
- `GET /enrollments`: exige papel `ADMIN`.
- `POST /storage/upload`: exige JWT; aceita JPG, PNG, WEBP e PDF de até 25 MB.

`JWT_SECRET` precisa estar definido no ambiente. A API não usa uma chave de fallback.

## Busca de cursos

`GET /courses` mantém a resposta em lista. Filtros opcionais:

- `search`: procura no título sem diferenciar maiúsculas/minúsculas.
- `instructorId`: filtra pelo UUID do instrutor.
- `page` e `limit`: paginação opcional; `limit` aceita de 1 a 100 e usa 20 como padrão quando só `page` é enviado.

Exemplo: `GET /courses?search=nestjs&page=1&limit=20`.

## Resiliência e observabilidade

- O interceptor global ainda exige `idempotency-key` em todos os métodos `POST`. Atualmente ele valida apenas a presença do cabeçalho; não armazena respostas nem impede duplicatas por chave.
- As matrículas verificam duplicidade antes da gravação e convertem erro de índice único do MongoDB em `409 Conflict`, caso exista índice único configurado.
- Erros HTTP passam pelo filtro global Problem Details.
- O middleware adiciona e registra `X-Correlation-ID`.
- O limite global de requisições é fornecido pelo Nest Throttler.
- O health check do Postgres no Docker Compose usa `POSTGRES_USER` e `POSTGRES_DB` do próprio serviço.

## Limitações conhecidas

- O armazenamento de matrículas no MongoDB não tem transação compartilhada com PostgreSQL.
- O serviço faz uma consulta prévia para evitar matrículas repetidas, mas uma garantia contra duas requisições concorrentes depende de índice único `{ studentId, courseId }` no MongoDB. Antes de habilitar esse índice numa base existente, verificar e resolver duplicatas.
- O filtro de tipo do upload valida extensão, MIME declarado e assinatura básica do arquivo; isso não substitui antivírus ou análise avançada de conteúdo.
