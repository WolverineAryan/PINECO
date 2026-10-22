# Pineco --- Implementation Plan

**CodeAxis Hackathon \| Round 2 --- The Build \| 22--25 October 2026**\
**Purpose:** executable build order and team coordination plan. Follow
this document in sequence; do not start optional features until the
end-to-end workflow works on the deployed URL.

## 1. Definition of done

A judge can open the deployed Pineco URL, use seeded demo data, add or
inspect a rule, submit content, run review, see explainable findings,
revise content, rerun review, and record a reviewer decision. The
repository contains setup instructions and no secrets. All claims in the
submission PDF match what is actually implemented.

## 2. Build strategy

**Vertical slice first:** make one complete user journey work before
broadening the feature set. Prefer a reliable pasted-text workflow over
rushed upload, vector search or image AI.

### Day 1 --- 22 October: foundation + deterministic review

-   [ ] Confirm repository structure and ownership.
-   [ ] Create Next.js app and FastAPI app; establish local run
    commands.
-   [ ] Configure PostgreSQL and migrations/schema.
-   [ ] Add `/api/v1/health` and a frontend API connection test.
-   [ ] Seed a workspace, three rules, three approved facts and two
    sample submissions.
-   [ ] Implement create/list rules and facts.
-   [ ] Implement text submission and immutable version 1.
-   [ ] Implement deterministic terminology and required-disclaimer
    checks.
-   [ ] Display findings in a basic results page.
-   **Checkpoint:** a seeded violation is found correctly from the local
    UI through the API and database.

### Day 2 --- 23 October: AI + evidence + workflow

-   [ ] Add LLM provider adapter using server-only secret.
-   [ ] Define Pydantic response schema and validate model output.
-   [ ] Extract claims and classify evidence against approved facts.
-   [ ] Ensure missing evidence becomes Unverified/Needs human review.
-   [ ] Persist review, findings, warnings and audit events.
-   [ ] Implement revision as a new content version.
-   [ ] Implement reviewer decisions: approve, request changes, override
    with rationale.
-   [ ] Add status timeline and version history.
-   **Checkpoint:** complete journey works locally, including a provider
    failure fallback.

### Day 3 --- 24 October: deploy + harden + judge usability

-   [ ] Deploy API to Render and configure HTTPS, CORS and secrets.
-   [ ] Deploy frontend to Vercel and set production API URL.
-   [ ] Apply production database migrations and seed demo records.
-   [ ] Test the complete journey from a clean browser session.
-   [ ] Add friendly loading, empty, warning and failure states.
-   [ ] Test unauthorized access paths and file validation if upload
    exists.
-   [ ] Fix all broken links, console errors and mobile layout blockers.
-   [ ] Update README and documentation to reflect actual behaviour.
-   **Checkpoint:** an external tester can complete the core workflow
    without a developer.

### Day 4 --- 25 October before 10:00 AM IST: freeze + submit

-   [ ] Freeze features; accept only high-impact bug fixes.
-   [ ] Verify the public app URL and GitHub repository permissions.
-   [ ] Verify all required docs and updated PDF are in the repository.
-   [ ] Prepare the list of completed features and three Round 3
    improvements.
-   [ ] Record a short backup demo walkthrough if permitted by event
    rules.
-   [ ] Submit the Round 2 form before the deadline.
-   **Final gate:** do not claim a feature as completed unless it has
    been tested on the deployed build.

## 3. Work split --- two team members

### Member 1 --- Frontend and product workflow

Own: - Next.js/React/Tailwind UI and navigation. - Dashboard, brand
rules/facts screens, content submission. - Review findings and evidence
presentation. - Revision editor and version history. - Reviewer decision
screen and audit timeline. - Vercel deployment and browser smoke tests.

Deliverable contract: - Use documented API endpoints and typed response
models. - Show loading/error/warning states. - Never hardcode successful
review findings in the production path. - Provide an API-unavailable
message that helps diagnose configuration without exposing secrets.

### Member 2 --- Backend and AI governance

Own: - FastAPI project, Pydantic models and API contracts. - PostgreSQL
schema/migrations and seed data. - Deterministic rule engine. -
Approved-fact retrieval and evidence classification. - LLM adapter and
output validation. - Review/version/decision/audit persistence. - Render
deployment and API tests.

Deliverable contract: - Endpoints return stable schemas and meaningful
status codes. - AI failures never erase deterministic findings. - All
findings reference a rule/source when available. - Secrets and full
document content are not logged. - Seed script is repeatable and safe to
run.

### Shared responsibilities

