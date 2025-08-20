# Worker Vitals API (NestJS)

Minimal, fullstack application for a real-time worker vitals dashboard. The backend is implemented with NestJS and PostgreSQL using TypeORM.

Base API path: /api/v1


## CONTENTS
- Overview
- Architecture
- Prerequisites
- Setup and Environment
- Backend: Develop, Build, Run
- Frontend: Develop, Build, Run
- Database and Migrations
- API Reference
- Security and Performance Notes
- Testing (Real Database)
- Frontend Stack
- Prompts Used
- The Engineering Process
- Troubleshooting


## OVERVIEW
The dashboard ingests vital sign data (workerId, heartRate, temperature) and persists it to PostgreSQL. It also exposes an endpoint to retrieve the latest records for a worker. The system is designed to handle high volume inserts efficiently and follows current NestJS conventions.


## ARCHITECTURE
- Backend: NestJS 10, TypeORM 0.3, PostgreSQL, Jest for tests.
- Frontend: Next.js (latest) using the App Router.
- Database: PostgreSQL with a single table vital_signs.


## PREREQUISITES
- Node.js 18+ and npm
- PostgreSQL 13+ running locally
- Windows PowerShell notes: prefer using `;` to chain commands; or use `npm --prefix` when running scripts in subfolders.


## SETUP AND ENVIRONMENT
1) Copy backend/.env.example to backend/.env and adjust if needed:
   - PORT=3000
   - DB_HOST=localhost
   - DB_PORT=5432
   - DB_USER=postgres
   - DB_PASSWORD=postgres
   - DB_NAME=postgres
   - DEFAULT_WORKER_ID=worker-123
   - ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

2) Ensure PostgreSQL is running and the configured user/database exist.


## BACKEND: DEVELOP, BUILD, RUN
- Install dependencies:
  - PowerShell: npm --prefix backend install
- Start in development (watch / ts-node-dev):
  - npm --prefix backend run start:dev
- Build (emit dist):
  - npm --prefix backend run build
- Start from dist:
  - npm --prefix backend run start

Base API URL after start: http://localhost:3000/api/v1


## DATABASE AND MIGRATIONS
TypeORM DataSource is configured at backend\src\typeorm.datasource.ts. Migrations are stored under backend\src\migrations.

### Common commands (run from project root):
- Generate a migration (name InitSchema as example):
  - npm --prefix backend run migration:generate -- src/migrations/InitSchema
- Create an empty migration file:
  - npm --prefix backend run migration:create -- src/migrations/ManualEdit
- Run migrations:
  - npm --prefix backend run migration:run
- Revert last migration:
  - npm --prefix backend run migration:revert
- Show migrations:
  - npm --prefix backend run migration:show

#### Notes:
- Migration files are generated under backend\src\migrations as required.
- The app uses synchronize=true only outside production to ease development; prefer migrations in production.


## API REFERENCE (Base: /api/v1)
### Health
  - GET /health
    - Response: { status: "ok", timestamp: "ISO8601" }

### Vitals
  - POST /vitals
    - Body JSON: { workerId?: string, heartRate: number, temperature: number }
    - Validation:
      - heartRate: int [20..300]
      - temperature: number [25..45], up to 2 decimals
      - workerId optional; defaults to DEFAULT_WORKER_ID when omitted
    - Returns: persisted record with id and timestamp
  - GET /vitals/{workerId}?limit=10
    - Query param limit: int [1..100], default 10
    - Returns: latest N records for worker ordered by timestamp DESC


## SECURITY AND PERFORMANCE NOTES
- Security headers: helmet enabled.
- CORS: restricted via ALLOWED_ORIGINS env; defaults allow dev origins.
- Validation: global ValidationPipe with whitelist/forbidNonWhitelisted and transformation.
- Indexing: vital_signs has an index on (workerId, timestamp) for efficient latest-reads.
- Versioning: URI versioning enabled with default v1; global prefix "api" => /api/v1.
- Migrations: TypeORM 0.3 DataSource for predictable schema evolution.


## TESTING (REAL DATABASE)
### Tests run against a real PostgreSQL database (no mocks).
- The Jest global setup ensures a test database named `${DB_NAME}_test` exists (e.g., postgres_test).
- Runtime setup switches DB_NAME to the suffixed _test DB for the test process.
- Commands:
  - npm --prefix backend test

### What gets tested:
- HealthService smoke test
- VitalsService: create and query latest with ordering and limit over a real DB


## PROMPTS USED
- read the requirements.txt file and help to implement the backend first. the database info: username: postgres, password: postgres, database: postgres. Design the code base should follow the most popular pattern for nestjs application
- create a script for executing migration and updating to the database in the package.json file
- when I execute the migration, the new file should be in the src/migrations folder
- the endpoint should start with `api` and aply the versioning
- now implement the unit test. When executing, test cases need to use the database test, don't use mock data or mock repository. The testing database name is the current database with suffix "_test"
- now start to implement the frontend using the latest next.js. All files should be in the frontend folder. Design the project structure follow the most popular pattern for next.js application
- in the fetchLatestVitals method, don't use any, the response returns the VitalSign array
- change the vital form component to server instead of client component


