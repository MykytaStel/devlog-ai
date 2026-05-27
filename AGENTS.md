# DevLog — Agent Instructions

## Project Context
DevLog is a local-first task tracker with an AI agent layer. Built with Next.js App Router, Prisma (SQLite), and TypeScript.

## For Coding Agents
- Always read `node_modules/next/dist/docs/` before writing Next.js code — this version may differ from training data
- Use the repository layer (`src/server/repositories/`) for all DB access — do not call Prisma directly from agents or route handlers
- AI agent logic lives in `src/server/agents/` — keep orchestration there, not in API routes
- Use the `AiProvider` interface (`src/server/ai/ai-provider.ts`) — never import OpenAI directly outside the provider layer
- All API input must be validated with Zod schemas defined in `src/features/`
- Run `npm test` and `npm run lint` before committing

## Key Constraints
- No authentication (out of scope)
- SQLite only — no migrations to Postgres without explicit instruction
- Mock AI provider is default — do not change `AI_PROVIDER` in `.env` without asking

## Testing
- Tests live alongside agents in `src/server/agents/*.test.ts`
- Shared fixtures are in `src/server/agents/__fixtures__/` — add new fixtures there, do not inline them in test files
- Run: `npm test` (vitest), `npm run lint` (eslint)
- Test the key decision branches in agents: empty task list, vague tasks, hallucinated IDs

## Known Gotchas
- **Prisma 7 requires an explicit SQLite driver adapter** (`@prisma/adapter-better-sqlite3`). Do not remove or bypass it — without it, all DB calls return 500 errors
- **Prompt assembly**: join system prompt lines with `"\n"` (actual newline), not `"\\n"` (literal backslash-n)
- **Dev server**: open `http://localhost:3000`, not `http://127.0.0.1:3000` — HMR is host-sensitive in this setup

## Key Files
| File | Purpose |
| :--- | :--- |
| `src/server/ai/ai-provider.ts` | `AiProvider` interface — the only contract agents use |
| `src/server/ai/get-ai-provider.ts` | Resolves mock vs OpenAI from `AI_PROVIDER` env var |
| `src/server/repositories/task.repository.ts` | All DB access — use this, never call Prisma directly |
| `src/server/agents/task-scoring.ts` | Local signal scoring used before any LLM call |
| `src/features/ai/` | Zod schemas for structured AI output |
| `src/features/tasks/` | Task DTOs and validation schemas |
| `.env.example` | All supported environment variables with defaults |
