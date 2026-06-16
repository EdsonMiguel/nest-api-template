# Nest API Template

Template base para APIs NestJS com TypeScript, PostgreSQL, TypeORM, JWT, Swagger e uma organizacao inspirada em Clean Architecture + DDD.

## 1. Objetivo

Este projeto serve como ponto de partida para APIs backend que precisam de uma base organizada desde o inicio. Ele ja traz configuracoes de ambiente, Docker, banco de dados, migrations, seeds, autenticacao JWT, refresh tokens, Swagger, seguranca basica e um modulo Users implementado em camadas.

A ideia nao e prender a aplicacao em uma arquitetura pesada, mas criar limites claros:

- `domain` concentra regras e modelos puros.
- `application` concentra casos de uso e contratos.
- `infra` concentra detalhes externos como TypeORM, criptografia, Passport e banco.
- `presentation` concentra HTTP, DTOs e controllers.

Controllers nao devem conter regra de negocio. Use cases nao devem depender de TypeORM. Entidades de dominio nao devem usar decorators de framework.

## 2. Stack

- Node.js
- NestJS
- TypeScript
- PostgreSQL
- TypeORM
- Passport + JWT
- Swagger/OpenAPI
- Docker Compose
- ESLint
- Prettier
- Jest
- Helmet
- CORS
- `@nestjs/throttler`
- `class-validator`
- `class-transformer`

## 3. Instalacao

Instale as dependencias:

```bash
npm install
```

## 4. Configuracao do .env

Crie o arquivo local de ambiente a partir do exemplo:

```bash
cp .env.example .env
```

No Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

O arquivo `.env` real nao deve ser versionado.

Variaveis principais:

```env
NODE_ENV=development
PORT=3333

CORS_ORIGIN=*
CORS_CREDENTIALS=false
THROTTLE_TTL=60
THROTTLE_LIMIT=100

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=docker
DATABASE_NAME=api_template

JWT_ACCESS_SECRET=change_me
JWT_REFRESH_SECRET=change_me
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

ADMIN_NAME=Admin
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change_me
```

Notas:

- `THROTTLE_TTL` e definido em segundos.
- `CORS_ORIGIN=*` libera qualquer origem. Em producao, prefira uma lista separada por virgula.
- Troque os segredos JWT antes de usar em qualquer ambiente real.
- `ADMIN_PASSWORD` e usado apenas pelo seed inicial e e salvo como hash.

## 5. PostgreSQL com Docker

Suba o PostgreSQL local:

```bash
docker compose up -d
```

Configuracao do banco:

- Host: `localhost`
- Porta: `5432`
- Database: `api_template`
- User: `postgres`
- Password: `docker`

Os dados ficam persistidos no volume Docker `postgres_data`.

Para parar:

```bash
docker compose down
```

Para remover tambem o volume de dados:

```bash
docker compose down -v
```

## 6. Migrations

O projeto usa TypeORM com `synchronize: false`. Alteracoes de schema devem ser feitas por migrations.

DataSource usado pelo CLI:

```text
src/shared/infra/database/typeorm/data-source.ts
```

Rodar migrations pendentes:

```bash
npm run migration:run
```

Reverter a ultima migration:

```bash
npm run migration:revert
```

Criar uma migration vazia:

```bash
npm run migration:create
```

Gerar migration a partir das entities TypeORM:

```bash
npm run migration:generate
```

As migrations ficam em:

```text
src/shared/infra/database/typeorm/migrations/
```

## 7. Seeds

Execute os seeds depois das migrations:

```bash
npm run seed:run
```

O seed inicial e idempotente e cria:

- Role `admin`
- Role `user`
- Permissions `users:create`, `users:read`, `users:update`, `users:delete`
- Usuario admin inicial
- Relacionamentos entre roles, permissions e admin

Os seeds podem rodar varias vezes sem duplicar roles, permissions ou vinculos.

Fluxo completo do banco local:

```bash
docker compose up -d
npm run migration:run
npm run seed:run
```

## 8. Rodando em desenvolvimento

Com `.env`, banco, migrations e seeds preparados:

```bash
npm run start:dev
```

A API sobe por padrao em:

```text
http://localhost:3333
```

As rotas usam prefixo global e versionamento por URI:

```text
/api/v1
```

Exemplos:

```text
POST /api/v1/auth/login
GET  /api/v1/auth/me
GET  /api/v1/users
GET  /api/v1/health
```

## 9. Swagger

A documentacao OpenAPI fica em:

```text
http://localhost:3333/api/docs
```

O Swagger esta configurado com Bearer Auth. Para testar rotas privadas:

1. Execute `POST /api/v1/auth/login`.
2. Copie o `accessToken`.
3. Clique em `Authorize`.
4. Informe o token como Bearer token.

## 10. Testes

Rodar testes unitarios:

```bash
npm run test
```

Rodar testes em watch mode:

```bash
npm run test:watch
```

Rodar cobertura:

```bash
npm run test:cov
```

Rodar e2e:

```bash
npm run test:e2e
```

## 11. Estrutura de pastas

Estrutura principal:

