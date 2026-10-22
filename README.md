# Pineco — Intelligent Brand Governance Platform

> **CodeAxis Hackathon | Round 2 — The Build (22–25 October 2026)**  
> **Product Principle:** *Evidence before assertion.* A claim without sufficient approved evidence is classified as **Unverified** or **Needs human review** — never fabricated or assumed true.

---

## 1. Executive Summary

In enterprise marketing and content generation, compliance risk is often caught too late or enforced through fragmented PDF style guides. **Pineco** is an intelligent brand governance platform that intercepts content prior to publication. It couples **deterministic rule evaluation** (for strict prohibited terms, preferred terminology, and mandatory regulatory disclaimers) with **conservative AI claim verification** (grounded in authoritative corporate facts).

Every finding is explainable, traceable to a source or rule, version-specific, and governed by human oversight.

---

## 2. Architecture & Tech Baseline

Pineco is built as a clean, decoupled modular monolith:

```text
Browser (Creator / Brand Manager / Reviewer / Admin)
  │
  ├── Next.js 15 (React 19, TypeScript, Tailwind CSS) [Vercel]
  │     │
  │     └── HTTPS /api/v1 (CORS Protected, Server-Side Only Secrets)
  │           │
  │           ▼
  └── FastAPI Monolith (Python 3.12, Pydantic v2, SQLAlchemy 2.0) [Render]
        ├── PostgreSQL (Alembic Migrations, UUIDs, Foreign Keys, UTC Indexes)
        │    └─ Zero-config SQLite engine fallback for local dev & automated CI tests
        ├── Deterministic Matching Engine (Unicode-normalized, regex/exact, offsets)
        ├── Server-Side LLM Provider Adapter (OpenAI / Gemini / Anthropic / Groq)
        │    └─ Strict Pydantic Schema Validation & Database Fact-ID Verification
        └── Audit & Event Writer (Append-only compliance timeline)
```

---

## 3. Verified Completed Features (Round 2 MVP)

| Priority | Feature | Status | Verification Detail |
| :--- | :--- | :--- | :--- |
| **P0** | **Seeded Demo Workspace** | ✅ Working | Pre-populated workspace (`ws-demo-enterprise-001`) with rules, facts, and sample content. |
| **P0** | **Brand Policy Rules Engine** | ✅ Working | Create/list/toggle policies across Terminology, Disclaimers, Tone, and Factual categories. |
| **P0** | **Authoritative Approved Facts** | ✅ Working | Structured facts with source title, reference code, owner, validity window, and approval status. |
| **P0** | **Content Versioning (Immutable)** | ✅ Working | SHA-256 hashed content versions. Edits create new versions (v1, v2, v3...) without overwriting earlier states. |
| **P0** | **Deterministic Review Checks** | ✅ Working | Prohibited terms (`guaranteed results`, `cheap`), preferred replacements, and missing required disclaimers. |
| **P0** | **Conservative AI Fact Verifier** | ✅ Working | Strict 4-state classification: `supported`, `contradicted`, `unverified`, `needs_human_review`. Hallucinated IDs are discarded. |
| **P0** | **Explainable Findings Explorer** | ✅ Working | Severity, category, exact excerpt, policy/source link, evidence status, and suggested corrections. |
| **P0** | **Human Reviewer Actions** | ✅ Working | Approve, Request Changes, or Override findings (mandatory rationale enforced server-side). |
| **P0** | **Audit Trail & Governance Log** | ✅ Working | Chronological audit records for all submissions, revisions, reviews, overrides, and decisions. |
| **P0** | **Real-Time Telemetry Dashboard** | ✅ Working | Aggregated metrics directly from persisted database records (no fabricated numbers). |

---

## 4. Quick Start: Local Run Instructions

### Prerequisites
- Node.js `v20+` or `v22+` / `v25+`
- Python `3.11+` or `3.12+` (or `uv`)

### Step 1: Clone & Configure Environment
```bash
git clone https://github.com/your-username/pineco.git
cd pineco

# Copy environment template
cp .env.example .env
```

### Step 2: Start Backend (FastAPI)
```bash
cd apps/api

# Create and activate virtual environment (using uv or standard python venv)
uv venv --python 3.12 .venv
# Windows: .venv\Scripts\activate
# Linux/macOS: source .venv/bin/activate

# Install dependencies
uv pip install -r requirements.txt

# Run migrations and seed database
alembic upgrade head
python -m pineco.seed

# Start API server on http://localhost:8000
uvicorn pineco.main:app --host 0.0.0.0 --port 8000 --reload
```
Verify backend health: `http://localhost:8000/api/v1/health`

### Step 3: Start Frontend (Next.js)
In a separate terminal:
```bash
cd apps/web

# Install packages
npm install

# Start development server on http://localhost:3000
npm run dev
```
Open **http://localhost:3000** in your browser.

---

## 5. Judge Walkthrough: 5-Minute End-to-End Test

1. **Dashboard & Demo Telemetry (`/`):**
   - Open `http://localhost:3000`.
   - Inspect live KPI telemetry: Submissions, Approved count, Brand Rules, Approved Facts, and Severity breakdowns.
   - Note the **"Active Role" switcher** in the top navigation bar (switch between *Creator*, *Brand Manager*, *Reviewer*, *Admin*).

