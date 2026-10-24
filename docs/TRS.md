# Pineco --- Technical Requirements Specification (TRS)

**Version:** 1.0 \| **Date:** 22 October 2026

## 1. Architecture decision

Use a **modular monolith** architecture. Keep the frontend and API
as separate deployables, but avoid splitting review logic into multiple
microservices before the workflow is stable.

``` text
Browser
  └── Next.js UI (Vercel)
        └── HTTPS /api/v1 → FastAPI (Render)
                              ├── PostgreSQL
                              ├── Deterministic rule engine
                              ├── Approved-fact retrieval
                              ├── LLM provider adapter
                              ├── Document parser (optional MVP extension)
                              └── Audit/event writer
```

## 2. Technology baseline

  -----------------------------------------------------------------------
  Layer                   Required choice         Notes
  ----------------------- ----------------------- -----------------------
  Frontend                Next.js + React +       App Router is
                          TypeScript              acceptable

  Styling                 Tailwind CSS            Use accessible
                                                  form/control patterns

  Backend                 Python + FastAPI +      Typed request/response
                          Pydantic                models

  Database                PostgreSQL              Managed database
                                                  preferred

  Retrieval               SQL/lexical matching    Do not block MVP on
                          first; pgvector         embeddings
                          optional                

  AI                      LLM API behind a        API key only on backend
                          provider adapter        

  Parsing                 PyMuPDF for PDF,        Optional until text
                          python-docx for DOCX    workflow is stable

  Image analysis          OpenCV or image model   Round 3/secondary
                                                  unless reliable

  Frontend hosting        Vercel                  Configure production
                                                  API base URL

  Backend hosting         Render                  Configure health check
                                                  and secrets

  Testing                 pytest,                 Add deterministic
                          HTTPX/TestClient;       fixtures
                          frontend smoke/manual   
                          tests                   

  Version control         Git + GitHub            No secrets or user
                                                  documents in repo
  -----------------------------------------------------------------------

Exact library versions should be pinned in lock/requirements files at
implementation time and tested together. Avoid unbounded `latest`
dependencies for the submission build.

## 3. Repository layout

Recommended monorepo:

``` text
pineco/
├── apps/
│   ├── web/                 # Next.js frontend
│   └── api/                 # FastAPI backend
├── docs/
│   ├── PRD.md
│   ├── SRS.md
│   ├── TRS.md
│   ├── implementation.md
│   └── security.md
├── tests/
│   ├── fixtures/
│   └── e2e/                 # Optional smoke tests
├── .env.example
├── .gitignore
└── README.md
```

If the team already has separate repositories, keep them separate rather
than spending Round 2 time on a migration; place the docs in the main
repo and link the API repo.

## 4. Environment variables

Frontend: - `NEXT_PUBLIC_API_BASE_URL` --- deployed API origin plus
`/api/v1` if the frontend expects the versioned base. -
`NEXT_PUBLIC_DEMO_MODE` --- optional UI hint only; never a security
control.

Backend: - `DATABASE_URL` --- PostgreSQL connection string. -
`LLM_API_KEY` --- provider secret. - `LLM_BASE_URL` / `LLM_MODEL` ---
optional provider configuration. - `APP_ENV` --- `development` or
`production`. - `CORS_ORIGINS` --- comma-separated exact allowed
origins. - `AUTH_SECRET` or identity-provider configuration --- if
application auth is implemented. - `MAX_UPLOAD_MB` --- configured upload
limit. - `LOG_LEVEL` --- safe operational logging level.

Never prefix secrets with `NEXT_PUBLIC_`. Provide placeholder values
only in `.env.example`.

## 5. Domain model

### `brand_rules`

`id`, `workspace_id`, `name`, `category`, `description`, `pattern`,
`preferred_replacement`, `severity`, `channel_scope`, `enabled`,
`version`, `created_by`, `created_at`, `updated_at`.

### `approved_facts`

`id`, `workspace_id`, `statement`, `source_title`, `source_reference`,
`source_url`, `owner`, `approval_status`, `valid_from`, `valid_until`,
`created_by`, `created_at`.

### `submissions`

`id`, `workspace_id`, `title`, `channel`, `created_by`, `status`,
`current_version_id`, `created_at`, `updated_at`.

### `content_versions`

`id`, `submission_id`, `version_number`, `content_text`, `content_hash`,
`created_by`, `created_at`.

### `reviews`

`id`, `submission_id`, `content_version_id`, `status`, `engine_version`,
`started_at`, `completed_at`, `error_code`, `warning_summary`.

### `findings`

`id`, `review_id`, `category`, `severity`, `confidence`, `excerpt`,
`start_offset`, `end_offset`, `explanation`, `evidence_status`,
`rule_id`, `fact_id`, `suggested_correction`, `resolution_status`,
`created_at`.

### `review_decisions`

`id`, `submission_id`, `content_version_id`, `review_id`, `decision`,
`rationale`, `reviewer_id`, `created_at`.

### `audit_events`

`id`, `workspace_id`, `actor_id`, `entity_type`, `entity_id`,
`event_type`, `metadata_json`, `created_at`.

