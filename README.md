# Inventory Management System (IMS)

A full-stack inventory and sales management system for small/medium businesses.
A React 19 + Vite frontend talks to an ASP.NET Core 10 Web API backed by
PostgreSQL and Redis.

## Tech stack

### Backend (`src/`)

- **.NET 10** / ASP.NET Core 10 Web API
- **Entity Framework Core 10** + **Npgsql** (PostgreSQL provider)
- **ASP.NET Core Identity** for users and roles
- **JWT** bearer authentication (`System.IdentityModel.Tokens.Jwt`)
- **MediatR** + **FluentValidation** for the application layer
- **StackExchange.Redis** for distributed cache (`IConnectionMultiplexer` + `IDistributedCache`)
- **Serilog** structured logging (console + rolling daily JSON file)
- **Swashbuckle** / Swagger UI (Development only)

### Frontend (`IMS.Web/`)

- React 19, Vite, React Router 7
- TanStack Query 5, Zustand 5, Axios
- react-hook-form + Zod for forms and validation
- Tailwind CSS v4

### Infrastructure

- PostgreSQL 15 (alpine)
- Redis 7 (alpine)
- Docker / Docker Compose

## Quick start — Docker (recommended)

From the solution root:

```bash
docker compose up --build
```

That brings up the full stack:

| Service  | Port (host) | Notes                                                                           |
| -------- | ----------- | ------------------------------------------------------------------------------- |
| API      | `5000`      | ASP.NET Core on container port `8080`                                           |
| Postgres | `5432`      | `ims` / `inventorydb` / password `ims_pw_2024`                                  |
| Redis    | `6379`      |                                                                                 |
| pgAdmin  | `5050`      | Dev only (via `docker-compose.override.yml`), login `admin@ims.local` / `admin` |

A named volume `postgres_data` persists the database across `docker compose down`.

> The base `docker-compose.yml` runs the API in **Production** mode (Swagger disabled).
> The override file switches the API to the SDK image with `dotnet watch` for hot reload
> and `ASPNETCORE_ENVIRONMENT=Development` (Swagger enabled at `/swagger`).
> Run `docker compose -f docker-compose.yml up --build` to use the production stack
> without the dev overlay.

### Default credentials

The API seeds an admin user on first startup:

- **Email:** `admin@ims.com`
- **Password:** `Admin@123`

Roles created: `Admin`, `Manager`, `Staff`.

## Local development (without Docker)

Prerequisites: .NET 10 SDK, PostgreSQL 15 reachable, Node 20+ for the frontend.

```bash
# Backend
dotnet restore
dotnet build
dotnet run --project src/IMS.API
# API listens on http://localhost:5000 (and https://localhost:7247) per launchSettings.json
# Swagger UI: http://localhost:5000/swagger

# Frontend (separate terminal)
cd IMS.Web
npm install
npm run dev
# Vite serves on http://localhost:3000
```

`appsettings.json` has `ConnectionStrings:DefaultConnection` pointing at
`Host=localhost;Database=inventorydb;Username=postgres;Password=1234` and
`RedisConnection` at `localhost:6379` — adjust for your local Postgres/Redis.

EF Core migrations are **applied automatically** on startup (added in
`Program.cs` alongside the existing role/admin seeding).

## API documentation

Once the API is running in Development mode:

- Swagger UI: <http://localhost:5000/swagger>
- OpenAPI JSON: <http://localhost:5000/swagger/v1/swagger.json>

In Production mode (the default in `docker-compose.yml`), Swagger is disabled.

## Architecture

```
                ┌──────────────────────┐
                │  React + Vite (host) │  http://localhost:3000
                └──────────┬───────────┘
                           │ HTTP + JWT
                           ▼
                ┌──────────────────────┐
                │  IMS.API  (Docker)   │  http://localhost:5000 → :8080
                │  ASP.NET Core 10     │
                └─────┬──────────┬─────┘
                      │          │
                      ▼          ▼
            ┌────────────┐  ┌──────────┐
            │ PostgreSQL │  │  Redis   │
            │   15       │  │    7     │
            └────────────┘  └──────────┘
```

### Solution layout

```
InventoryManagementSystem.slnx
src/
├── IMS.API/              # Entry point, controllers, Program.cs, Dockerfile
├── IMS.Application/      # MediatR handlers, validators, DTOs, interfaces
├── IMS.Domain/           # Entities, enums
└── IMS.Infrastructure/   # EF Core, Identity, repositories, JWT, Redis, services
IMS.Web/                  # React 19 + Vite frontend (separate package)
docker-compose.yml        # API + Postgres + Redis
docker-compose.override.yml  # Dev: hot-reload API + pgAdmin
```

## Security notes

- The JWT secret and Postgres password in `docker-compose.yml` are **placeholders**.
  Replace them (ideally via a `.env` file consumed by Compose, or a secret manager)
  before any non-local deployment.
- The default admin password (`Admin@123`) should be rotated in any real environment.
- HTTPS termination is expected at a reverse proxy in front of the container —
  `UseHttpsRedirection` is disabled in `Production` for that reason.

## Useful commands

```bash
# Bring the stack up (foreground, with logs)
docker compose up --build

# Detached
docker compose up -d --build

# Tail the API logs
docker compose logs -f api

# Tear everything down (keeps the postgres_data volume)
docker compose down

# Tear everything down INCLUDING the volume
docker compose down -v

# Apply EF Core migrations manually (if you bypass the auto-apply)
dotnet ef database update --project src/IMS.Infrastructure --startup-project src/IMS.API
```