## THE ENGINEERING PROCESS
### Issues discovered in AI-generated scaffolding and how they were fixed:
  1) Migration output location and filename
     - Issue: Migration scripts produced files outside the intended folder and sometimes used a wrong template name like 1755605808229-%npm_config_name%.ts.
     - Fix: Introduced a dedicated TypeORM DataSource (backend\src\typeorm.datasource.ts) with migrations glob set to src\migrations. Simplified npm scripts to let the CLI handle naming and passed the path/name explicitly when needed (e.g., npm --prefix backend run migration:create -- src/migrations/InitSchema). Verified new files appear under backend\src\migrations with correct names.
     - Thought process: Follow TypeORM 0.3 CLI conventions and remove brittle variable expansion so paths and names are deterministic across shells.
  2) API base path and versioning
     - Issue: Endpoints didn’t enforce the required /api prefix or versioning.
     - Fix: In main.ts, added app.setGlobalPrefix('api') and app.enableVersioning({ type: URI, defaultVersion: '1' }). Updated console output and README to reflect base path /api/v1.
     - Thought process: Apply NestJS 10 best practices for versioning early to avoid breaking changes later and to communicate stability to clients.
  3) Testing against a real database (no mocks)
     - Issue: Initial tests lacked a real DB harness and Jest types; repository interactions were not verified end-to-end.
     - Fix: Added jest.config.ts with ts-jest; created test/jest-global-setup.js to ensure ${DB_NAME}_test exists and test/set-test-env.js to point tests to the suffixed DB. Wrote DB-backed specs for HealthService and VitalsService, and added @types/jest to tsconfig. Cleaned the table between tests via repo.clear().
     - Thought process: Prefer realistic integration-style unit tests per requirement to catch schema/config issues that mocks would hide.
  4) Security hardening
     - Issue: Missing security headers and permissive CORS policy.
     - Fix: Enabled helmet(), implemented environment-driven CORS allow-list in main.ts, and enforced ValidationPipe with whitelist, forbidNonWhitelisted, and transform.
     - Thought process: Address common web risks (XSS, sniffing, origin abuse) with minimal, standard middleware.
  5) Performance and scalability considerations
     - Issue: Potentially slow reads for latest worker vitals and unbounded query sizes.
     - Fix: Added a composite index on (workerId, timestamp). Limited the limit parameter to [1..100] and ordered by timestamp DESC using take for efficient pagination-like retrieval.
     - Thought process: Optimize the dominant read path and prevent accidental large scans while keeping code simple.
  6) Convention alignment
     - Issue: Outdated patterns (e.g., relying solely on synchronize=true, scattered configuration).
     - Fix: Centralized configuration with @nestjs/config, enabled autoLoadEntities, and limited synchronize to non-production; set up TypeORM migrations for schema evolution. Removed throttler per later requirement.
     - Thought process: Adhere to NestJS 10 and TypeORM 0.3 conventions to reduce surprise and improve maintainability.
  7) Server components conversion (Frontend)
     - Issue: The dashboard relied on client components, which is with the later requirement to move to Server Components and a server-handled form.
     - Fix: Converted the main dashboard page to a Server Component and implemented the VitalForm as a server action. Validation and bounds checking are performed on the server action before submitting to the backend; after submission, revalidatePath('/') ensures the latest vitals render on the next request.
     - Thought process: Align with Next.js Server Components guidance for simpler data fetching, reduced client JS, and consistent server-side validation.

### General approach
  - Implement the minimal viable backend, then iterate to correct convention/security/performance gaps.
  - Validate every change with runnable commands (build, migrations) and DB-backed tests to ensure correctness across environments.

## TROUBLESHOOTING
- Windows PowerShell: Use `;` to separate commands instead of `&&`.
- Running backend scripts from root: prefix with `npm --prefix backend` (e.g., `npm --prefix backend run build`).
- Postgres connection errors: verify .env credentials and that the service is running. For tests, ensure you can create databases (permission to create `${DB_NAME}_test`).


## FRONTEND: DEVELOP, BUILD, RUN
- Install dependencies:
  - PowerShell: npm --prefix frontend install
- Start in development:
  - npm --prefix frontend run dev
  - Opens http://localhost:3001 (configured in frontend\package.json)
- Build (optimize for production):
  - npm --prefix frontend run build
- Start production server:
  - npm --prefix frontend run start
- Environment:
  - Copy frontend\.env.example to frontend\.env and adjust:
    - NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
    - NEXT_PUBLIC_WORKER_ID=worker-123
- Notes:
  - Tailwind CSS is configured via @tailwindcss/postcss in frontend\postcss.config.js.
  - The dashboard page renders on the server; the vitals list uses client-side caching and refetching via TanStack Query.

## FRONTEND STACK
- Next.js App Router
  - Layout at frontend\app\layout.tsx; page at frontend\app\page.tsx.
- Form handling (Server Action)
  - components\VitalForm is implemented as a server action; validates heartRate int [20..300] and temperature [25..45] and posts to POST /api/v1/vitals, then revalidates '/'.
- Typesafety
  - Shared interface at frontend\types\vitals.ts.
  - fetchLatestVitals returns Promise<VitalSign[]> (no any).
