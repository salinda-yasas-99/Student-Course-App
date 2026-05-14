# Building a Lightweight Full‑Stack App with ASP.NET Core and Vite + React

How I combined a simple ASP.NET Core API, SignalR realtime updates, and a Vite React frontend for a fast developer experience

## Introduction

This project demonstrates a clean, practical full‑stack architecture: an ASP.NET Core backend (API + SignalR) and a modern Vite + React frontend. It’s designed to be small, easy to run locally, and ready for extension — ideal for prototypes, demos, and learning full‑stack patterns with realtime features.

## What’s in the repo

- `WebApITest/` — ASP.NET Core backend (API + SignalR hub)
- `frontend/` — Vite-based frontend app (React)

## Architecture at a glance

- **Backend:** RESTful controllers (`CoursesController`, `StudentsController`), EF Core `AppDbContext`, repository layer, and a `NotificationHub` for realtime messages.
- **Frontend:** React pages (`CoursesPage.jsx`, `StudentsPage.jsx`), service modules (`src/services/http.js`, `src/services/realtime.js`), and a custom hook (`src/hooks/useRealtimeHub.js`) to manage SignalR connections.

## Key features and design choices

- Clear separation of concerns: Controllers → Repositories → Data models. Repositories live under `WebApITest/Repositories/`.
- Real‑time updates via SignalR: server events are pushed to clients using `Hubs/NotificationHub.cs`, and the frontend consumes those events with `useRealtimeHub.js`.
- Database migrations are tracked in `WebApITest/Migrations/`, enabling repeatable schema changes via EF Core.
- Lightweight frontend using Vite for very fast dev rebuilds and HMR, with HTTP helpers in `src/services/http.js` to centralize API calls.

## Why this setup?

- **Productivity:** `dotnet` + EF Core is quick for API and data; Vite + React gives instant feedback in the UI.
- **Realtime approachable:** SignalR integrates naturally with ASP.NET Core and is straightforward to consume from JS.
- **Extensible:** The repo is laid out so you can add auth, CI, or microservices without major rework.

## Getting started (quick)

### Backend

```powershell
dotnet restore
dotnet build
# Apply EF migrations (ensure dotnet-ef installed)
dotnet ef database update --project WebApITest --startup-project WebApITest
dotnet run --project WebApITest/WebApITest.csproj
```

### Frontend

```bash
cd frontend
pnpm install   # or `npm install` / `yarn install`
pnpm dev       # or `npm run dev` / `yarn dev`
```

## Developer notes

- Configuration: Local settings live in `WebApITest/appsettings.Development.json`. Avoid committing secrets; this repo includes a `.gitignore` at `WebApITest/.gitignore`.
- Realtime hook: `src/hooks/useRealtimeHub.js` abstracts connection lifecycle and event subscription — reuse this pattern to add new realtime features.
- API client: `src/services/http.js` centralizes base URL, token handling, and error handling, making it easy to swap host URL between environments.
- Migrations: Add migrations with:

```powershell
dotnet ef migrations add YourMigrationName --project WebApITest --startup-project WebApITest
```

## Ideas for next steps

- Authentication: Add JWT or cookie‑based auth in the API and secure the SignalR hub.
- Tests: Introduce a test project for the backend (`dotnet test`) and unit/integration tests for frontend components.
- CI/CD: Add GitHub Actions or Azure Pipelines for build/test/deploy pipelines.
- Docker: Provide a `Dockerfile` for the API and a small multi‑container `docker-compose.yml` to run the stack locally.
- Frontend improvements: Add state management (if needed), paginated endpoints for lists, frontend caching strategies.

## Security & operations reminders

- Don’t commit `appsettings.Development.json` with secrets. Use user secrets or environment variables for credentials.
- Review CORS settings in `Program.cs` when deploying the frontend separately from the API.
- For production, enable database backups and secure SignalR endpoints (auth + HTTPS).

## Conclusion

This project is a compact, practical example of how to combine ASP.NET Core APIs, SignalR realtime, and a Vite React frontend for modern full‑stack development. It’s ideal as a starting point for demos, learning, or rapidly building production features once you add auth, tests, and CI.
