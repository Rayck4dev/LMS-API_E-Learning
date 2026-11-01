# Arquitetura e padrões

## Persistência

- PostgreSQL e Prisma armazenam usuários e dados relacionais.
- MongoDB e Mongoose armazenam cursos e matrículas.
- Redis é configurado como backend de cache; o catálogo de cursos permite cache HTTP.

## Organização da aplicação

- Controllers recebem e validam HTTP/DTOs e delegam regras aos services.
- Services aplicam regras de negócio, autorização por titularidade e persistência.
- Guards validam identidade JWT e papéis exigidos nas rotas.
- DTOs separados definem campos aceitos para cadastro, atualização e busca.

## Padrões presentes

- **Strategy:** estratégias de matrícula gratuita e paga.
- **Observer:** eventos de matrícula desacoplam logs e tarefas secundárias.
- **Singleton:** `LMSConfigSingleton` mantém configuração em memória.
- **Provider:** `StorageProvider` desacopla a API do Supabase Storage.
- **Progresso de aprendizagem:** cada matrícula mantém percentual de 0 a 100 e status `ACTIVE`/`COMPLETED`.

## Senhas existentes

Novos cadastros usam bcrypt. Para manter compatibilidade com contas criadas pela versão anterior, um login válido com senha legada substitui o valor em texto puro pelo hash bcrypt. Não é necessário resetar todas as senhas para aplicar essa mudança.
