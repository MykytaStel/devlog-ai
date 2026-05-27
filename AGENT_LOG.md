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

## Slice 4 — AI Provider Layer

Implemented the AI provider abstraction before building concrete agents.

Implemented:

- `AiProvider` interface
- `MockAiProvider`
- `OpenAiProvider`
- provider resolver based on `AI_PROVIDER`
- `/api/ai/health` endpoint
- temporary AI route stubs with provider health info

Why this matters:

- The assignment allows mocked LLM calls if documented.
- The app can run locally without real API keys.
- Future agents do not depend directly on OpenAI SDK.
- Reviewers can set `AI_PROVIDER=openai` and provide `OPENAI_API_KEY` to test real AI behavior.

Manual decisions:

- Mock mode is the default to keep `npm install && npm run dev` friction-free.
- OpenAI is isolated behind an interface.
- Agent routes remain `501 Not Implemented` until the actual prioritization and decomposition slices are implemented.

## Slice 5 — Prioritization Agent

Implemented the first in-product AI agent required by the assignment.

Feature:

- `POST /api/ai/prioritize`
- "Plan my day" action in the UI

Agent workflow:

1. Load all tasks from the repository.
2. Calculate local task signals:
   - priority
   - status
   - age
   - description clarity
3. Exclude completed work from the main recommendation set.
4. Build a shortlist of actionable tasks.
5. Send structured context to the AI provider.
6. Validate the provider response with Zod.
7. Return a human-readable day plan with reasoning and risks.

Why this is agentic:

This is not a single prompt directly attached to a button.
The agent first gathers context, evaluates task metadata, calculates local decision signals, builds a shortlist, and only then asks the provider to turn the context into a practical recommendation.

Manual decisions:

- I kept deterministic local scoring before the LLM call so the feature remains useful in mock mode.
- I kept the mock provider as the default so reviewers can run the app without API keys.
- I exposed agent steps in the UI to make the behavior explainable.
- I filtered invalid task IDs from provider output to avoid showing hallucinated tasks.