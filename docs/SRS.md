# Pineco --- Software Requirements Specification (SRS)

**Version:** 1.0 \| **Date:** 22 October 2026 \| **Target:** CodeAxis
Round 2 MVP

## 1. Purpose

This document defines the externally observable behaviour and
constraints for the Pineco MVP. It is intended for implementation,
testing and judging.

## 2. System overview

Pineco is a web application with a Next.js frontend and a FastAPI
backend deployed separately. PostgreSQL stores workspaces, users/roles,
brand rules, approved facts, submissions, versions, findings, review
decisions and audit events. An LLM provider is called only from the
backend. Optional vector retrieval may use pgvector; MVP retrieval can
use metadata filters and lexical matching if vector search is not ready.

## 3. Actors

-   **Creator:** submit, view, revise and resubmit content.
-   **Brand manager:** manage brand rules and approved facts.
-   **Reviewer:** inspect findings and decide on a version.
-   **Administrator:** manage workspace settings and membership.
-   **Demo visitor:** limited, clearly labelled demonstration access if
    full authentication cannot be completed in time.

## 4. Assumptions and constraints

-   The Round 2 period is 22--25 October 2026.
-   A stable, deployed core workflow is more important than breadth of
    features.
-   Approved internal sources are authoritative for claim verification;
    external web search is not an automatic substitute.
-   The LLM may return incomplete or incorrect analysis; output must be
    schema-validated and treated as advisory.
-   PDF/DOCX parsing and visual checks are secondary to a reliable text
    workflow.
-   The frontend is deployed on Vercel and the API on Render; PostgreSQL
    must be reachable from the API service.
-   Provider keys and database credentials must never be exposed to
    browser code or committed to source control.

## 5. Functional requirements

### 5.1 Workspace and access

-   The system shall associate each business record with a workspace.
-   The system shall enforce workspace scoping in API queries.
-   The system shall enforce role permissions on the server, not only by
    hiding UI controls.
-   If a demo bypass is used, it shall be restricted to non-sensitive
    seeded data and clearly labelled.

### 5.2 Brand knowledge

-   A rule shall include name, category, description/pattern, severity,
    scope/channel, enabled state, owner and version metadata where
    feasible.
-   Rule categories shall include terminology, tone/messaging, required
    disclaimer and factual policy.
-   An approved fact shall include a statement, source title/reference,
    owner, approval state, valid-from/valid-until dates and optional URL
    or document reference.
-   Expired or unapproved facts shall not be treated as current
    authoritative evidence.

### 5.3 Content submission and versioning

-   The system shall accept pasted text as the baseline input.
-   Each submission shall have a unique ID, workspace, title, channel,
    creator, status and creation timestamp.
-   Each edit/resubmission shall create a new version; prior versions
    shall remain read-only.
-   Supported file uploads shall be type- and size-validated before
    parsing.
-   The system shall not execute macros, embedded scripts, or active
    content from uploaded files.

### 5.4 Review engine

-   Deterministic checks shall run independently of the LLM and produce
    repeatable results.
-   The AI service shall receive only the content and relevant
    rules/facts needed for the review.
-   AI output shall be parsed against a strict schema. Invalid output
    shall be retried at most once if appropriate, then return a visible
    error or partial-result warning.
-   Claim status shall be one of Supported, Contradicted, Unverified, or
    Needs human review.
-   A Supported or Contradicted label shall require a clear match to
    approved evidence and conservative matching criteria.
-   Findings shall include category, severity, confidence, excerpt,
    explanation, source/rule references, suggested correction if
    available, and creation time.
-   Confidence and severity shall be separate fields.

### 5.5 Human review

-   A reviewer shall be able to approve a specific content version,
    request changes, or override a finding.
-   An override shall require a rationale.
-   An approval shall reference the exact version reviewed.
-   Editing content after approval shall create a new version and reset
    approval for that new version.
-   The system shall preserve the previous decision and audit event.

### 5.6 Audit and reporting

-   The system shall record key events such as submission creation,
    version creation, review start/completion, reviewer decision,
    override and rule/fact edits.
-   A basic dashboard may aggregate findings by category and status from
    persisted records.
