# AGENT_LOG.md

## Project

DevLog — a small engineering task tracker with an AI agent layer.

## Assignment focus

The assignment asks for a basic task tracker with AI-assisted workflows.
The important part is not only CRUD, but also showing how I use coding agents during development and how AI features are integrated into the product.

## Tools used

- ChatGPT — planning, architecture discussion, code review, implementation guidance.
- Manual development — final decisions, code integration, testing, and trade-off decisions.

## Current implementation process

### Slice 1 — Project foundation

I used the agent to plan the architecture and scaffold the initial structure:

- Next.js App Router
- Prisma
- SQLite
- repository layer
- task validation with Zod
- environment setup

I manually decided to keep the architecture small and local-first because the assignment does not require authentication, deployment, or multi-user functionality.

## Storage decision

SQLite is used because this is a local single-user test project.

Limitations:

- no multi-user collaboration
- no distributed storage
- no production-grade scaling
- local file-based database only

This is acceptable for the assignment scope and keeps the project easy to run locally.

## Next slices

- Task CRUD API
- Task UI
- AI provider abstraction
- Prioritization agent
- Decomposition agent

## Slice 2 — Task CRUD API

I used the agent to help structure the API routes and validation flow.

Implemented:

- `GET /api/tasks`
- `POST /api/tasks`
- `GET /api/tasks/:id`
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`

The implementation follows a small layered architecture:

- API routes handle HTTP concerns.
- Zod schemas validate input.
- Repository layer owns database access.
- Shared response helpers keep route handlers small.

Manual decisions:

- I kept filtering and sorting server-side because the assignment expects a real tracker, not only client-side state.
- I added structured validation errors for easier debugging.
- I avoided authentication because the assignment explicitly describes one user and one team.

## Fix — Prisma 7 SQLite adapter

During CRUD API testing, the `/api/tasks` endpoint returned a 500 error.

Root cause:

- Prisma 7 requires a driver adapter when creating `PrismaClient`.
- The initial implementation used `new PrismaClient()` without an adapter.
- Since the project uses SQLite, I added `@prisma/adapter-better-sqlite3`.

Manual decision:

- I kept SQLite because it matches the local-first scope of the assignment.
- I avoided switching to Postgres because that would add unnecessary setup friction for reviewers.
- The app remains runnable locally with `npm install && npm run dev`.

## Slice 3 — Task CRUD UI

I used the agent to scaffold the first version of the UI because the assignment explicitly expects the frontend to be scaffolded with help from a coding agent.

Implemented:

- task list
- task creation form
- task editing flow
- task deletion flow
- quick status update
- status filter
- sorting by creation date or priority
- loading state
- empty state
- basic error state
- AI placeholder panel for upcoming agent features

Manual decisions:

- I kept the UI as a single-page local dashboard because the assignment does not require authentication or multiple workspaces.
- I added a right-side panel for the task form and future AI actions to keep the workflow compact.
- I kept the AI panel visible but inactive in this slice to show where the prioritization and decomposition agents will be integrated next.
- I avoided drag-and-drop because it is not required and would increase scope.