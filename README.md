# DevLog

DevLog is a local-first task tracker for engineering teams with an AI agent layer for day planning and task decomposition.

The product is intentionally scoped for the homework assignment: one user, one team, local execution, and no production deployment.

## Tech Stack

- Next.js App Router
- React and TypeScript
- Prisma with SQLite
- Zod validation
- Tailwind CSS
- AI provider abstraction with mock and OpenAI modes

## Getting Started

The default local configuration uses SQLite and the mock AI provider, so this works without API keys:

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

Use `localhost`, not `127.0.0.1`, because the Next.js dev server HMR path is host-sensitive in this setup.

Optional environment override:

```bash
cp .env.example .env
```

```env
DATABASE_URL="file:./dev.db"
AI_PROVIDER="mock"
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-4o-mini"
```

To test real AI responses:

```env
AI_PROVIDER="openai"
OPENAI_API_KEY="your-key"
OPENAI_MODEL="gpt-4o-mini"
```

## Architecture

```text
src/app                 Next.js pages and route handlers
src/components          UI components
src/features            domain types, client APIs, validation
src/server/db           Prisma client
src/server/repositories data access layer
src/server/agents       AI agent orchestration
src/server/ai           AI provider abstraction
```

SQLite was chosen because the assignment describes one local user and one team. The tradeoff is that this is not a distributed or multi-user storage design.

## Implemented

- Task CRUD with persisted SQLite storage
- Status filtering and priority/date sorting
- Client UI for creating, editing, deleting, and quick status updates
- Zod validation for API input
- Typed DTO boundary between Prisma and the app
- AI prioritization agent with local scoring, provider call, structured validation, and explainable output
- AI decomposition agent with a clarification branch, subtask preview, and explicit create-subtasks action
- Mock AI mode for local review without real keys

Status-update generation was considered but intentionally kept out of the public API. This version focuses on two complete AI agents instead of shipping a third unfinished workflow.

## AI Agent Behavior

### Prioritization Agent

The prioritization agent:

- loads current tasks
- calculates local signals from priority, status, age, and description clarity
- builds a capped high-signal context for the AI provider
- validates structured output with Zod
- filters hallucinated task IDs before showing recommendations

### Decomposition Agent

The decomposition agent:

- loads a selected task
- checks whether the title and description are clear enough
- asks for clarification when context is weak
- generates structured subtasks when context is sufficient
- only writes subtasks after explicit user confirmation

## API

```http
GET    /api/tasks
GET    /api/tasks?status=todo
GET    /api/tasks?sort=priority
POST   /api/tasks
GET    /api/tasks/:id
PATCH  /api/tasks/:id
DELETE /api/tasks/:id
POST   /api/tasks/:id/subtasks
GET    /api/ai/health
POST   /api/ai/prioritize
POST   /api/ai/decompose
```

## Tests

```bash
npm test
npm run lint
npm run build
```

The automated tests cover task validation defaults, partial task updates, and the key decision branches in both AI agents.

## Security and Scope

- Authentication is intentionally out of scope because the assignment specifies one user and one team.
- Mutating and AI route handlers reject cross-site browser requests.
- API errors avoid exposing internal exception details to the client.
- Basic security headers are configured in `next.config.ts`.
- Real secrets must stay in `.env`; `.env.example` contains placeholders only.

For production, add authentication, authorization, rate limiting, request-size limits, audit logging, and a reverse proxy in front of `next start`.

## Graceful Shutdown

This project uses the standard Next.js App Router runtime and does not add custom signal handlers. When self-hosting with `next start`, send `SIGINT` or `SIGTERM` and allow a 10-30 second drain period so in-flight requests can finish. Custom cleanup should only be added if the app later introduces a custom production server or long-lived background workers.

## Known Dependency Audit Status

`npm audit --omit=dev` currently reports moderate advisories through upstream `next/postcss` and `prisma/@hono/node-server` dependency chains. The suggested `npm audit fix --force` path downgrades major packages, so it is not applied automatically. Re-check before submission and upgrade when compatible patched releases are available.
