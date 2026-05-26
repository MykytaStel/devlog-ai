# DevLog

DevLog is a local-first task tracker for engineering teams with an AI agent layer.

The goal is to reduce friction around day planning, task decomposition, and async status updates.

## Tech Stack

- Next.js
- TypeScript
- Prisma
- SQLite
- Zod
- Tailwind CSS
- AI provider abstraction with mock mode

## Getting Started

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
```

Open:

`http://localhost:3000`

Environment Variables

```bash
DATABASE_URL="file:./dev.db"
AI_PROVIDER="mock"
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-4o-mini"
```

## Architecture

The app is intentionally small but structured:

src/app              Next.js pages and API routes
src/components       UI components
src/features         domain types and validation
src/server/db        Prisma client
src/server/repositories data access layer
src/server/agents    AI agent orchestration
src/server/ai        AI provider abstraction
Storage Decision

SQLite was chosen because the assignment describes one user and one team, with local execution only.

## Limitations:

- no authentication
- no multi-user sync
- no production deployment
- no distributed database

Planned AI Agents
Prioritization Agent

Analyzes current tasks and recommends what to start with based on:

- priority
- age
- status
- task context
- Decomposition Agent

Analyzes a task and either:

- asks a clarification question if the task is vague
- generates structured subtasks if the task is clear enough

## Implemented:

- local persistence
- task model
- repository layer
- validation foundation
- Task CRUD API
- SQLite persistence
- Server-side filtering by task status
- Server-side sorting by creation date or priority
- Zod validation for task input
- Repository layer for database access

## Planned:

CRUD API
task UI
AI prioritization
AI decomposition

## API

### Tasks

```http
GET /api/tasks
GET /api/tasks?status=todo
GET /api/tasks?sort=priority
POST /api/tasks
GET /api/tasks/:id
PATCH /api/tasks/:id
DELETE /api/tasks/:id
```