Use UUID IDs, foreign keys, UTC timestamps and indexes. If
authentication is not finished, still include a stable demo actor ID and
workspace ID, but do not represent this as production-ready multi-user
security.

## 6. Review pipeline

1.  Validate request and workspace access.
2.  Create submission/version record and content hash.
3.  Load enabled rules and valid approved facts for that workspace and
    context.
4.  Run deterministic checks:
    -   prohibited terms (case-insensitive, Unicode-normalised matching
        where practical);
    -   preferred terms/replacements;
    -   required disclaimer/phrase presence;
    -   exact known-fact checks only when the rule is explicit.
5.  Build a bounded AI prompt containing the text, relevant rules and
    candidate facts only.
6.  Require structured JSON matching a Pydantic schema. Do not accept
    arbitrary prose as successful structured output.
7.  Validate each AI-provided source reference against retrieved
    database IDs. Ignore invented IDs or URLs.
8.  Combine results, deduplicate cautiously, and preserve the source of
    each finding (`rule_engine` or `llm`).
9.  Persist findings and review completion/warnings.
10. Write audit event and return review ID/status.
11. A human reviewer decides on the exact version.

If the LLM fails, preserve deterministic findings and return
`completed_with_warnings`; if the deterministic engine fails, fail the
review visibly rather than pretending it passed.

## 7. Suggested structured AI contract

Request fields: - `content_text` - `channel` - `rules[]`: IDs,
categories, concise rule text - `approved_facts[]`: IDs, statement,
source title and validity metadata

Response schema:

``` json
{
  "claims": [
    {
      "claim_text": "string",
      "evidence_status": "supported | contradicted | unverified | needs_human_review",
      "fact_ids": ["uuid"],
      "explanation": "string",
      "confidence": 0.0,
      "suggested_correction": "string or null"
    }
  ],
  "style_findings": [
    {
      "category": "tone | messaging | terminology | other",
      "excerpt": "string",
      "severity": "low | medium | high",
      "explanation": "string",
      "suggested_correction": "string or null",
      "confidence": 0.0
    }
  ]
}
```

Validate enums, lengths, number ranges and referenced fact IDs. The
model may suggest a finding, but the backend assigns trusted database
IDs and checks source validity.

## 8. API conventions

-   Prefix endpoints with `/api/v1`.
-   Use Pydantic request and response models.
-   Use consistent errors:
    `{"error":{"code":"...","message":"...","request_id":"..."}}`.
-   Add pagination for list endpoints if needed.
-   Use request timeouts for external calls.
-   Configure CORS to the exact frontend origin(s).
-   Keep API docs available for development; restrict or disable public
    interactive docs in production if they expose sensitive
    implementation details.

## 9. Frontend screens

1.  **Dashboard:** submissions, status counts, recent reviews and
    start-review CTA.
2.  **Brand Knowledge:** rules list/create/edit and approved facts.
3.  **New Review:** title, channel, content textarea, optional file
    input.
4.  **Review Results:** severity/category filters, excerpt, evidence,
    rule/source, correction and status.
5.  **Submission Detail:** version history and audit timeline.
6.  **Reviewer Queue/Decision:** approve, request changes, override with
    rationale.
7.  **Demo guide:** small, visible instructions and reset-to-seed-data
    option.

Each screen needs loading, empty, success, partial-warning and error
states. Never show a green "compliant" badge merely because an API call
returned 200; base it on actual findings and policy.

## 10. Deployment

### Vercel

-   Set `NEXT_PUBLIC_API_BASE_URL` to the deployed HTTPS API.
-   Add only public configuration variables.
-   Test production build and direct navigation to nested routes.
-   Check browser console and network requests.

### Render

-   Use a pinned Python dependency file.
-   Configure the start command for the FastAPI app and bind to the
    platform-provided port.
-   Set health check to `/api/v1/health`.
-   Add database and LLM secrets through the host's secret environment
    settings.
-   Configure exact CORS origins.
-   Confirm database migrations run safely and do not erase data on
    redeploy.

### PostgreSQL

-   Apply migrations explicitly.
-   Use a non-owner application database role with least privilege where
    possible.
-   Test connection limits and SSL requirements.
-   Back up seed/required data and avoid relying on ephemeral local disk
    for persistent uploads.

## 11. Observability and reliability

Log request ID, endpoint, duration, status and dependency failure
category. Do not log full content or secrets by default. Track LLM
latency and token/cost usage where provider metadata permits. Add a
request timeout and a graceful error state. Health checks should
distinguish process health from database/provider readiness if
practical.

## 12. Test strategy

-   Unit tests: rule matching, validity dates, evidence classification
    and status transitions.
-   API tests: create rule/fact/submission, review, versioning and
    decisions.
-   Contract tests: invalid LLM response, invented fact ID, timeout,
    empty content.
-   Security tests: wrong workspace, invalid role, oversized file,
    unsupported extension, injection-like content.
-   Deployment smoke test: health endpoint, seeded dashboard, run a
    sample review, revise, approve, inspect audit.
