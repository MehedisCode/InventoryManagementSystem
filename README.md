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

### Demo accounts

The following accounts are seeded automatically on first start so the app is immediately usable:

| Role    | Email             | Password      |
|---------|-------------------|---------------|
| Admin   | `admin@ims.com`   | `Admin@123`   |
| Manager | `manager@ims.com` | `Manager@123` |
| Staff   | `staff@ims.com`   | `Staff@123`   |

Roles created: `Admin`, `Manager`, `Staff` — each demo account above is assigned to the matching role.

These credentials are intentionally committed for showcase purposes only.

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
