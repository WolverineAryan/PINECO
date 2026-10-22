# Pineco --- Product Requirements Document (PRD)

**Event:** CodeAxis Hackathon --- Round 2: The Build\
**Product:** Pineco, Intelligent Brand Governance Platform\
**Version:** 1.0 \| **Date:** 22 October 2026\
**Status:** Build specification for the Round 2 MVP

## 1. Product vision

Pineco helps teams check content against approved brand guidelines and
verified organisational facts before publication. It combines
deterministic rules with AI-assisted analysis, explains each finding,
and routes content through a human-controlled review process.

**Product principle:** evidence before assertion. A claim without
sufficient approved evidence must be marked *Unverified* or *Needs human
review*---never automatically described as false or supported.

## 2. Problem statement

Content produced by marketers, employees, agencies, and AI tools can
contain inconsistent tone, prohibited terminology, unsupported claims,
outdated facts, visual-brand deviations, and accessibility gaps.
Guidance and approval decisions are often spread across documents and
conversations. Pineco centralises the knowledge, review findings, and
version-specific decisions.

## 3. Target users

-   **Creator:** submits content, reviews findings, edits and resubmits.
-   **Brand manager:** maintains guidelines, terminology, approved facts
    and assets.
-   **Reviewer:** evaluates findings, requests changes, approves, or
    records an override.
-   **Administrator:** manages workspace membership and roles.

For the hackathon demo, these roles may be implemented with seeded demo
users or a simplified role selector, but production deployment must use
real authentication and server-enforced permissions.

## 4. Goals and success measures

### Round 2 goals

1.  A judge can open the deployed app and complete the main workflow
    without developer assistance.
2.  A user can add brand rules and approved facts, submit content, run a
    review, inspect evidence-linked findings, revise content, and record
    a review decision.
3.  Findings are traceable to a rule or source where applicable.
4.  The app reports honest states when AI, parsing, or evidence
    retrieval fails.
5.  The deployed app and repository are reproducible from documented
    setup instructions.

### Suggested demo acceptance targets

-   100% of demo submissions receive a visible final state: completed,
    completed with warnings, or failed with actionable error.
-   Every deterministic finding includes its rule identifier.
-   Every claim-verification result includes a source reference or an
    explicit missing-evidence status.
-   No approval is shown as completed unless a decision record exists.
-   A fresh judge can finish the primary journey in approximately five
    minutes.

These are demo targets, not claims of measured production performance.

## 5. Scope

### P0 --- must work in Round 2

-   Workspace/demo environment and role-aware interface.
-   Create, list and edit brand rules.
-   Add approved facts/sources as structured records.
-   Submit pasted text; support PDF/DOCX only if parsing is reliable and
    tested.
-   Run deterministic checks for preferred/prohibited terminology and
    configured required phrases/disclaimers.
-   Run AI-assisted tone/messaging analysis and structured claim
    extraction when an LLM API is configured.
-   Classify claims as **Supported**, **Contradicted**, **Unverified**,
    or **Needs human review** based on retrieved approved facts and
    conservative logic.
-   Display findings with excerpt, type, severity, confidence,
    explanation, rule/source, and suggested correction when available.
-   Allow creator to revise and resubmit as a new version.
-   Allow reviewer to request changes, approve a version, or override a
    finding with a reason.
-   Maintain submission status and a basic audit history.
-   Include seeded sample rules, facts, and content so the app is
    immediately usable.

### P1 --- implement only after P0 is stable

-   PDF/DOCX upload and extraction with page/paragraph locations.
-   Basic accessibility checks such as presence of alt text and contrast
    checks for explicitly supplied colours.
-   Simple dashboard counts by finding type/status.
-   Reviewer assignment and comments.

### Out of scope for Round 2

-   Guaranteed detection of every visual brand violation.
-   Fully automated legal or regulatory sign-off.
-   Automatic publication to third-party channels.
-   Training a custom foundation model.
-   Complex multi-tenant billing, enterprise SSO, or comprehensive
    analytics.
-   Treating a model's confidence score as a calibrated probability.

## 6. Primary user journey

