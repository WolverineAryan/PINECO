import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    KeepTogether,
    HRFlowable,
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#6B7280"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 750, "Pineco Enterprise — Intelligent Brand Governance Platform | Project Report")
            self.drawRightString(letter[0] - 54, 750, "Round 2 Submission")
            self.setStrokeColor(colors.HexColor("#E5E7EB"))
            self.setLineWidth(0.5)
            self.line(54, 744, letter[0] - 54, 744)
        
        # Footer
        self.setStrokeColor(colors.HexColor("#E5E7EB"))
        self.setLineWidth(0.5)
        self.line(54, 45, letter[0] - 54, 45)
        
        self.drawString(54, 32, "Confidential — Pineco Brand Governance Platform (Round 2)")
        self.drawRightString(letter[0] - 54, 32, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()


def build_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54,
    )
    
    styles = getSampleStyleSheet()
    
    # Custom Palette
    c_primary = colors.HexColor("#7C3AED")     # Deep Purple
    c_dark = colors.HexColor("#111827")        # Slate 900
    c_muted = colors.HexColor("#4B5563")       # Slate 600
    c_border = colors.HexColor("#E5E7EB")      # Slate 200
    c_card_bg = colors.HexColor("#F9FAFB")     # Off white
    
    # Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=c_dark,
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=16,
        textColor=c_primary,
    )

    h1_style = ParagraphStyle(
        'Heading1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=c_dark,
        spaceBefore=14,
        spaceAfter=6,
    )

    h2_style = ParagraphStyle(
        'Heading2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=c_primary,
        spaceBefore=8,
        spaceAfter=4,
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=c_dark,
    )

    body_muted = ParagraphStyle(
        'BodyMuted',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=c_muted,
    )

    callout_style = ParagraphStyle(
        'Callout',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9,
        leading=13,
        textColor=c_dark,
    )

    table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white,
    )

    table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=c_dark,
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=c_dark,
    )

    code_style = ParagraphStyle(
        'CodeStyle',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#1F2937"),
    )

    story = []

    # Title Banner
    story.append(Paragraph("PINECO — Intelligent Brand Governance Platform", title_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph("Enterprise Pre-Publication Content Governance & Verifiable Compliance System | Round 2 Submission", subtitle_style))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1.5, color=c_primary, spaceBefore=0, spaceAfter=12))

    # Deployment & Repository Links Table
    link_data = [
        [Paragraph("<b>Resource</b>", table_header), Paragraph("<b>Endpoint / Uniform Resource Identifier</b>", table_header), Paragraph("<b>Deployment Status</b>", table_header)],
        [Paragraph("<b>Working Web Application</b>", table_cell_bold), Paragraph("<u>https://pineco.vercel.app</u>", code_style), Paragraph("<font color='#059669'><b>Active / Production (Vercel)</b></font>", table_cell)],
        [Paragraph("<b>Source-Code Repository</b>", table_cell_bold), Paragraph("<u>https://github.com/WolverineAryan/PINECO</u>", code_style), Paragraph("<font color='#059669'><b>Public / Master & Main Synced</b></font>", table_cell)],
        [Paragraph("<b>Backend API Engine</b>", table_cell_bold), Paragraph("<u>https://pineco-api.onrender.com/api/v1</u>", code_style), Paragraph("<font color='#059669'><b>Active / Production (Render)</b></font>", table_cell)],
        [Paragraph("<b>API Health & Telemetry</b>", table_cell_bold), Paragraph("<u>https://pineco-api.onrender.com/api/v1/health</u>", code_style), Paragraph("<font color='#059669'><b>HTTP 200 OK Readiness Probe</b></font>", table_cell)],
    ]
    t_links = Table(link_data, colWidths=[130, 260, 114])
    t_links.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_dark),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, c_card_bg]),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(t_links)
    story.append(Spacer(1, 14))

    # Executive Summary & Principle
    story.append(Paragraph("1. Executive Summary & Core Engineering Principle", h1_style))
    story.append(Paragraph(
        "Modern enterprise content operations face significant regulatory and brand reputation hazards due to unvetted AI copy generation, dispersed guidelines, and human review bottlenecks. <b>Pineco</b> is a sovereign, deterministic-first brand compliance platform that verifies copy before publication. It intercepts content through dual-engine intelligence: high-speed <b>deterministic rule validation</b> (for prohibited vocabulary, required disclaimers, and regulated patterns) combined with <b>conservative, hallucination-resistant claim verification</b> anchored to authoritative corporate evidence.",
        body_style
    ))
    story.append(Spacer(1, 6))

    principle_box = [
        [Paragraph(
            "<b>The Core Operational Principle: <i>Evidence Before Assertion</i></b><br/>"
            "Pineco strictly enforces conservative epistemic standards. An enterprise claim without unambiguous verified backing in the Approved Fact repository is classified as <b>Unverified</b> or <b>Needs Human Review</b>. The platform strictly rejects fabricated citations and automatically disallows hallucinated evidence identifiers.",
            callout_style
        )]
    ]
    t_principle = Table(principle_box, colWidths=[504])
    t_principle.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F5F3FF")),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#C4B5FD")),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t_principle)
    story.append(Spacer(1, 14))

    # Completed Features Table
    story.append(Paragraph("2. List of Completed Features (Round 2 Production Deliverable)", h1_style))
    features = [
        [Paragraph("<b>Category</b>", table_header), Paragraph("<b>Feature & Functional Description</b>", table_header), Paragraph("<b>Verification Status</b>", table_header)],
        [
            Paragraph("<b>Identity & Multi-Tenancy</b>", table_cell_bold),
            Paragraph("<b>User Registration & JWT Auth:</b> Secure account registration with PBKDF2-HMAC-SHA256 password hashing (100,000 rounds). Automatic isolated workspace generation (ws-&lt;id&gt;). Strict server-side cross-tenant data isolation.", table_cell),
            Paragraph("<font color='#059669'><b>Completed &amp; Tested</b></font>", table_cell)
        ],
        [
            Paragraph("<b>Brand Policy Engine</b>", table_cell_bold),
            Paragraph("<b>Deterministic Rules Engine:</b> Zero-latency regex and exact token matching with Unicode normalization across Terminology, Disclaimers, Tone, and Regulatory scopes. Severity tiers (High, Medium, Low) and channel scoping.", table_cell),
            Paragraph("<font color='#059669'><b>Completed &amp; Tested</b></font>", table_cell)
        ],
        [
            Paragraph("<b>Ground Truth Repository</b>", table_cell_bold),
            Paragraph("<b>Authoritative Facts Ledger:</b> Centralized evidence facts containing source reference codes, document titles, validity windows, and owner attribution for conservative AI verification.", table_cell),
            Paragraph("<font color='#059669'><b>Completed &amp; Tested</b></font>", table_cell)
        ],
        [
            Paragraph("<b>Document Ingestion</b>", table_cell_bold),
            Paragraph("<b>Multi-Format File Ingestor:</b> Single-click upload and parse engine for PDF, DOCX, TXT, and scanned image OCR. Automatically extracts structured copy and triggers audit pipelines.", table_cell),
            Paragraph("<font color='#059669'><b>Completed &amp; Tested</b></font>", table_cell)
        ],
        [
            Paragraph("<b>Immutable Versioning</b>", table_cell_bold),
            Paragraph("<b>Cryptographic Version Stacks:</b> SHA-256 hashed content revisions. Edits instantiate sequential immutable revisions (v1, v2, v3...) with historical finding diffs.", table_cell),
            Paragraph("<font color='#059669'><b>Completed &amp; Tested</b></font>", table_cell)
        ],
        [
            Paragraph("<b>Human Governance</b>", table_cell_bold),
            Paragraph("<b>Audited Decision Workflow:</b> Formal review decisions (Approve, Request Changes). Interactive finding overrides with mandatory non-empty business justification logs.", table_cell),
            Paragraph("<font color='#059669'><b>Completed &amp; Tested</b></font>", table_cell)
        ],
        [
            Paragraph("<b>Compliance Reporting</b>", table_cell_bold),
            Paragraph("<b>Multi-Format Export Packets:</b> Client and server-side generation of executive PDF, Word (.docx), and PowerPoint (.pptx) compliance sign-off packets.", table_cell),
            Paragraph("<font color='#059669'><b>Completed &amp; Tested</b></font>", table_cell)
        ],
        [
            Paragraph("<b>Telemetry & Oversight</b>", table_cell_bold),
            Paragraph("<b>Real-Time Governance Dashboard:</b> Aggregated telemetry tracking active rules, verified evidence, submission volume, and severity distributions directly from SQL persistence.", table_cell),
            Paragraph("<font color='#059669'><b>Completed &amp; Tested</b></font>", table_cell)
        ],
    ]
    t_feat = Table(features, colWidths=[105, 305, 94])
    t_feat.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_dark),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, c_card_bg]),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_feat)
    story.append(Spacer(1, 14))

    # Technology & Implementation Details
    story.append(Paragraph("3. Technology and Implementation Details", h1_style))
    story.append(Paragraph(
        "<b>Frontend Architecture:</b> Next.js 15.1.12 with React 19, TypeScript, and Tailwind CSS. Built with responsive 60% White / 30% Black / 10% Purple design, animated canvas login/signup backgrounds, role-based contextual routing, and custom toast notifications.<br/>"
        "<b>Backend Engine:</b> FastAPI (Python 3.11/3.12) designed as a modular monolith. Incorporates Pydantic v2 data envelopes, SQLAlchemy 2.0 ORM, and background pipeline execution.<br/>"
        "<b>Database & Persistence:</b> PostgreSQL hosted on Render with modern psycopg (v3) driver and psycopg2 fallback. Zero-configuration SQLite engine with WAL mode and foreign-key pragma for local development and CI.<br/>"
        "<b>Security & Encryption:</b> PBKDF2 password derivation with 100,000 hashing rounds and individual random salts. HS256-signed stateless JWT tokens. Multi-tenant workspace data isolation enforced across every endpoint.<br/>"
        "<b>Export & Ingestion Engine:</b> ReportLab 5.1, python-docx, python-pptx, PyPDF, and Pillow for multi-format document parsing and executive compliance packet generation.",
        body_style
    ))
    story.append(Spacer(1, 14))

    # Explanation of Changes Made to Original Plan
    story.append(Paragraph("4. Explanation of Changes Made to the Original Plan", h1_style))
    story.append(Paragraph(
        "During Round 2 implementation, several architectural refinements were introduced to elevate Pineco from a prototype demo to a commercial-grade, multi-tenant enterprise system:",
        body_style
    ))
    story.append(Spacer(1, 4))
    
    changes_items = [
        ("Multi-Tenant Isolation vs. Static Demo:", "The initial plan called for a single seeded demo workspace. In response to enterprise security standards, Pineco was upgraded to full multi-tenancy. Every newly registered account automatically provisions an isolated workspace (ws-<hex12>) with strict SQL-level data boundaries."),
        ("Dynamic Asset Scoping vs. Hardcoded Mock Strings:", "Initial interface mockups included static '16 Portfolios' and '20 Entries' strings. These were replaced with dynamic database-backed counters reflecting actual tenant products, folders, and submissions."),
        ("Multi-Format Compliance Sign-Off Exporters:", "Expanded the export subsystem to support not only PDF documentation but also Word (.docx) and PowerPoint (.pptx) formats to accommodate legal, marketing, and executive sign-off workflows."),
        ("PostgreSQL Driver Auto-Negotiation:", "Render and cloud providers provide varied connection formats ('postgres://' and 'postgresql://'). Added automatic URI normalization and dual psycopg (v3) / psycopg2 driver detection in database.py to eliminate PaaS runtime failures."),
        ("Security Dependency Hardening:", "Upgraded Next.js to 15.1.12 to resolve CVE-2025-66478 and satisfy automated Vercel production security blocks."),
    ]
    for title, desc in changes_items:
        story.append(Paragraph(f"• <b>{title}</b> {desc}", body_style))
        story.append(Spacer(1, 3))
    
    story.append(Spacer(1, 10))

    # Round 3 Improvements
    story.append(Paragraph("5. Three Major Improvements for Round 3", h1_style))
    r3_cards = [
        [
            Paragraph("<b>1. ProofGraph: Interactive Claim-to-Evidence DAG</b>", table_cell_bold),
            Paragraph("An interactive Directed Acyclic Graph (DAG) visualizing the exact semantic linkage between individual copy clauses, regulatory statutes, and corporate evidence paragraphs. Features confidence interval badges, evidence freshness decay indicators, and conflicting claim detection across disparate product manuals.", table_cell),
        ],
        [
            Paragraph("<b>2. Multi-Modal Visual Brand DNA Engine</b>", table_cell_bold),
            Paragraph("Computer vision inspection module analyzing published advertising creative banners, slides, and packaging against brand design tokens: font scale hierarchy, hex palette boundaries, logo isolation clear-space margins, and WCAG contrast compliance ratios.", table_cell),
        ],
        [
            Paragraph("<b>3. Guideline Ambiguity & Policy Drift Analytics</b>", table_cell_bold),
            Paragraph("Aggregates human reviewer override patterns, dispute logs, and review latency across departments to detect obsolete, conflicting, or poorly phrased brand guidelines. Automatically generates plain-English policy revision pull-requests with impact simulations.", table_cell),
        ],
    ]
    t_r3 = Table(r3_cards, colWidths=[170, 334])
    t_r3.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor("#F3F4F6")),
        ('BACKGROUND', (1, 0), (1, -1), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, c_border),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(t_r3)
    story.append(Spacer(1, 14))

    # Test Suite Verification Summary
    story.append(Paragraph("6. Quality Assurance & Automated Test Verification", h1_style))
    story.append(Paragraph(
        "Pineco enforces 100% passing automated test coverage across all core subsystems. The test suite includes <b>34 automated tests</b> covering deterministic rules, evidence validation, security controls, document parsers, multi-format export, and multi-tenant scoping.",
        body_style
    ))
    story.append(Spacer(1, 4))
    
    test_summary = [
        [Paragraph("<b>Test Suite Module</b>", table_header), Paragraph("<b>Target Subsystem Tested</b>", table_header), Paragraph("<b>Status</b>", table_header)],
        [Paragraph("test_deterministic.py", code_style), Paragraph("Prohibited terminology, missing disclaimers, regex boundary, Unicode accents", table_cell), Paragraph("<font color='#059669'><b>PASSED</b></font>", table_cell)],
        [Paragraph("test_facts_evidence.py", code_style), Paragraph("Fact ID verification, hallucination rejection, unverified claim classification", table_cell), Paragraph("<font color='#059669'><b>PASSED</b></font>", table_cell)],
        [Paragraph("test_auth.py", code_style), Paragraph("PBKDF2 hashing, JWT signing/decoding, token expiry, tenant registration", table_cell), Paragraph("<font color='#059669'><b>PASSED</b></font>", table_cell)],
        [Paragraph("test_products.py", code_style), Paragraph("Isolated workspace folders, CRUD operations, multi-tenant query boundaries", table_cell), Paragraph("<font color='#059669'><b>PASSED</b></font>", table_cell)],
        [Paragraph("test_security.py", code_style), Paragraph("Mandatory override rationale, role-based rule authoring block, error envelopes", table_cell), Paragraph("<font color='#059669'><b>PASSED</b></font>", table_cell)],
        [Paragraph("test_exporter.py", code_style), Paragraph("PDF, DOCX, and PPTX report byte streams, table layouts, compliance formatting", table_cell), Paragraph("<font color='#059669'><b>PASSED</b></font>", table_cell)],
        [Paragraph("test_parser.py", code_style), Paragraph("PDF, DOCX, TXT file ingestion, client OCR integration, size limit enforcement", table_cell), Paragraph("<font color='#059669'><b>PASSED</b></font>", table_cell)],
        [Paragraph("test_workflow.py", code_style), Paragraph("End-to-end user journey across submission, review, revision, approval & audit", table_cell), Paragraph("<font color='#059669'><b>PASSED</b></font>", table_cell)],
    ]
    t_test = Table(test_summary, colWidths=[120, 310, 74])
    t_test.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_dark),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, c_card_bg]),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(t_test)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated PDF: {filename}")

if __name__ == '__main__':
    out_path = sys.argv[1] if len(sys.argv) > 1 else 'PINECO_Project_Submission_Round2.pdf'
    build_pdf(out_path)
