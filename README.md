# AgaetisPortal

A polished, responsive employee directory for managing people, contact details, and job roles. The interface is branded as **Roster** and is intentionally focused: one page, one clear workflow, and no dashboard clutter.

## Features

- Create, view, edit, and delete employees with PostgreSQL persistence
- Case-insensitive name search with a 300 ms debounce
- Server-side pagination with deterministic ordering
- Reusable accessible create/edit form with inline validation
- Case-insensitive unique email enforcement at the database layer
- Loading skeletons, empty and no-results views, retryable errors, pending states, and toast feedback
- Desktop table and purpose-built mobile employee cards
- API and form tests, strict TypeScript, ESLint, and production builds

## Stack

- **Client:** React, TypeScript, Vite, Tailwind CSS, TanStack Query, Axios, React Hook Form, Zod, Radix Dialog, Lucide
- **Server:** Node.js, Express, TypeScript, `pg`, Zod
- **Database:** PostgreSQL 17
- **Quality:** Vitest, Testing Library, Supertest, ESLint

## Architecture

This is a small npm workspace with two applications:

```text
client/                     React application
  src/components/          focused UI and state components
  src/hooks/               reusable client hooks
  src/lib/api/             typed Axios API client
  src/types/               shared client domain types
server/
  src/db/                   pool, migration, and seed runner
  src/employees/            validation, repository, service, and routes
  src/lib/                  application errors
  tests/                    isolated API integration tests
docker-compose.yml          local PostgreSQL
```

TanStack Query owns remote state; the client does not maintain a duplicate employee collection. The server separates HTTP routing, business error mapping, and parameterized persistence without adding an ORM or framework-specific abstractions.

## Database design

`employees` uses an identity integer primary key and `TIMESTAMPTZ` creation timestamp. Names and roles have database checks in addition to API validation. A unique expression index on `LOWER(email)` makes email uniqueness race-safe and case-insensitive. Inputs are trimmed and emails are lowercased before persistence.

The migration also adds `(created_at DESC, id DESC)` for the directory’s stable default sort. Seed inserts use `ON CONFLICT` and are safe to rerun.

## Prerequisites

- Node.js 22 or newer
- npm 10 or newer
- Docker Desktop with Docker Compose

> On Windows, avoid installing `node_modules` inside an actively synced OneDrive folder if OneDrive interferes with package extraction. A normal local development folder is recommended.

## Local setup

```bash
npm install
copy .env.example .env
docker compose up -d
npm run db:migrate
npm run db:seed
npm run dev
```

On macOS/Linux, use `cp .env.example .env`. Then open [http://localhost:5173](http://localhost:5173). The API runs at [http://localhost:4000](http://localhost:4000).

The seed command is explicit and is never run automatically in production.

## Environment variables

| Variable | Default/example | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | `postgresql://roster:roster@127.0.0.1:5433/roster` | PostgreSQL connection string; Compose maps host `5433` to container `5432` |
| `PORT` | `4000` | API port |
| `CORS_ORIGINS` | `http://localhost:5173` | Comma-separated allowed browser origins |
| `VITE_API_URL` | `http://localhost:4000` | Browser-facing API base URL |

Never commit `.env`; it is ignored by Git.

## API

All errors use `{ "error": { "code", "message", "details?" } }` and never expose SQL or stack traces.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/employees?search=&page=1&limit=10` | Filtered, paginated employee list |
| `POST` | `/employees` | Create an employee |
| `PUT` | `/employees/:id` | Replace editable employee details |
| `DELETE` | `/employees/:id` | Delete an employee (`204`) |
| `GET` | `/health` | API health response |

Create/update JSON body:

```json
{ "name": "Maya Chen", "email": "maya@example.com", "role": "Product Designer" }
```

## Commands

```bash
npm run dev          # client and API with live reload
npm run db:migrate   # apply the idempotent schema migration
npm run db:seed      # add demo records without duplicates
npm run typecheck    # strict TypeScript checks
npm run lint         # ESLint across both workspaces
npm test             # frontend and isolated API tests
npm run build        # production server and client builds
```

API tests use an in-memory repository implementing the same service contract, so they never connect to or clear a development/production database. The PostgreSQL repository remains covered by TypeScript and the API contract; a containerized database integration suite would be the next testing layer for a larger production system.

## Deployment

1. Provision PostgreSQL and set `DATABASE_URL` plus the exact frontend origins in `CORS_ORIGINS`.
2. Run `npm ci`, `npm run db:migrate`, and `npm run build`.
3. Start the API with `npm run start -w server`.
4. Serve `client/dist` through a static host and set `VITE_API_URL` at client build time.

Use a managed migration step in the release pipeline. Do not run the demo seed in production.

## Decisions and tradeoffs

- A small repository/service split makes SQL and HTTP behavior testable without an ORM.
- `PUT` validates a complete editable employee representation, keeping the API contract simple.
- Pagination uses a window count for the common one-query path and a count fallback when a deletion leaves a page empty.
- Search uses `ILIKE '%term%'`; at much larger scale, PostgreSQL trigram indexing would be appropriate.
- Toasts are a tiny local implementation; Radix is reserved for the focus-sensitive modal interactions.

## Manual acceptance checklist

- Add, refresh, edit, and delete an employee
- Attempt a duplicate email with different casing
- Submit invalid email and empty fields
- Search for matching and nonexistent names
- Navigate multiple pages and delete the last row on a page
- Review empty-database and unavailable-API states
- Check desktop and narrow mobile layouts


## Screenshots

<img width="1920" height="1080" alt="Screenshot (161)" src="https://github.com/user-attachments/assets/5473ce59-35ee-40cf-be42-16ab47ef5309" />
<img width="1920" height="1080" alt="Screenshot (171)" src="https://github.com/user-attachments/assets/d50fd6be-4b08-498f-aa9d-880ff29d4dc3" />
<img width="1920" height="1080" alt="Screenshot (170)" src="https://github.com/user-attachments/assets/8c0fac26-41ee-4d2b-a3a0-4378caad3ba2" />
<img width="1920" height="1080" alt="Screenshot (169)" src="https://github.com/user-attachments/assets/6c3cc880-4111-4bbc-a4c9-1e5db2b77b68" />
<img width="1920" height="1080" alt="Screenshot (163)" src="https://github.com/user-attachments/assets/4af55e5e-5ddd-4bc3-a2ca-dcd327b94572" />
<img width="1920" height="1080" alt="Screenshot (162)" src="https://github.com/user-attachments/assets/21c95ea7-ec70-433c-b801-3a85230d08d8" />