-   Audit records shall not be editable through normal user-facing
    endpoints.

## 6. Data requirements

Minimum entities: - `workspaces` - `users` (or provider identity
mapping) - `workspace_memberships` - `brand_rules` - `approved_facts` -
`submissions` - `content_versions` - `reviews` - `findings` -
`review_decisions` - `audit_events`

Use UUID primary keys, UTC timestamps, foreign keys, database
constraints and indexes on workspace IDs, submission IDs, status and
created timestamps. Store file objects in private object storage or a
protected service directory only for a temporary demo; avoid public
permanent file URLs for confidential documents.

## 7. API requirements

The API shall be versioned under `/api/v1`, return JSON, validate
request bodies and use consistent error envelopes.

  ------------------------------------------------------------------------------------------
  Method                  Endpoint                                   Purpose
  ----------------------- ------------------------------------------ -----------------------
  GET                     `/api/v1/health`                           Health/readiness check

  GET/POST                `/api/v1/rules`                            List/create brand rules

  PATCH                   `/api/v1/rules/{rule_id}`                  Update rule

  GET/POST                `/api/v1/facts`                            List/create approved
                                                                     facts

  GET/POST                `/api/v1/submissions`                      List/create submission

  GET                     `/api/v1/submissions/{id}`                 Submission details and
                                                                     versions

  POST                    `/api/v1/submissions/{id}/versions`        Create revised version

  POST                    `/api/v1/submissions/{id}/reviews`         Start a review for a
                                                                     version

  GET                     `/api/v1/reviews/{review_id}`              Review status and
                                                                     findings

  POST                    `/api/v1/reviews/{review_id}/decision`     Approve/request changes

  POST                    `/api/v1/findings/{finding_id}/override`   Override with required
                                                                     rationale

  GET                     `/api/v1/submissions/{id}/audit`           Audit history

  GET                     `/api/v1/dashboard/summary`                Basic persisted metrics
  ------------------------------------------------------------------------------------------

The exact endpoint set may be reduced for the hackathon, but the user
journey and data integrity rules must remain intact.

## 8. Status model

-   Submission: `draft`, `in_review`, `changes_requested`, `approved`,
    `review_failed`.
-   Review: `queued`, `running`, `completed`, `completed_with_warnings`,
    `failed`.
-   Finding resolution: `open`, `accepted`, `dismissed_with_reason`,
    `needs_human_review`, `overridden`.
-   Claim evidence: `supported`, `contradicted`, `unverified`,
    `needs_human_review`.
-   Decision: `approved`, `changes_requested`, `overridden`.

Do not mark a submission `approved` merely because the automated scan
completed.

## 9. Error handling

-   `400` invalid input, `401` unauthenticated, `403` forbidden, `404`
    absent/not accessible, `413` upload too large, `415` unsupported
    file type, `422` schema/semantic validation, `429` rate limited,
    `500` unexpected server error, `503` dependency unavailable.
-   Return a safe message and correlation/request ID; do not return
    stack traces, API keys, SQL or raw provider responses.
-   Partial review results must be labelled as partial.

## 10. Acceptance tests

1.  A valid rule can be created and remains after page refresh.
2.  A prohibited term produces a deterministic finding with the correct
    rule ID and excerpt.
3.  A required disclaimer missing from text produces a finding.
4.  A claim matching an approved fact shows that fact as evidence; no
    matching fact results in Unverified/Needs review.
5.  A provider timeout produces a visible warning and preserves
    deterministic findings.
6.  A revised submission creates a new version and leaves the original
    unchanged.
7.  Approval references the current version only.
8.  An override without rationale is rejected.
9.  An unauthorised user cannot read or mutate another workspace's
    records.
10. Unsupported/oversized files are rejected safely.
11. Invalid AI JSON is rejected or retried and never displayed as
    trusted structured data.
12. Audit history shows the review and decision events in order.

## 11. Round 2 completion definition

The app is ready to submit when the primary workflow passes on the
deployed environment, the source repository is accessible, environment
variables are documented, the PDF and this documentation agree with
actual features, and a judge can complete the workflow without developer
intervention.
