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