1.  Open Pineco and enter the demo workspace.
2.  Review or add brand rules and approved facts.
3.  Paste content or upload a supported document.
4.  Select channel/context and start review.
5.  Inspect findings and evidence.
6.  Edit content and create a new version.
7.  Re-run the review.
8.  Request review or record approve / request changes / override with
    reason.
9.  See final status and audit history.

## 7. Functional requirements

  ----------------------------------------------------------------------------------
  ID               Requirement                           Priority Acceptance
                                                                  condition
  ---------------- ------------------------ --------------------- ------------------
  FR-01            Display workspace                           P0 Dashboard loads
                   dashboard and seeded                           with actionable
                   demo data                                      links and no setup
                                                                  required

  FR-02            Create/list/edit brand                      P0 Saved rules
                   rules                                          persist after
                                                                  refresh

  FR-03            Store approved facts                        P0 Facts are
                   with source, owner and                         retrievable and
                   validity metadata                              shown as evidence

  FR-04            Create a content                            P0 Submission and
                   submission from text                           immutable initial
                                                                  version are saved

  FR-05            Run deterministic                           P0 Known test
                   terminology/disclaimer                         violations produce
                   checks                                         predictable
                                                                  findings

  FR-06            Run AI-assisted analysis                    P0 Structured result
                   through a server-side                          or clear
                   provider adapter                               failure/warning is
                                                                  returned

  FR-07            Label claim evidence                        P0 Missing evidence
                   conservatively                                 is
                                                                  Unverified/Needs
                                                                  review, not
                                                                  fabricated

  FR-08            Show explainable                            P0 Each finding
                   findings                                       displays excerpt,
                                                                  category,
                                                                  severity, reason
                                                                  and evidence
                                                                  status

  FR-09            Revise content into a                       P0 Earlier versions
                   new version                                    remain available

  FR-10            Record review decision                      P0 Decision includes
                   and rationale                                  version, actor,
                                                                  timestamp and
                                                                  optional rationale

  FR-11            Keep an audit trail of                      P0 Submission, review
                   important changes                              and decision
                                                                  events can be
                                                                  inspected

  FR-12            Support PDF/DOCX                            P1 Valid files parse;
                   extraction                                     invalid files fail
                                                                  safely

  FR-13            Show basic governance                       P1 Counts are derived
                   metrics                                        from persisted
                                                                  findings, not
                                                                  hard-coded

  FR-14            Enforce role and         P0 for non-demo auth; Unauthorized
                   workspace boundaries on   required before real requests are
                   backend                         multi-user use rejected
                                                                  server-side
  ----------------------------------------------------------------------------------

## 8. Non-functional requirements

-   **Usability:** primary actions are labelled; empty, loading,
    success, warning and error states are visible.
-   **Reliability:** API errors are actionable; no silent fallback to
    fake AI output.
-   **Performance:** common text review should usually finish within a
    reasonable demo wait; show progress for long-running calls.
-   **Traceability:** findings reference rule/source IDs and reviewed
    version IDs.
-   **Privacy:** send only necessary content to an external LLM;
    disclose provider use in the UI/demo.
-   **Security:** validate input, restrict file types/sizes, keep
    secrets server-side, and enforce authorisation.
-   **Accessibility:** keyboard-operable controls, labels, visible focus
    and readable contrast.
-   **Maintainability:** separate UI, API, domain logic, persistence and
    provider adapters.

## 9. Round 3 improvements --- meaningful additions

1.  **ProofGraph claim-to-source traceability:** graph each extracted
    claim to one or more versioned approved sources, show
    support/contradiction/coverage, and expose why the system reached
    its result.
2.  **Visual Brand DNA engine:** compare uploaded creatives against
    approved logos, colours, typography and layout/asset references,
    with region-level explanations and human verification.
3.  **Guideline ambiguity analytics:** identify recurring disputes,
    repeated overrides and conflicting rules; recommend specific
    guideline clarifications with evidence and an approval workflow.

## 10. Demo content and judge readiness

Ship a preloaded workspace with: - A prohibited term and a preferred
replacement. - A required disclaimer rule. - Two or three approved facts
with source title, owner and validity date. - One clean sample and one
sample containing a terminology violation and an unsupported claim. - A
reviewer decision example or a clear reset option.

The demo must clearly distinguish seeded sample content from real
organisation data. Do not fabricate evaluation statistics or claim that
optional integrations work unless verified.
