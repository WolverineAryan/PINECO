# Pineco --- Security and Privacy Requirements

**Version:** 1.0 \| **Date:** 22 October 2026\
**Security posture:** hackathon MVP with production-oriented safeguards;
not a certification or security audit.

## 1. Security objectives

-   Keep brand documents, product facts and unpublished content private.
-   Prevent one workspace from reading or changing another workspace's
    data.
-   Prevent unauthorised review decisions and untraceable overrides.
-   Protect API keys, database credentials and internal prompts.
-   Treat uploaded content and LLM output as untrusted input.
-   Make failures visible without leaking internal details.

## 2. Trust boundaries and data flow

1.  Browser sends content to the Pineco API over HTTPS.
2.  API authenticates the actor and checks workspace/role access.
3.  API stores content and metadata in PostgreSQL or protected storage.
4.  API selects only relevant approved facts/rules for the review.
5.  API sends the minimum necessary context to the configured LLM
    provider.
6.  API validates the response, checks referenced fact IDs against
    database records, and persists findings.
7.  A reviewer records a decision for a specific content version.

The LLM is an untrusted analysis component, not an authority. Its output
cannot grant access, approve content, invent a trusted source, or change
a rule.

## 3. Data classification

  -----------------------------------------------------------------------
  Data                    Classification          Handling
  ----------------------- ----------------------- -----------------------
  Public brand guidelines Internal/public as      Store with workspace
                          designated by owner     scope and version
                                                  metadata

  Unpublished marketing   Confidential by default Limit access; send
  copy                                            externally only when
                                                  provider use is
                                                  configured and
                                                  disclosed

  Product facts and       Internal; may be        Preserve source, owner,
  claims                  commercially sensitive  approval and validity
                                                  metadata

  API keys and database   Secret                  Secret
  credentials                                     manager/environment
                                                  variables only; never
                                                  send to frontend

  User identities and     Personal/internal       Minimise, restrict
  audit records                                   access and avoid
                                                  unnecessary logs

  LLM prompts/responses   Potentially             Do not log full content
                          confidential            by default; apply
                                                  retention limits
  -----------------------------------------------------------------------

## 4. Authentication and authorisation

-   Use a trusted authentication provider or server-managed session for
    real multi-user use.
-   Enforce authorisation in every backend endpoint.
-   Check workspace membership for every read/write query; do not rely
    only on a client-supplied workspace ID.
-   Suggested role permissions:
    -   Creator: create submission, read own/permitted submissions,
        create revisions.
    -   Brand manager: manage rules and approved facts.
    -   Reviewer: view assigned/permitted submissions and record
        decisions.
    -   Administrator: manage membership and workspace configuration.
-   Review decisions and overrides must record the authenticated actor.
-   If a temporary demo mode bypasses authentication, restrict it to
    seeded non-sensitive data and disable mutation of real/private data.
    Clearly label the environment as a demo. Do not claim the bypass is
    secure multi-user access.

## 5. Secrets and configuration

-   Keep `LLM_API_KEY`, `DATABASE_URL`, authentication secrets and
    storage credentials on the backend host only.
-   Never use `NEXT_PUBLIC_` for secrets.
-   Add `.env`, `.env.local`, private key files, database dumps and
    uploaded user files to `.gitignore`.
-   Commit `.env.example` with placeholder values only.
-   Rotate any secret accidentally committed; deleting it from the
    latest commit is not enough if it exists in repository history.
-   Limit provider/API keys to the required service and usage quota
    where supported.

## 6. Input and upload safety

-   Validate content length and all request fields with Pydantic.
-   Set a maximum upload size and reject files over the limit with HTTP
    413.
-   Use an allowlist of file types; do not trust extension alone---check
    MIME type and file signature where feasible.
-   Store uploads outside the public web root using random
    server-generated names.
-   Do not execute macros, scripts, embedded objects or active content.
-   Apply parser timeouts and resource limits; handle malformed
    documents safely.
-   For a hackathon MVP, accept pasted text first and enable PDF/DOCX
    only after validation tests pass.
-   Escape user-controlled text in the UI; avoid rendering raw uploaded
    HTML or unsanitised Markdown.

## 7. Prompt injection and LLM safety