-   Agree on API response shapes before parallel work.
-   Review each other's pull requests.
-   Test one end-to-end path together at least twice daily.
-   Maintain one source of truth for feature status.
-   Keep a known-good deployed version; do not deploy untested large
    changes near submission.

## 4. Suggested repo and commands

``` text
pineco/
  apps/web/      # Next.js
  apps/api/      # FastAPI
  docs/          # this specification set
  .env.example
  README.md
```

Suggested local workflow: 1. Create `.env` from `.env.example` (never
commit `.env`). 2. Start PostgreSQL locally or use a protected
development database. 3. Run backend migrations and seed data. 4. Start
FastAPI on a local port. 5. Start Next.js with the API base URL
configured. 6. Run backend tests and the manual end-to-end checklist.

Document the exact commands chosen by the team in `README.md`; do not
leave placeholder commands in the final repository.

## 5. Minimum API implementation order

1.  `GET /api/v1/health`
2.  `GET/POST /api/v1/rules`, `PATCH /api/v1/rules/{id}`
3.  `GET/POST /api/v1/facts`
4.  `GET/POST /api/v1/submissions`
5.  `GET /api/v1/submissions/{id}`
6.  `POST /api/v1/submissions/{id}/reviews`
7.  `GET /api/v1/reviews/{id}`
8.  `POST /api/v1/submissions/{id}/versions`
9.  `POST /api/v1/reviews/{id}/decision`
10. `POST /api/v1/findings/{id}/override`
11. `GET /api/v1/submissions/{id}/audit`
12. `GET /api/v1/dashboard/summary`

A reduced set is acceptable if the same workflow is delivered, but avoid
adding endpoints that the UI does not use.

## 6. MVP review algorithm

``` text
review(content_version):
  validate content and access
  load enabled rules + currently approved facts
  deterministic_findings = run_rule_engine(content, rules)
  try:
      model_result = call_llm(relevant_content, relevant_rules, candidate_facts)
      parsed = validate_with_schema(model_result)
      ai_findings = validate_references_and_classify(parsed, candidate_facts)
  except provider/schema/timeout error:
      ai_findings = []
      warning = "AI analysis unavailable; deterministic checks completed"
  findings = merge_without_erasing_source(deterministic_findings, ai_findings)
  persist review + findings + warning + audit event
  return persisted result
```

Rules: - Use exact/controlled matching for deterministic findings. -
Keep the original content and content hash. - Never trust fact IDs or
URLs invented by the model. - A claim is not "supported" merely because
it sounds plausible. - Do not use an unapproved or expired fact as
current evidence. - Store confidence as a model estimate, not a
calibrated probability. - A completed automated review is not equivalent
to human approval.

## 7. UI acceptance checklist

-   [ ] First screen explains Pineco in one sentence.
-   [ ] Demo workspace is obvious and can be entered without hidden
    setup.
-   [ ] Seeded examples let judges see the product immediately.
-   [ ] Each primary action has clear success/failure feedback.
-   [ ] Findings show the affected excerpt and why it was flagged.
-   [ ] Evidence status and source are visible.
-   [ ] Suggested corrections are optional and never overwrite the
    original silently.
-   [ ] Revisions create new versions.
-   [ ] Approval references the exact version reviewed.
-   [ ] Override requires a reason.
-   [ ] Empty/loading/partial-failure states are understandable.
-   [ ] The deployed URL works in a private/incognito browser window.

## 8. Deployment smoke test

-   [ ] Frontend loads over HTTPS.
-   [ ] Backend health endpoint responds.
-   [ ] Frontend calls the deployed backend, not localhost.
-   [ ] CORS allows the actual production frontend origin.
-   [ ] Database persists records across redeploy/restart.
-   [ ] AI key is configured server-side; no key appears in browser
    bundle or logs.
-   [ ] Seeded demo rules/facts exist.
-   [ ] Create rule → submit text → run review → inspect finding →
    revise → rerun → approve works.
-   [ ] Provider failure is visible and deterministic findings remain
    available.
-   [ ] No test route exposes sensitive records or stack traces.

## 9. Submission checklist

-   Working project URL.
-   Source-code repository URL with judge access.
-   Updated project PDF consistent with deployed functionality.
-   Completed-features list (only verified features).
-   Technology and implementation summary.
-   Explanation of deviations from Round 1 plan.
-   Three substantial Round 3 improvements: ProofGraph, Visual Brand
    DNA, Guideline Ambiguity Analytics.
-   A concise README with demo instructions, test credentials if used,
    known limitations and contact/team details.
