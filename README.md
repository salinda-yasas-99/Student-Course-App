# WebApITest — Fullstack ASP.NET Core + Frontend Project

Short overview of the repository and how to run both backend and frontend locally.

## Repository layout

- `WebApITest/` — ASP.NET Core backend (API + SignalR hub)
- `frontend/` — Vite-based frontend app (React)

## Prerequisites

- .NET SDK 8+ (check with `dotnet --version`)
- Node.js 18+ and a package manager (`pnpm`, `npm` or `yarn`)
- (Optional) `dotnet-ef` for database migrations: `dotnet tool install --global dotnet-ef`

## Backend (WebApITest)

1. Restore and build

```powershell
dotnet restore
dotnet build
```

2. Apply migrations (creates the database schema)

```powershell
dotnet ef database update --project WebApITest --startup-project WebApITest
```

3. Run the API

```powershell
dotnet run --project WebApITest/WebApITest.csproj
```

The API exposes controllers under `/Controllers` (e.g., `CoursesController`, `StudentsController`) and a SignalR hub at `Hubs/NotificationHub.cs`.

### Configuration

- Local configuration values can be set in `WebApITest/appsettings.Development.json` or environment variables.
- Do NOT commit secrets or `appsettings.Development.json` containing credentials.

## Frontend (frontend)

1. Install dependencies

```bash
cd frontend
pnpm install    # or `npm install` / `yarn install`
```

2. Run development server

```bash
pnpm dev        # or `npm run dev` / `yarn dev`
```

3. Build for production

```bash
pnpm build
```

The frontend connects to the backend API (see `src/services/http.js`) and uses a realtime hook in `src/hooks/useRealtimeHub.js` to communicate with the SignalR hub.

## Database & Migrations

- Migrations are stored in `WebApITest/Migrations/`. Use `dotnet ef` to add/update migrations.

## Tests

- If automated tests are added later, put them under a `tests/` folder or a separate test project. Run tests with `dotnet test` for .NET and the relevant test command for the frontend (e.g., `pnpm test`).

## Common Commands

- Build backend: `dotnet build`
- Run backend: `dotnet run --project WebApITest/WebApITest.csproj`
- Run frontend: `pnpm dev`

## Notes

- The repository already includes a `.gitignore` for the `WebApITest` project (see `WebApITest/.gitignore`).
- If you want a repo-level `.gitignore` or CI/CD instructions added, tell me what CI provider you plan to use.

## License

Specify your license here (e.g., MIT) or remove this section if proprietary.
