# Architecture and Engineering Decisions

**Project:** Pineco — Intelligent Brand Governance Platform  
**Date:** 22 October 2026  
**Context:** Enterprise Release Build  

---

## Decision 1: Monorepo Structure (`apps/web` & `apps/api`)
- **Status:** Accepted
- **Context:** TRS Section 3 specifies a monorepo containing `apps/web` (Next.js) and `apps/api` (FastAPI) with shared docs, root scripts, and test suites.
- **Decision:** Structure the repository as:
  ```text
  pineco/
  ├── apps/
  │   ├── web/        # Next.js 15+ App Router, React, Tailwind CSS, TypeScript
  │   └── api/        # FastAPI, Pydantic v2, SQLAlchemy 2.0, Alembic migrations
  ├── docs/           # PRD, SRS, TRS, implementation, security, decisions
  ├── tests/          # End-to-end and integration verification tests
  ├── .env.example
  ├── .gitignore
  └── README.md
  ```

---

## Decision 2: Dual Database Engine Support (PostgreSQL Primary + SQLite Dev/Test)
- **Status:** Accepted
- **Context:** The production target is Render PostgreSQL. In local or automated test environments, requiring a live running PostgreSQL server with pre-configured credentials can hinder reproducible zero-friction setup for automated test runners or CI environments.
- **Decision:** Implement database connectivity using SQLAlchemy 2.0 with full PostgreSQL dialect support (foreign keys, UUIDs, UTC timestamps, JSON, indexes) as the primary engine when `DATABASE_URL` is set to a postgres connection string (`postgresql://...` or `postgresql+asyncpg://...` / `psycopg`). When `DATABASE_URL` is unset or points to `sqlite:///...`, use SQLite with SQLite foreign-key pragma enabled. This guarantees 100% test reproducibility anywhere while remaining fully production-ready for Render PostgreSQL.

---

## Decision 3: Resilient LLM Adapter with Strict Output Validation and Safe Fallbacks
- **Status:** Accepted
- **Context:** Enterprise environments must function reliably whether or not an active external LLM key is configured on the host machine. If an LLM key is missing, expired, or returns malformed JSON, the application must NEVER crash, fabricate fake compliant scores, or erase deterministic findings.
- **Decision:** Implement a backend provider adapter (`LLMAdapter`) that:
  1. Accepts configuration for standard providers (OpenAI-compatible, Google Gemini, Anthropic, Groq).
  2. If the API key is absent or the model call fails/times out, records a clear `completed_with_warnings` status with a descriptive warning banner ("AI analysis unavailable; deterministic checks completed").
  3. Validates model JSON output strictly against the Pydantic schema (`AIReviewResponseSchema`).
  4. Validates any returned `fact_ids` against actual database records retrieved for that workspace. Discards any non-existent, expired, or unapproved fact IDs.
  5. Never claims a claim is "supported" unless backed by valid retrieved facts.

---

## Decision 4: Immutable Content Versioning and Human-Centric Review
- **Status:** Accepted
- **Context:** Content governance requires strict non-repudiation. Once submitted or revised, earlier versions and findings must remain intact and immutable.
- **Decision:** Every content submission creates version 1 with a SHA-256 hash. Any edit creates an explicit new version record (v2, v3, etc.) referencing the same submission. Review decisions (Approve, Request Changes, Override) link strictly to the exact `content_version_id` reviewed. Overriding any finding strictly requires a non-empty rationale string.