2. **Inspect Brand Knowledge Base (`/knowledge`):**
   - Click **Brand Knowledge** in the navigation bar.
   - Tab 1: **Brand Rules** — See active deterministic rules (e.g. prohibited term *"guaranteed results"*, prohibited value term *"cheap"*, and mandatory disclaimer *"Past performance is not indicative of future results"*).
   - Tab 2: **Approved Facts** — See authoritative corporate ground truth with source titles and reference IDs.

3. **Inspect Seeded Violations Sample (`/submissions/sub-demo-violation`):**
   - Click the **"Sample with Violations"** button on the dashboard.
   - View the Findings Explorer:
     - 🔴 **Prohibited Term:** *"guaranteed results"* detected by deterministic engine (Severity: High).
     - 🟡 **Prohibited Term:** *"cheap"* (Preferred replacement: *"cost-effective"*).
     - 🔴 **Missing Required Disclaimer:** Mandatory disclaimer absent from copy.
     - 🔴 **Contradicted Fact:** Claim of *"automated regulatory sign-off"* directly contradicts Legal Risk Charter (`LEG-POL-2026`).
     - 🟡 **Unverified Claim:** Quantitative claim *"9000%"* has no matching approved evidence in database.

4. **Test Finding Override:**
   - Under any open finding, click **"Override Finding with Rationale..."**.
   - Attempting to submit without a rationale is blocked by server validation.
   - Enter a business rationale (e.g., *"Campaign exception approved by VP Marketing #881"*) and click **Confirm Override**. Notice the finding status updates to *Overridden*.

5. **Revise Copy into Immutable Version 2:**
   - Click the **"Content Copy & Revision Editor"** tab.
   - Update the text to clean, compliant phrasing:
     ```text
     Our platform provides an accessible and cost-effective proven approach to enterprise brand governance. Pineco reduces compliance turnaround times by up to 68% across enterprise content teams. Past performance is not indicative of future results.
     ```
   - Click **"Submit Revision & Rerun Review"**.
   - Notice a new immutable **Version 2** is created (SHA-256 hashed).
   - In Version 2, all violations are resolved, and the 68% turnaround metric is confirmed as **Supported** by the 2026 Benchmark Report!

6. **Record Human Review Decision:**
   - Click **"Record Review Decision"** in the top right.
   - Select **"Approve"** and click **Commit Decision**.
   - The submission status updates to **Approved for Publication**.

7. **Inspect Audit History (`/audit`):**
   - Click **Audit Trail** in the header.
   - Every revision creation, automated review, finding override, and final approval decision is permanently logged with timestamps and actor IDs.

---

## 6. Running Automated Tests

Run the complete backend test suite (unit tests, deterministic matching, fact ID integrity, security protections, and end-to-end workflow):

```bash
cd apps/api
$env:PYTHONPATH="." # Windows PowerShell (or export PYTHONPATH="." on Linux/macOS)
.venv\Scripts\pytest -v
```

All 9 test suites pass:
- `test_deterministic.py`: Prohibited terms, Unicode normalization, mandatory disclaimers, disabled rule skipping.
- `test_facts_evidence.py`: Evidence integrity, downgrading unevidenced assertions, rejecting hallucinated fact IDs.
- `test_health.py`: Health readiness probe and database status check.
- `test_security.py`: Override rationale enforcement, decision validation, structured error envelopes.
- `test_workflow.py`: End-to-end user journey across submissions, revisions, reviews, decisions, and audit trail.

---

## 7. Cloud Deployment Configuration

### Render (FastAPI Monolith + PostgreSQL)
1. Create a new **PostgreSQL Database** on Render.
2. Create a new **Web Service** connected to your repository:
   - **Root Directory:** `apps/api`
   - **Build Command:** `pip install -r requirements.txt && alembic upgrade head && python -m pineco.seed`
   - **Start Command:** `uvicorn pineco.main:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path:** `/api/v1/health`
3. Configure Environment Variables in Render Dashboard:
   - `DATABASE_URL`: `postgresql+psycopg2://...` (Render Internal Database URL)
   - `APP_ENV`: `production`
   - `CORS_ORIGINS`: `https://your-app.vercel.app`
   - `LLM_API_KEY`: Server-side secret key (never exposed to client)
   - `LLM_PROVIDER`: `openai` / `gemini` / `groq`

### Vercel (Next.js Frontend)
1. Import repository in Vercel.
2. Set **Root Directory** to `apps/web`.
3. Configure Environment Variable:
   - `NEXT_PUBLIC_API_BASE_URL`: `https://your-render-api.onrender.com/api/v1`
4. Deploy!

---

## 8. Round 3 Meaningful Improvements

1. **ProofGraph Claim-to-Source Traceability Graph:**
   Interactive visual DAG linking every clause in draft copy to its cited document paragraph, evidence freshness score, and confidence interval. Highlights coverage gaps and conflicting internal documentation visually.
2. **Visual Brand DNA Engine:**
   Multi-modal computer vision module verifying uploaded banners and creative graphics against approved typography scales, hex color palettes, safe logo clear-space margins, and contrast ratios.
3. **Guideline Ambiguity Analytics:**
   Aggregates reviewer overrides and disputed findings across departments to identify confusing, conflicting, or outdated brand rules. Generates automated recommendation diffs to clarify enterprise policy.

---

## 9. Hackathon Submission Information
- **Event:** CodeAxis Hackathon Round 2 (22–25 October 2026)
- **Submission Form:** https://forms.gle/gyRiHtQT3AnC3MdV6
- **Architecture Lead / Author:** Antigravity AI Engineering Team
