# 📌 Checklist de Requisitos do Projeto

Abaixo está o mapeamento dos requisitos solicitados para a entrega:

- [x] **Arquitetura Definida:** Arquitetura em Camadas (Controllers, Services, Repositories/Models).
- [x] **Modelagem de Dados:** Estrutura relacional (PostgreSQL), não-relacional (MongoDB) e cache em memória (Redis) integradas.
- [x] **Autenticação e Autorização:** JWT com controle de acesso baseado em papéis (RBAC - _STUDENT vs INSTRUCTOR_).
- [x] **Padrões de Projeto (Design Patterns):** Implementação dos padrões Singleton, Strategy e Observer.
- [x] **Resiliência e Idempotência:** Exigência do cabeçalho `idempotency-key` em rotas `POST` críticas integrado ao Redis.
- [x] **Tratamento Global de Exceções:** Exception Filter padronizando respostas em **RFC 7807 (Problem Details)**.
- [x] **Observabilidade Básica:** Interceptor de logs estruturados em JSON com rastreamento via `Correlation-ID`.
- [x] **Controle de Vazão:** _Rate Limiting_ ativado em rotas de autenticação e rotas públicas via Throttler.
- [x] **Contrato de API:** Documentação viva via **Swagger** acessível em `/api/docs`.
- [x] **Infraestrutura como Código:** `docker-compose.yml` para subida da API, PostgreSQL, MongoDB e Redis com um único comando.
- [x] **Documentação Refatorada:** Diagramação e textos atualizados com base nas decisões técnicas.
