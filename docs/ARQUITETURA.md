# 🏛️ Arquitetura e Padrões de Projeto

## Persistência Poliglota e Cache

O sistema utiliza uma abordagem robusta combinando bancos transacionais, orientados a documentos e armazenamento em memória:

- **PostgreSQL (Relacional):** Utilizado para **Usuários** e **Autenticação**, garantindo propriedades **ACID**, consistência estrita e integridade referencial via Prisma ORM.
- **MongoDB (Non-Relational):** Utilizado para **Cursos** e **Matrículas**, oferecendo flexibilidade de esquema para conteúdos dinâmicos e escalabilidade horizontal via Mongoose.
- **Redis (In-Memory / Cache):** Utilizado como camada de cache de alta performance (`cache-manager-redis-yet`) e motor de controle para validação de requisições idempotentes.

---

## Padrões de Projeto (Design Patterns)

1. **Singleton (`LMSConfigSingleton`):**
   - **Objetivo:** Centralizar configurações globais do sistema em instância única na memória.
   - **Uso:** Acessível via endpoint de configuração para gerenciar parâmetros da plataforma de forma consistente.

2. **Strategy (`EnrollmentStrategy`):**
   - **Objetivo:** Isolar regras de negócio complexas de matrícula (ex: cursos gratuitos vs. pagos) eliminando condicionais (`if/else`) aninhadas no serviço.

3. **Observer (`@nestjs/event-emitter`):**
   - **Objetivo:** Desacoplar tarefas secundárias (como envio de notificações e logs de auditoria) do fluxo principal de criação de matrículas através de eventos assíncronos.
