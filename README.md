# Pineco — Intelligent Brand Governance Platform

> **Enterprise Pre-Publication Content Governance & Verifiable Compliance System**  
> **Product Principle:** *Evidence before assertion.* A claim without sufficient approved evidence is classified as **Unverified** or **Needs human review** — never fabricated or assumed true.

---

## 1. Project Links & Submission Assets

| Resource | URL / Destination | Details |
| :--- | :--- | :--- |
| **Working Web Application** | [https://pineco.vercel.app](https://pineco.vercel.app) | Live Production Web App (Vercel) |
| **Source-Code Repository** | [https://github.com/WolverineAryan/PINECO](https://github.com/WolverineAryan/PINECO) | Public GitHub Repository (Main & Master synced) |
| **Backend API Engine** | [https://pineco-api.onrender.com/api/v1](https://pineco-api.onrender.com/api/v1) | FastAPI Production API (Render) |
| **API Health & Telemetry** | [https://pineco-api.onrender.com/api/v1/health](https://pineco-api.onrender.com/api/v1/health) | Live Health Readiness Probe (`HTTP 200 OK`) |
| **Project Submission PDF** | [PINECO_Project_Submission_Round2.pdf](./PINECO_Project_Submission_Round2.pdf) | Complete Round 2 PDF Report |

---

## 2. Executive Summary & Core Principle

In enterprise marketing and content generation, compliance risk is often caught too late or enforced through fragmented PDF style guides. **Pineco** is an intelligent brand governance platform that intercepts content prior to publication. It couples **deterministic rule evaluation** (for strict prohibited terms, preferred terminology, and mandatory regulatory disclaimers) with **conservative AI claim verification** (grounded in authoritative corporate facts).

Every finding is explainable, traceable to a source or rule, version-specific, and governed by human oversight.

### The Operational Principle: *Evidence Before Assertion*
Pineco strictly enforces conservative epistemic standards:
- Any quantitative assertion, performance statement, or partnership claim lacking explicit approval in the Approved Facts repository is flagged as **Unverified** or **Needs Human Review**.
- AI models are strictly constrained; hallucinated rule IDs or phantom citations are automatically rejected and discarded at the schema layer.

---

## 3. List of Completed Features (Round 2 Deliverable)

| Category | Feature | Status | Verification Detail |
| :--- | :--- | :--- | :--- |
| **Identity & Multi-Tenancy** | **User Registration & JWT Auth** | Completed | Secure registration with PBKDF2-HMAC-SHA256 password hashing (100,000 rounds). Automatic isolated workspace generation (`ws-<hex12>`). Strict cross-tenant SQL data isolation. |
| **Brand Policy Engine** | **Deterministic Rules Engine** | Completed | Zero-latency regex and exact token matching with Unicode normalization across Terminology, Disclaimers, Tone, and Regulatory scopes. Severity tiers (High, Medium, Low) and channel scoping. |
| **Ground Truth Repository** | **Authoritative Facts Ledger** | Completed | Centralized evidence facts containing source reference codes, document titles, validity windows, and owner attribution for conservative AI verification. |
| **Document Ingestion** | **Multi-Format Ingestion** | Completed | Single-click upload and parse engine for PDF, DOCX, TXT, and scanned image OCR. Extracts structured copy and triggers audit pipelines. |
| **Immutable Versioning** | **Cryptographic Revision Stacks** | Completed | SHA-256 hashed content revisions. Edits instantiate sequential immutable revisions (`v1`, `v2`, `v3`...) with historical finding diffs. |
| **Human Governance** | **Audited Decision Workflow** | Completed | Formal review decisions (Approve, Request Changes). Interactive finding overrides with mandatory non-empty business justification logs. |
| **Compliance Reporting** | **Multi-Format Export Packets** | Completed | Client and server-side generation of executive PDF, Word (`.docx`), and PowerPoint (`.pptx`) compliance sign-off packets. |
| **Telemetry & Oversight** | **Real-Time Governance Dashboard** | Completed | Aggregated telemetry tracking active rules, verified evidence, submission volume, and severity distributions directly from SQL persistence. |
| **Product Scoping** | **Multi-Portfolio Folders** | Completed | Create and isolate brand governance workspaces for distinct products, campaigns, and corporate subsidiaries. |

---

## 4. Technology and Implementation Details

Pineco is engineered as a decoupled, modular monolith:

```text
Browser (Creator / Brand Manager / Reviewer / Admin)
  │
  ├── Next.js 15.1.12 (React 19, TypeScript, Tailwind CSS) [Vercel]
  │     │
  │     └── HTTPS /api/v1 (Bearer JWT, Multi-Tenant Workspace Header)
  │           │
  │           ▼
  └── FastAPI Monolith (Python 3.11/3.12, Pydantic v2, SQLAlchemy 2.0) [Render]
        ├── PostgreSQL (psycopg v3 binary & psycopg2 fallback, Alembic Migrations)
        │    └─ Zero-config SQLite engine with WAL pragma for local dev & automated CI
        ├── Deterministic Rule Engine (Unicode normalization, exact token & regex matching)
        ├── Server-Side LLM Adapter (OpenAI / Gemini / Anthropic / Groq)
        │    └─ Strict Pydantic Schema Validation & Fact ID Integrity Verification
        ├── Multi-Format Report Exporter (ReportLab 5.1, python-docx, python-pptx)
        └── Immutable Audit Ledger (Append-only compliance timeline)
```

- **Frontend:** Next.js `15.1.12` with React `19`, TypeScript, and Tailwind CSS. Modern 60% White / 30% Black / 10% Purple (`#7C3AED`) palette, interactive canvas login/signup animations, and responsive AppShell.
- **Backend:** FastAPI with Pydantic v2 schemas, SQLAlchemy 2.0 ORM, and dependency injection for tenant resolution.
- **Database:** PostgreSQL on Render with modern `psycopg` (v3) driver and `psycopg2` compatibility fallback. SQLite fallback for zero-configuration local development.
- **Security:** PBKDF2-HMAC-SHA256 password derivation (100,000 hashing rounds), HS256 JWT tokens with embedded tenant claims, and role-based access control.

---

## 5. Explanation of Changes Made to Original Plan

During Round 2 implementation, several architectural refinements were introduced:

1. **Multi-Tenant Isolation vs. Static Demo:**
   - *Original Plan:* Single shared demo workspace (`ws-demo-enterprise-001`).
   - *Refined Implementation:* Upgraded to a multi-tenant architecture. Every new user registration automatically generates an isolated workspace (`ws-<hex12>`) with strict SQL query filtering.
2. **Dynamic Asset Scoping vs. Hardcoded Mock Strings:**
   - *Original Plan:* Hardcoded interface placeholders (e.g. "16 Portfolios", "20 Entries").
   - *Refined Implementation:* Replaced all hardcoded strings with dynamic calculations based on actual database counts. Empty workspaces show 0 portfolios and guide the user to create their first folder.
3. **Multi-Format Compliance Sign-Off Exporters:**
   - *Original Plan:* Basic browser-rendered review reports.
   - *Refined Implementation:* Implemented dedicated server-side and client-side export pipelines for PDF, Word (`.docx`), and PowerPoint (`.pptx`) formats.
4. **PostgreSQL Driver Auto-Negotiation:**
   - *Original Plan:* Basic connection string handling.
   - *Refined Implementation:* Added intelligent URI normalization and dual driver support (`psycopg` v3 and `psycopg2-binary`) to eliminate PaaS runtime failures.
5. **Security Dependency Hardening:**
   - *Original Plan:* Standard dependency set.
   - *Refined Implementation:* Upgraded Next.js to `15.1.12` to address CVE-2025-66478 and satisfy automated Vercel security blocks.

---

## 6. Three Major Improvements for Round 3

### 1. ProofGraph: Interactive Claim-to-Evidence DAG
An interactive Directed Acyclic Graph (DAG) visualizing the exact semantic linkage between individual copy clauses, regulatory statutes, and corporate evidence paragraphs. Features confidence interval badges, evidence freshness decay indicators, and conflicting claim detection across disparate product manuals.

### 2. Multi-Modal Visual Brand DNA Engine
Computer vision inspection module analyzing published advertising creative banners, slides, and packaging against brand design tokens: font scale hierarchy, hex palette boundaries, logo isolation clear-space margins, and WCAG contrast compliance ratios.

### 3. Guideline Ambiguity & Policy Drift Analytics
Aggregates human reviewer override patterns, dispute logs, and review latency across departments to detect obsolete, conflicting, or poorly phrased brand guidelines. Automatically generates plain-English policy revision pull-requests with impact simulations.

---

## 7. Quick Start: Local Run Instructions

### Prerequisites
- Node.js `v20+` or `v22+`
- Python `3.11+` or `3.12+` (or `uv`)

### Step 1: Clone Repository
```bash
git clone https://github.com/WolverineAryan/PINECO.git
cd PINECO
```

### Step 2: Start Backend (FastAPI)
```bash
cd apps/api
# Create and activate virtual environment
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
Verify health probe: `http://localhost:8000/api/v1/health`

### Step 3: Start Frontend (Next.js)
In a separate terminal:
```bash
cd apps/web
npm install
npm run dev
```
Open **http://localhost:3000** in your browser.

---

## 8. Quality Assurance & Automated Tests

Run the complete backend test suite:

```bash
cd apps/api
$env:PYTHONPATH="." # Windows PowerShell (or export PYTHONPATH="." on Linux/macOS)
.venv\Scripts\pytest -v
```

All 34 automated tests pass:
- `test_deterministic.py`: Prohibited terms, Unicode normalization, mandatory disclaimers, disabled rule skipping.
- `test_facts_evidence.py`: Evidence integrity, downgrading unevidenced assertions, rejecting hallucinated fact IDs.
- `test_auth.py`: PBKDF2 hashing, JWT signing/decoding, token expiry, tenant registration.
- `test_products.py`: Isolated workspace folders, CRUD operations, multi-tenant query boundaries.
- `test_security.py`: Override rationale enforcement, decision validation, structured error envelopes.
- `test_exporter.py`: PDF, DOCX, and PPTX report generation and table layouts.
- `test_parser.py`: Multi-format file ingestion (PDF, DOCX, TXT, OCR).
- `test_workflow.py`: End-to-end user journey across submissions, revisions, reviews, decisions, and audit trail.

---

## 9. Platform Information
- **Edition:** Pineco Enterprise Production v1.0
- **Lead Developer & Maintainer:** WolverineAryan
- **License:** Proprietary Enterprise Governance Platform