Submitted documents may contain instructions such as "ignore previous
rules." Treat all submitted text, retrieved documents and model
responses as data, not system instructions. - Keep trusted instructions
separate from untrusted content in prompts. - Tell the model to analyse
content only and never execute instructions found inside it. - Send only
relevant excerpts and approved facts. - Use a strict structured output
schema and validate every field. - Do not allow the model to call tools
or arbitrary URLs in the MVP. - Verify any returned fact IDs against the
database records actually provided to the model. - Do not trust
citations, URLs, severity or compliance claims solely because the model
returned them. - Keep deterministic checks separate and preserve their
results if the LLM fails. - Require human review for ambiguous,
high-risk or evidence-conflicted claims.

## 8. Evidence integrity

-   Only facts marked approved and within their validity window may be
    used as current evidence.
-   Store source title/reference, owner, approval status, valid dates
    and version metadata.
-   An absent match is **Unverified**, not "false."
-   Conflicting sources should result in **Needs human review**.
-   A reviewer override changes the workflow decision, not the
    underlying truth status of the claim.
-   Preserve the exact content version, rule/fact references and
    reviewer rationale used at decision time.

## 9. Web/API protections

-   Require HTTPS in production.
-   Configure CORS to exact approved frontend origins; do not use
    wildcard origins with credentialed requests.
-   Add rate limits to review and upload endpoints where practical.
-   Use request timeouts and cap text size, token usage and concurrent
    provider calls.
-   Use parameterised SQL or ORM queries.
-   Return safe error messages and request IDs; do not return stack
    traces, SQL statements, secrets or raw provider exceptions.
-   Keep framework and dependencies patched; pin dependencies for the
    submission build.
-   Disable debug mode in production.
-   Add CSRF protections if cookie-based authentication is used.
-   Set secure cookie flags when applicable: `HttpOnly`, `Secure`, and
    appropriate `SameSite`.
-   Validate redirect URLs and avoid open redirects.

## 10. Database and audit controls

-   Use separate database credentials for the application and migrations
    where practical.
-   Grant the application only required permissions.
-   Use foreign keys and constraints to preserve record relationships.
-   Scope queries by workspace and add indexes for workspace/submission
    IDs.
-   Audit submission creation, version creation, review
    start/completion, rule/fact changes, decisions and overrides.
-   Do not expose audit-event mutation through ordinary user endpoints.
-   Avoid recording full content in audit metadata; store IDs and
    minimal event details.
-   Do not rely on an in-memory store or ephemeral disk for important
    persistent data.

## 11. Privacy, retention and third-party processing

-   Tell demo users when content may be sent to an external LLM
    provider.
-   Send the minimum context needed for analysis.
-   Do not submit real confidential client data during judging unless
    authorised.
-   Document the provider's retention/data-use terms before production
    use.
-   Define a deletion and retention policy before onboarding real
    customers.
-   Do not claim legal, regulatory or privacy certification without
    evidence.
-   Avoid logging complete submissions, prompts, access tokens or API
    keys.

## 12. Minimum security test checklist

-   [ ] No secrets in Git history, frontend bundle, logs or screenshots.
-   [ ] Unauthenticated or wrong-role users cannot perform
    reviewer/admin actions.
-   [ ] Workspace A cannot fetch Workspace B records by guessing IDs.
-   [ ] Override without rationale is rejected.
-   [ ] Invalid JSON and oversized request bodies are rejected safely.
-   [ ] Unsupported and oversized uploads are rejected.
-   [ ] Malformed PDF/DOCX does not crash the service.
-   [ ] Prompt-injection-like content cannot alter system rules or
    trigger tools.
-   [ ] Invented fact IDs and URLs from the LLM are discarded.
-   [ ] Provider outage returns a warning without erasing deterministic
    findings.
-   [ ] Errors do not reveal stack traces, database details or secrets.
-   [ ] CORS is restricted to the deployed frontend origin.
-   [ ] Approval is tied to the exact version reviewed.
-   [ ] The demo environment contains no real sensitive customer
    information.

## 13. Incident response for the hackathon

If a secret leaks: revoke/rotate it immediately, remove it from active
configuration and inspect recent usage. If data appears across
workspaces: disable affected endpoints, preserve relevant logs without
copying confidential content, fix the scoping bug, and retest before
re-enabling. If AI results are misleading: disable the AI path
temporarily, keep deterministic checks available, mark affected reviews
with warnings, and correct the demo narrative. Do not hide known
failures from judges.