```text
src/
  main.ts
  app.module.ts
  config/
  shared/
    domain/
    application/
    infra/
  modules/
    auth/
      domain/
      application/
      infra/
      presentation/
    users/
      domain/
      application/
      infra/
      presentation/
    health/
      domain/
      application/
      infra/
      presentation/
```

Responsabilidades:

- `config/`: configuracoes carregadas por `@nestjs/config`.
- `shared/domain/`: entidades, value objects e erros base sem dependencia de framework.
- `shared/application/`: contratos e erros compartilhados da camada de aplicacao.
- `shared/infra/`: implementacoes compartilhadas, filtros HTTP, interceptors, banco e criptografia.
- `modules/*/domain`: regras, entidades, value objects e contratos do modulo.
- `modules/*/application`: use cases, servicos de aplicacao e erros de aplicacao.
- `modules/*/infra`: adapters concretos como TypeORM, Passport, repositorios e strategies.
- `modules/*/presentation`: controllers HTTP, DTOs e mappers de resposta.

## 12. Criando um novo modulo

Para criar um novo modulo seguindo Clean Architecture + DDD, use este formato:

```text
src/modules/orders/
  orders.module.ts
  domain/
    entities/
    value-objects/
    errors/
    repositories/
  application/
    use-cases/
    errors/
  infra/
    database/
      typeorm/
        entities/
        mappers/
        repositories/
  presentation/
    http/
      dtos/
      orders.controller.ts
```

Fluxo recomendado:

1. Modele a entidade de dominio sem decorators de TypeORM.
2. Crie value objects para invariantes importantes.
3. Defina contratos abstratos em `domain/repositories`.
4. Implemente use cases em `application/use-cases` dependendo apenas dos contratos.
5. Crie a entity TypeORM separada em `infra/database/typeorm/entities`.
6. Crie mapper entre dominio e banco.
7. Implemente repository TypeORM que cumpre o contrato abstrato.
8. Crie DTOs e controller em `presentation/http`.
9. Registre providers e controllers no module.
10. Crie migration para as novas tabelas.

Regra pratica: dependencias apontam de fora para dentro. `presentation` pode chamar `application`; `application` conhece contratos do `domain`; `infra` implementa contratos. `domain` nao conhece Nest, TypeORM, HTTP ou banco.

## 13. Autenticacao, roles e permissions

Autenticacao atual:

- Login por email e senha.
- Senha armazenada como hash `scrypt`.
- Access token JWT assinado com `JWT_ACCESS_SECRET`.
- `JwtStrategy` valida Bearer Token.
- `JwtAuthGuard` e global: rotas sao privadas por padrao.
- `@Public()` libera rotas publicas.
- `@CurrentUser()` injeta o usuario autenticado.

Endpoints de Auth:

```text
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

Roles e permissions:

- O schema ja possui `roles`, `permissions`, `user_roles` e `role_permissions`.
- O seed inicial cria roles `admin` e `user`.
- O seed inicial cria permissions basicas de Users.
- A role `admin` recebe todas as permissions basicas.
- A role `user` recebe `users:read`.

Neste momento, roles e permissions estao persistidas e semeadas, mas ainda nao ha guard/decorator de autorizacao por permission. O fluxo atual protege rotas por autenticacao JWT. A autorizacao fina pode ser adicionada depois com decorators como `@Permissions('users:create')` e um guard que leia as permissions do usuario.

## 14. Refresh tokens

Refresh tokens usam tokens opacos, nao JWT.

Fluxo:

1. `POST /auth/login` valida email/senha.
2. A API gera `accessToken` JWT e `refreshToken` opaco.
3. Apenas o hash SHA-256 do refresh token e salvo em `refresh_tokens.token_hash`.
4. `POST /auth/refresh` recebe o refresh token puro no body.
5. A API calcula o hash e busca um token valido, nao expirado e nao revogado.
6. Se valido, o token antigo e revogado.
7. Um novo refresh token e criado e retornado junto com novo access token.
8. `POST /auth/logout` revoga o refresh token informado.

Regras de seguranca:

- Refresh token puro nunca e salvo no banco.
- Refresh token puro nao deve ser logado.
- Token revogado nao pode ser usado novamente.
- Token expirado nao pode ser usado.

Tabela usada:

```text
refresh_tokens
```

Campos principais:

- `id`
- `user_id`
- `token_hash`
- `expires_at`
- `revoked_at`
- `created_at`

## 15. Scripts

Scripts disponiveis:

```bash
npm run start
npm run start:dev
npm run start:debug
npm run start:prod
npm run build
npm run lint
npm run format
npm run test
npm run test:watch
npm run test:cov
npm run test:debug
npm run test:e2e
npm run migration:create
npm run migration:generate
npm run migration:run
npm run migration:revert
npm run seed:run
```

Comandos mais usados no dia a dia:

```bash
docker compose up -d
npm run migration:run
npm run seed:run
npm run start:dev
```

## Checklist para rodar do zero

```bash
npm install
cp .env.example .env
docker compose up -d
npm run migration:run
npm run seed:run
npm run start:dev
```

Depois acesse:

```text
http://localhost:3333/api/docs
```
