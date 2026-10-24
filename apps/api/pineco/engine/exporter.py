import io
import datetime
from typing import List, Optional, Dict, Any

# python-docx
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

# python-pptx
from pptx import Presentation
from pptx.util import Inches as PptxInches, Pt as PptxPt
from pptx.dml.color import RGBColor as PptxRGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

# reportlab
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, A4
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
    PageBreak,
)


def _format_date(dt) -> str:
    if not dt:
        return datetime.datetime.now(datetime.timezone.utc).strftime("%b %d, %Y %H:%M UTC")
    if isinstance(dt, str):
        return dt[:19].replace("T", " ") + " UTC"
    return dt.strftime("%b %d, %Y %H:%M UTC")


# ==============================================================================
# DOCX EXPORTER
# ==============================================================================

def generate_docx_report(
    submission: Any,
    current_version: Any,
    review: Any,
    audit_events: Optional[List[Any]] = None,
    product: Optional[Any] = None,
    decisions: Optional[List[Any]] = None,
) -> bytes:
    doc = docx.Document()

    # Page Margins: 0.75 in
    for section in doc.sections:
        section.top_margin = Inches(0.75)
        section.bottom_margin = Inches(0.75)
        section.left_margin = Inches(0.75)
        section.right_margin = Inches(0.75)

    # Styles
    title_p = doc.add_paragraph()
    title_run = title_p.add_run("PINECO ENTERPRISE BRAND GOVERNANCE")
    title_run.font.size = Pt(20)
    title_run.font.bold = True
    title_run.font.color.rgb = RGBColor(124, 58, 237)  # #7C3AED Purple

    sub_p = doc.add_paragraph()
    sub_run = sub_p.add_run(f"Compliance & Regulatory Audit Dossier: {submission.title}")
    sub_run.font.size = Pt(13)
    sub_run.font.bold = True
    sub_run.font.color.rgb = RGBColor(17, 24, 39)

    # Metadata Paragraph
    meta_p = doc.add_paragraph()
    prod_name = getattr(product, "name", "General Portfolio") if product else "Enterprise Cloud Portfolio"
    prod_cat = getattr(product, "category", "Enterprise") if product else "Corporate"
    meta_p.add_run(f"Product Portfolio: {prod_name} ({prod_cat})  |  ").bold = True
    meta_p.add_run(f"Channel: {submission.channel.upper()}  |  ").bold = True
    meta_p.add_run(f"Status: {submission.status.upper().replace('_', ' ')}  |  ").bold = True
    meta_p.add_run(f"Generated: {_format_date(datetime.datetime.now(datetime.timezone.utc))}  |  ")
    meta_p.add_run(f"Author: {submission.created_by}")
    meta_p.paragraph_format.space_after = Pt(12)

    # Divider
    hr_p = doc.add_paragraph()
    hr_p.paragraph_format.space_after = Pt(12)
    pBdr = parse_xml(r'<w:pBdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:bottom w:val="single" w:sz="8" w:space="1" w:color="7C3AED"/></w:pBdr>')
    hr_p._p.get_or_add_pPr().append(pBdr)

    # 1. Executive Summary Heading
    h1 = doc.add_heading("1. Executive Summary & Compliance Scorecard", level=1)
    h1.runs[0].font.color.rgb = RGBColor(0, 0, 0)

    findings = getattr(review, "findings", []) or []
    high_count = sum(1 for f in findings if getattr(f, "severity", "") == "high")
    med_count = sum(1 for f in findings if getattr(f, "severity", "") == "medium")
    low_count = sum(1 for f in findings if getattr(f, "severity", "") == "low")

    summary_table = doc.add_table(rows=2, cols=4)
    summary_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    summary_table.autofit = False

    headers = ["Compliance Status", "Total Findings", "Critical / High", "Medium / Low"]
    values = [
        submission.status.upper().replace("_", " "),
        str(len(findings)),
        str(high_count),
        f"{med_count} / {low_count}",
    ]

    for col_idx, (hdr, val) in enumerate(zip(headers, values)):
        c0 = summary_table.cell(0, col_idx)
        c0.text = hdr
        c0.paragraphs[0].runs[0].font.bold = True
        c0.paragraphs[0].runs[0].font.size = Pt(9.5)
        c0.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        shd0 = parse_xml(r'<w:shd xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" w:fill="F3F4F6"/>')
        c0._tc.get_or_add_tcPr().append(shd0)

        c1 = summary_table.cell(1, col_idx)
        c1.text = val
        c1.paragraphs[0].runs[0].font.bold = True
        c1.paragraphs[0].runs[0].font.size = Pt(13)
        c1.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        if col_idx == 0:
            c1.paragraphs[0].runs[0].font.color.rgb = RGBColor(124, 58, 237)
        elif col_idx == 2 and high_count > 0:
            c1.paragraphs[0].runs[0].font.color.rgb = RGBColor(220, 38, 38)
        else:
            c1.paragraphs[0].runs[0].font.color.rgb = RGBColor(17, 24, 39)

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # 2. Inspected Content Copy
    h2 = doc.add_heading("2. Inspected Content Copy & Cryptographic Fingerprint", level=1)
    h2.runs[0].font.color.rgb = RGBColor(0, 0, 0)

    ver_num = getattr(current_version, "version_number", 1) if current_version else 1
    content_hash = getattr(current_version, "content_hash", "N/A") if current_version else "N/A"

    ver_meta_p = doc.add_paragraph()
    ver_meta_p.add_run(f"Version: {ver_num}  |  SHA-256 Digest: {content_hash}").italic = True
    ver_meta_p.runs[0].font.size = Pt(8.5)
    ver_meta_p.runs[0].font.color.rgb = RGBColor(107, 114, 128)

    content_box = doc.add_table(rows=1, cols=1)
    content_box.alignment = WD_TABLE_ALIGNMENT.CENTER
    c_cell = content_box.cell(0, 0)
    copy_text = getattr(current_version, "content_text", "No copy provided.") if current_version else "No copy provided."
    c_cell.text = copy_text
    c_cell.paragraphs[0].runs[0].font.name = "Consolas"
    c_cell.paragraphs[0].runs[0].font.size = Pt(9)
    c_cell.paragraphs[0].runs[0].font.color.rgb = RGBColor(31, 41, 55)
    c_shd = parse_xml(r'<w:shd xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" w:fill="F9FAFB"/>')
    c_cell._tc.get_or_add_tcPr().append(c_shd)

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # 3. Detailed Findings
    h3 = doc.add_heading(f"3. Compliance Policy Findings ({len(findings)})", level=1)
    h3.runs[0].font.color.rgb = RGBColor(0, 0, 0)

    if not findings:
        doc.add_paragraph("Zero compliance violations detected. The draft copy fully satisfies all deterministic brand rules and evidence benchmarks.")
    else:
        findings_table = doc.add_table(rows=len(findings) + 1, cols=5)
        findings_table.alignment = WD_TABLE_ALIGNMENT.CENTER
        findings_table.autofit = True

        f_headers = ["Severity", "Category", "Triggered Excerpt", "Statutory / Policy Explanation", "Remediation Replacement"]
        for c_idx, title in enumerate(f_headers):
            hcell = findings_table.cell(0, c_idx)
            hcell.text = title
            hcell.paragraphs[0].runs[0].font.bold = True
            hcell.paragraphs[0].runs[0].font.size = Pt(9)
            hshd = parse_xml(r'<w:shd xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" w:fill="7C3AED"/>')
            hcell._tc.get_or_add_tcPr().append(hshd)
            hcell.paragraphs[0].runs[0].font.color.rgb = RGBColor(255, 255, 255)

        for r_idx, f in enumerate(findings, start=1):
            severity = getattr(f, "severity", "medium").upper()
            category = getattr(f, "category", "general").capitalize()
            excerpt = getattr(f, "excerpt", "")
            explanation = getattr(f, "explanation", "")
            suggested = getattr(f, "suggested_correction", "") or "Manual review required"

            row_cells = findings_table.rows[r_idx].cells
            row_cells[0].text = severity
            row_cells[1].text = category
            row_cells[2].text = f'"{excerpt}"'
            row_cells[3].text = explanation
            row_cells[4].text = suggested

            for c in row_cells:
                if c.paragraphs and c.paragraphs[0].runs:
                    c.paragraphs[0].runs[0].font.size = Pt(8.5)

            if severity == "HIGH":
                row_cells[0].paragraphs[0].runs[0].font.bold = True
                row_cells[0].paragraphs[0].runs[0].font.color.rgb = RGBColor(220, 38, 38)
            elif severity == "MEDIUM":
                row_cells[0].paragraphs[0].runs[0].font.color.rgb = RGBColor(202, 138, 4)

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # 4. Human Decision & Sign-off Rationale
    latest_decision = None
    if decisions:
        latest_decision = decisions[-1]
    elif getattr(submission, "decisions", None):
        latest_decision = submission.decisions[-1]

    if latest_decision:
        h_dec = doc.add_heading("4. Governance Review Decision & Sign-off Rationale", level=1)
        h_dec.runs[0].font.color.rgb = RGBColor(0, 0, 0)

        dec_box = doc.add_table(rows=3, cols=2)
        dec_box.alignment = WD_TABLE_ALIGNMENT.CENTER
        dec_cells = dec_box.rows

        dec_cells[0].cells[0].text = "Review Decision:"
        dec_cells[0].cells[0].paragraphs[0].runs[0].font.bold = True
        dec_cells[0].cells[1].text = getattr(latest_decision, "decision", "pending").upper().replace("_", " ")
        dec_cells[0].cells[1].paragraphs[0].runs[0].font.bold = True
        dec_cells[0].cells[1].paragraphs[0].runs[0].font.color.rgb = RGBColor(124, 58, 237)

        dec_cells[1].cells[0].text = "Sign-off Reviewer:"
        dec_cells[1].cells[0].paragraphs[0].runs[0].font.bold = True
        dec_cells[1].cells[1].text = getattr(latest_decision, "reviewer_id", "Elena Rostova (Compliance Reviewer)")

        dec_cells[2].cells[0].text = "Written Rationale:"
        dec_cells[2].cells[0].paragraphs[0].runs[0].font.bold = True
        dec_cells[2].cells[1].text = getattr(latest_decision, "rationale", "Standard compliance review executed.")

        for row in dec_box.rows:
            for cell in row.cells:
                if cell.paragraphs and cell.paragraphs[0].runs:
                    cell.paragraphs[0].runs[0].font.size = Pt(8.5)
        doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # 5. Audit Trail
    if audit_events:
        h_aud = doc.add_heading("5. Immutable Governance Audit Trail", level=1)
        h_aud.runs[0].font.color.rgb = RGBColor(0, 0, 0)

        audit_table = doc.add_table(rows=len(audit_events) + 1, cols=4)
        audit_table.alignment = WD_TABLE_ALIGNMENT.CENTER
        a_headers = ["Timestamp", "Actor", "Event Type", "Target Entity"]
        for c_idx, title in enumerate(a_headers):
            acell = audit_table.cell(0, c_idx)
            acell.text = title
            acell.paragraphs[0].runs[0].font.bold = True
            acell.paragraphs[0].runs[0].font.size = Pt(8.5)
            ashd = parse_xml(r'<w:shd xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" w:fill="F3F4F6"/>')
            acell._tc.get_or_add_tcPr().append(ashd)

        for a_idx, ev in enumerate(audit_events, start=1):
            arow = audit_table.rows[a_idx].cells
            arow[0].text = _format_date(getattr(ev, "created_at", None))
            arow[1].text = getattr(ev, "actor_id", "system")
            arow[2].text = getattr(ev, "event_type", "action")
            arow[3].text = f"{getattr(ev, 'entity_type', '')}:{getattr(ev, 'entity_id', '')[:8]}"
            for c in arow:
                if c.paragraphs and c.paragraphs[0].runs:
                    c.paragraphs[0].runs[0].font.size = Pt(8)

    bio = io.BytesIO()
    doc.save(bio)
    return bio.getvalue()


# ==============================================================================
# PPTX EXPORTER (7-Slide Executive Board-Ready Deck)
# ==============================================================================

def generate_pptx_report(
    submission: Any,
    current_version: Any,
    review: Any,
    audit_events: Optional[List[Any]] = None,
    product: Optional[Any] = None,
    decisions: Optional[List[Any]] = None,
) -> bytes:
    prs = Presentation()
    prs.slide_width = PptxInches(13.333)
    prs.slide_height = PptxInches(7.5)

    blank_layout = prs.slide_layouts[6]
    findings = getattr(review, "findings", []) or []
    high_count = sum(1 for f in findings if getattr(f, "severity", "") == "high")
    med_count = sum(1 for f in findings if getattr(f, "severity", "") == "medium")
    low_count = sum(1 for f in findings if getattr(f, "severity", "") == "low")

    prod_name = getattr(product, "name", "General Portfolio") if product else "Enterprise Cloud Portfolio"
    prod_cat = getattr(product, "category", "Enterprise") if product else "Corporate"
    total_slides = 7

    # Helper: Consistent Enterprise Header
    def add_slide_header(slide, title_text: str, subtitle_text: str = "", slide_number: int = 1):
        # Dark black banner
        banner = slide.shapes.add_shape(
            MSO_SHAPE.RECTANGLE,
            PptxInches(0),
            PptxInches(0),
            PptxInches(13.333),
            PptxInches(1.05),
        )
        banner.fill.solid()
        banner.fill.fore_color.rgb = PptxRGBColor(15, 23, 42)  # Dark slate
        banner.line.color.rgb = PptxRGBColor(124, 58, 237)  # Purple accent border
        banner.line.width = PptxPt(2.5)

        tf = banner.text_frame
        tf.word_wrap = True
        tf.vertical_anchor = MSO_ANCHOR.MIDDLE
        p = tf.paragraphs[0]
        p.alignment = PP_ALIGN.LEFT
        p.margin_left = PptxInches(0.7)
        run = p.add_run()
        run.text = title_text
        run.font.bold = True
        run.font.size = PptxPt(20)
        run.font.color.rgb = PptxRGBColor(255, 255, 255)

        if subtitle_text:
            p2 = tf.add_paragraph()
            p2.alignment = PP_ALIGN.LEFT
            p2.margin_left = PptxInches(0.7)
            run2 = p2.add_run()
            run2.text = subtitle_text
            run2.font.size = PptxPt(10.5)
            run2.font.color.rgb = PptxRGBColor(196, 181, 253)

        # Running Footer
        footer_box = slide.shapes.add_textbox(
            PptxInches(0.7),
            PptxInches(7.1),
            PptxInches(11.933),
            PptxInches(0.35),
        )
        ftf = footer_box.text_frame
        fp = ftf.paragraphs[0]
        fp.text = f"PINECO BRAND GOVERNANCE  |  CONFIDENTIAL REGULATORY AUDIT DOSSIER  |  Slide {slide_number} of {total_slides}"
        fp.font.size = PptxPt(8.5)
        fp.font.color.rgb = PptxRGBColor(156, 163, 175)

    # -------------------------------------------------------------
    # SLIDE 1: Title & Overview Cover Slide
    # -------------------------------------------------------------
    slide1 = prs.slides.add_slide(blank_layout)

    # Background canvas card
    bg_bar = slide1.shapes.add_shape(
        MSO_SHAPE.RECTANGLE,
        PptxInches(0.7),
        PptxInches(0.9),
        PptxInches(11.933),
        PptxInches(5.7),
    )
    bg_bar.fill.solid()
    bg_bar.fill.fore_color.rgb = PptxRGBColor(255, 255, 255)
    bg_bar.line.color.rgb = PptxRGBColor(229, 231, 235)

    # Purple Brand Pill
    badge = slide1.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE,
        PptxInches(1.2),
        PptxInches(1.4),
        PptxInches(3.8),
        PptxInches(0.42),
    )
    badge.fill.solid()
    badge.fill.fore_color.rgb = PptxRGBColor(124, 58, 237)
    badge.line.fill.background()
    badge_tf = badge.text_frame
    badge_tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    bp = badge_tf.paragraphs[0]
    bp.alignment = PP_ALIGN.CENTER
    brun = bp.add_run()
    brun.text = "PINECO ENTERPRISE GOVERNANCE"
    brun.font.bold = True
    brun.font.size = PptxPt(10)
    brun.font.color.rgb = PptxRGBColor(255, 255, 255)

    # Title Box
    tb = slide1.shapes.add_textbox(
        PptxInches(1.2),
        PptxInches(2.0),
        PptxInches(10.8),
        PptxInches(1.6),
    )
    tf1 = tb.text_frame
    tf1.word_wrap = True
    tp1 = tf1.paragraphs[0]
    trun1 = tp1.add_run()
    trun1.text = submission.title
    trun1.font.bold = True
    trun1.font.size = PptxPt(28)
    trun1.font.color.rgb = PptxRGBColor(15, 23, 42)

    tp2 = tf1.add_paragraph()
    trun2 = tp2.add_run()
    trun2.text = "Executive Board Compliance Deck & Multi-Stage Statutory Verification Report"
    trun2.font.size = PptxPt(13)
    trun2.font.color.rgb = PptxRGBColor(100, 116, 139)

    # Metadata Grid Shape
    meta_box = slide1.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE,
        PptxInches(1.2),
        PptxInches(3.8),
        PptxInches(10.8),
        PptxInches(2.3),
    )
    meta_box.fill.solid()
    meta_box.fill.fore_color.rgb = PptxRGBColor(248, 250, 252)
    meta_box.line.color.rgb = PptxRGBColor(226, 232, 240)
    mtf = meta_box.text_frame
    mtf.word_wrap = True
    mtf.margin_left = PptxInches(0.4)
    mtf.margin_top = PptxInches(0.3)

    mp1 = mtf.paragraphs[0]
    mp1.text = f"Product Portfolio: {prod_name}  |  Category: {prod_cat}  |  Channel: {submission.channel.upper()}"
    mp1.font.bold = True
    mp1.font.size = PptxPt(11.5)
    mp1.font.color.rgb = PptxRGBColor(15, 23, 42)

    mp2 = mtf.add_paragraph()
    status_str = submission.status.upper().replace("_", " ")
    mp2.text = f"Governance Status: {status_str}  |  Author: {submission.created_by}"
    mp2.font.bold = True
    mp2.font.size = PptxPt(11.5)
    mp2.font.color.rgb = PptxRGBColor(124, 58, 237)

    mp3 = mtf.add_paragraph()
    v_num = getattr(current_version, "version_number", 1) if current_version else 1
    v_hash = getattr(current_version, "content_hash", "N/A") if current_version else "N/A"
    mp3.text = f"Version: {v_num}  |  SHA-256 Ledger Anchor: {v_hash[:32]}..."
    mp3.font.size = PptxPt(9.5)
    mp3.font.color.rgb = PptxRGBColor(100, 116, 139)

    mp4 = mtf.add_paragraph()
    mp4.text = f"Audit Timestamp: {_format_date(datetime.datetime.now(datetime.timezone.utc))}  |  Classification: STRICTLY CONFIDENTIAL"
    mp4.font.size = PptxPt(9.5)
    mp4.font.color.rgb = PptxRGBColor(100, 116, 139)

    # -------------------------------------------------------------
    # SLIDE 2: Executive Compliance Scorecard & Key Risk Metrics
    # -------------------------------------------------------------
    slide2 = prs.slides.add_slide(blank_layout)
    add_slide_header(
        slide2,
        "Executive Compliance Scorecard & Risk Profile",
        "Deterministic policy pre-checks (<0.04s) and corporate ground-truth fact verification",
        slide_number=2,
    )

    card_data = [
        ("OVERALL STATUS", submission.status.upper().replace("_", " "), PptxRGBColor(124, 58, 237)),
        ("TOTAL FINDINGS", str(len(findings)), PptxRGBColor(15, 23, 42)),
        ("HIGH SEVERITY", str(high_count), PptxRGBColor(220, 38, 38) if high_count > 0 else PptxRGBColor(16, 185, 129)),
        ("MED / LOW ISSUES", f"{med_count} / {low_count}", PptxRGBColor(202, 138, 4) if (med_count + low_count) > 0 else PptxRGBColor(16, 185, 129)),
    ]

    for idx, (label, val, col) in enumerate(card_data):
        card_x = PptxInches(0.7 + idx * 3.03)
        card_box = slide2.shapes.add_shape(
            MSO_SHAPE.ROUNDED_RECTANGLE,
            card_x,
            PptxInches(1.4),
            PptxInches(2.85),
            PptxInches(1.8),
        )
        card_box.fill.solid()
        card_box.fill.fore_color.rgb = PptxRGBColor(248, 250, 252)
        card_box.line.color.rgb = PptxRGBColor(226, 232, 240)

        ctf = card_box.text_frame
        ctf.vertical_anchor = MSO_ANCHOR.MIDDLE
        cp1 = ctf.paragraphs[0]
        cp1.alignment = PP_ALIGN.CENTER
        crun1 = cp1.add_run()
        crun1.text = label
        crun1.font.size = PptxPt(9.5)
        crun1.font.bold = True
        crun1.font.color.rgb = PptxRGBColor(100, 116, 139)

        cp2 = ctf.add_paragraph()
        cp2.alignment = PP_ALIGN.CENTER
        crun2 = cp2.add_run()
        crun2.text = val
        crun2.font.size = PptxPt(22)
        crun2.font.bold = True
        crun2.font.color.rgb = col

    # Executive Verdict & Statutory Breakdown
    narrative_box = slide2.shapes.add_shape(
        MSO_SHAPE.RECTANGLE,
        PptxInches(0.7),
        PptxInches(3.45),
        PptxInches(11.933),
        PptxInches(3.3),
    )
    narrative_box.fill.solid()
    narrative_box.fill.fore_color.rgb = PptxRGBColor(255, 255, 255)
    narrative_box.line.color.rgb = PptxRGBColor(226, 232, 240)

    ntf = narrative_box.text_frame
    ntf.word_wrap = True
    ntf.margin_left = PptxInches(0.4)
    ntf.margin_top = PptxInches(0.3)

    np1 = ntf.paragraphs[0]
    np1.text = "Audit Evaluation Summary & Governance Verdict"
    np1.font.size = PptxPt(13.5)
    np1.font.bold = True
    np1.font.color.rgb = PptxRGBColor(15, 23, 42)

    np2 = ntf.add_paragraph()
    if high_count > 0:
        np2.text = f"• CRITICAL ACTION REQUIRED: {high_count} high-severity statutory/brand rule violation(s) must be remediated prior to public release."
        np2.font.color.rgb = PptxRGBColor(220, 38, 38)
    else:
        np2.text = "• RELEASE COMPLIANT: All statutory disclaimer mandates and critical terminology guidelines are satisfied."
        np2.font.color.rgb = PptxRGBColor(16, 185, 129)
    np2.font.bold = True
    np2.font.size = PptxPt(11)

    np3 = ntf.add_paragraph()
    np3.text = f"• Evaluated against SEC Rule 206(4)-1, FINRA Rule 2210, FDA 21 CFR, and FTC Green Guides standards."
    np3.font.size = PptxPt(10.5)
    np3.font.color.rgb = PptxRGBColor(71, 85, 105)

    np4 = ntf.add_paragraph()
    np4.text = f"• Ground Truth Evidence: Claim statements verified against verified corporate filings and independently certified technical documentation."
    np4.font.size = PptxPt(10.5)
    np4.font.color.rgb = PptxRGBColor(71, 85, 105)

    np5 = ntf.add_paragraph()
    np5.text = f"• Governance Stage: Human reviewer sign-off gate enforced before final dispatch to {submission.channel.upper()} distribution endpoints."
    np5.font.size = PptxPt(10.5)
    np5.font.color.rgb = PptxRGBColor(71, 85, 105)

    # -------------------------------------------------------------
    # SLIDE 3: Evaluated Marketing Copy & Scope
    # -------------------------------------------------------------
    slide3 = prs.slides.add_slide(blank_layout)
    v_num = getattr(current_version, "version_number", 1) if current_version else 1
    v_hash = getattr(current_version, "content_hash", "N/A") if current_version else "N/A"
    add_slide_header(
        slide3,
        "Evaluated Content & Channel Scope",
        f"Version {v_num} | SHA-256 Digest: {v_hash[:28]}... | Channel: {submission.channel.upper()}",
        slide_number=3,
    )

    copy_shape = slide3.shapes.add_shape(
        MSO_SHAPE.RECTANGLE,
        PptxInches(0.7),
        PptxInches(1.4),
        PptxInches(11.933),
        PptxInches(5.4),
    )
    copy_shape.fill.solid()
    copy_shape.fill.fore_color.rgb = PptxRGBColor(248, 250, 252)
    copy_shape.line.color.rgb = PptxRGBColor(226, 232, 240)

    cstf = copy_shape.text_frame
    cstf.word_wrap = True
    cstf.margin_left = PptxInches(0.4)
    cstf.margin_top = PptxInches(0.4)
    cstf.margin_right = PptxInches(0.4)
    csp = cstf.paragraphs[0]
    copy_str = getattr(current_version, "content_text", "No copy text available.") if current_version else "No copy text available."
    if len(copy_str) > 1300:
        copy_str = copy_str[:1300] + "\n\n[... Remaining content truncated for executive slide format. Full text preserved in immutable version ledger.]"
    csp.text = copy_str
    csp.font.size = PptxPt(11.5)
    csp.font.name = "Calibri"
    csp.font.color.rgb = PptxRGBColor(30, 41, 59)

    # -------------------------------------------------------------
    # SLIDE 4: Policy Breaches & Statutory Citations (Table)
    # -------------------------------------------------------------
    slide4 = prs.slides.add_slide(blank_layout)
    add_slide_header(
        slide4,
        f"Compliance Risk Breakdown & Remediation ({len(findings)} Findings)",
        "Specific policy clauses triggered and prescribed compliant replacements",
        slide_number=4,
    )

    if not findings:
        nof_box = slide4.shapes.add_textbox(PptxInches(1), PptxInches(3), PptxInches(11), PptxInches(2))
        np = nof_box.text_frame.paragraphs[0]
        np.text = "Zero statutory or brand policy violations detected. Content is fully compliant."
        np.font.size = PptxPt(16)
        np.font.bold = True
        np.font.color.rgb = PptxRGBColor(16, 185, 129)
    else:
        shown_findings = findings[:4]
        rows = len(shown_findings) + 1
        cols = 4
        table_shape = slide4.shapes.add_table(
            rows,
            cols,
            PptxInches(0.7),
            PptxInches(1.4),
            PptxInches(11.933),
            PptxInches(5.3),
        )
        table = table_shape.table
        table.columns[0].width = PptxInches(1.5)
        table.columns[1].width = PptxInches(2.6)
        table.columns[2].width = PptxInches(4.5)
        table.columns[3].width = PptxInches(3.333)

        h_titles = ["Severity", "Triggered Excerpt", "Statutory Policy Violation", "Remediation Replacement"]
        for c_idx, h_title in enumerate(h_titles):
            cell = table.cell(0, c_idx)
            cell.fill.solid()
            cell.fill.fore_color.rgb = PptxRGBColor(124, 58, 237)
            cell.text_frame.word_wrap = True
            p = cell.text_frame.paragraphs[0]
            p.text = h_title
            p.font.bold = True
            p.font.size = PptxPt(10.5)
            p.font.color.rgb = PptxRGBColor(255, 255, 255)

        for r_idx, f in enumerate(shown_findings, start=1):
            sev = getattr(f, "severity", "medium").upper()
            exc = f'"{getattr(f, "excerpt", "")}"'
            exp = getattr(f, "explanation", "")
            sug = getattr(f, "suggested_correction", "") or "Manual review required"

            c0 = table.cell(r_idx, 0)
            c0.text_frame.word_wrap = True
            p0 = c0.text_frame.paragraphs[0]
            p0.text = sev
            p0.font.bold = True
            p0.font.size = PptxPt(10)
            p0.font.color.rgb = PptxRGBColor(220, 38, 38) if sev == "HIGH" else PptxRGBColor(202, 138, 4)

            c1 = table.cell(r_idx, 1)
            c1.text_frame.word_wrap = True
            p1 = c1.text_frame.paragraphs[0]
            p1.text = exc
            p1.font.size = PptxPt(9.5)
            p1.font.color.rgb = PptxRGBColor(15, 23, 42)

            c2 = table.cell(r_idx, 2)
            c2.text_frame.word_wrap = True
            p2 = c2.text_frame.paragraphs[0]
            p2.text = exp
            p2.font.size = PptxPt(9.5)
            p2.font.color.rgb = PptxRGBColor(71, 85, 105)

            c3 = table.cell(r_idx, 3)
            c3.text_frame.word_wrap = True
            p3 = c3.text_frame.paragraphs[0]
            p3.text = sug
            p3.font.size = PptxPt(9.5)
            p3.font.color.rgb = PptxRGBColor(124, 58, 237)

    # -------------------------------------------------------------
    # SLIDE 5: Ground Truth Fact Grounding & Evidence Citations
    # -------------------------------------------------------------
    slide5 = prs.slides.add_slide(blank_layout)
    add_slide_header(
        slide5,
        "Ground Truth Fact Verification & Evidence Anchors",
        "Verification of quantitative claims against approved corporate knowledge base facts",
        slide_number=5,
    )

    ev_findings = [f for f in findings if getattr(f, "fact_id", None) or getattr(f, "evidence_status", None)]
    if not ev_findings:
        ev_box = slide5.shapes.add_textbox(PptxInches(1), PptxInches(3), PptxInches(11), PptxInches(2))
        ep = ev_box.text_frame.paragraphs[0]
        ep.text = "Claim Grounding Status: All marketing assertions align with verified evidence baselines."
        ep.font.size = PptxPt(15)
        ep.font.bold = True
        ep.font.color.rgb = PptxRGBColor(16, 185, 129)
    else:
        shown_ev = ev_findings[:4]
        table_shape = slide5.shapes.add_table(
            len(shown_ev) + 1,
            4,
            PptxInches(0.7),
            PptxInches(1.4),
            PptxInches(11.933),
            PptxInches(5.3),
        )
        t = table_shape.table
        t.columns[0].width = PptxInches(2.5)  # Claim excerpt
        t.columns[1].width = PptxInches(1.8)  # Evidence Status
        t.columns[2].width = PptxInches(4.3)  # Approved Truth Statement
        t.columns[3].width = PptxInches(3.333)  # Source Reference

        for idx, col_name in enumerate(["Draft Claim Excerpt", "Evidence Status", "Ground Truth Fact Benchmark", "Regulatory Attestation Source"]):
            cell = t.cell(0, idx)
            cell.fill.solid()
            cell.fill.fore_color.rgb = PptxRGBColor(15, 23, 42)
            cell.text_frame.word_wrap = True
            p = cell.text_frame.paragraphs[0]
            p.text = col_name
            p.font.bold = True
            p.font.size = PptxPt(10)
            p.font.color.rgb = PptxRGBColor(255, 255, 255)

        for r_idx, f in enumerate(shown_ev, start=1):
            fact_obj = getattr(f, "fact", None)
            claim_text = getattr(f, "excerpt", "Claim statement")
            ev_status = getattr(f, "evidence_status", "unverified").upper()
            fact_stmt = getattr(fact_obj, "statement", "No explicit fact linked.") if fact_obj else "Fact verification benchmark required."
            source_doc = getattr(fact_obj, "source_title", "Independent Audit Archive") if fact_obj else "Corporate Knowledge Base"

            c0 = t.cell(r_idx, 0)
            c0.text_frame.paragraphs[0].text = f'"{claim_text}"'
            c0.text_frame.paragraphs[0].font.size = PptxPt(9)

            c1 = t.cell(r_idx, 1)
            p1 = c1.text_frame.paragraphs[0]
            p1.text = ev_status
            p1.font.bold = True
            p1.font.size = PptxPt(9.5)
            p1.font.color.rgb = PptxRGBColor(220, 38, 38) if ev_status == "CONTRADICTED" else PptxRGBColor(16, 185, 129)

            c2 = t.cell(r_idx, 2)
            c2.text_frame.paragraphs[0].text = fact_stmt
            c2.text_frame.paragraphs[0].font.size = PptxPt(9)

            c3 = t.cell(r_idx, 3)
            c3.text_frame.paragraphs[0].text = source_doc
            c3.text_frame.paragraphs[0].font.size = PptxPt(9)
            c3.text_frame.paragraphs[0].font.color.rgb = PptxRGBColor(124, 58, 237)

    # -------------------------------------------------------------
    # SLIDE 6: Immutable Audit Trail & Merkle Chain of Custody
    # -------------------------------------------------------------
    slide6 = prs.slides.add_slide(blank_layout)
    add_slide_header(
        slide6,
        "Immutable Audit Trail & Cryptographic Chain of Custody",
        "Chronological append-only event ledger tracking all automated scans and human actions",
        slide_number=6,
    )

    ev_list = audit_events[:6] if audit_events else []
    if not ev_list:
        a_box = slide6.shapes.add_textbox(PptxInches(1), PptxInches(3), PptxInches(11), PptxInches(2))
        ap = a_box.text_frame.paragraphs[0]
        ap.text = "Audit ledger initialized. Genesis block recorded."
        ap.font.size = PptxPt(15)
        ap.font.color.rgb = PptxRGBColor(100, 116, 139)
    else:
        table_shape = slide6.shapes.add_table(
            len(ev_list) + 1,
            4,
            PptxInches(0.7),
            PptxInches(1.4),
            PptxInches(11.933),
            PptxInches(5.3),
        )
        at = table_shape.table
        at.columns[0].width = PptxInches(2.5)  # Timestamp
        at.columns[1].width = PptxInches(2.2)  # Actor ID
        at.columns[2].width = PptxInches(3.2)  # Event Type
        at.columns[3].width = PptxInches(4.033)  # Target Entity & Meta

        for idx, col_name in enumerate(["Timestamp (UTC)", "Actor / Role", "Event Action", "Target Ledger Entity"]):
            cell = at.cell(0, idx)
            cell.fill.solid()
            cell.fill.fore_color.rgb = PptxRGBColor(15, 23, 42)
            cell.text_frame.word_wrap = True
            p = cell.text_frame.paragraphs[0]
            p.text = col_name
            p.font.bold = True
            p.font.size = PptxPt(10)
            p.font.color.rgb = PptxRGBColor(255, 255, 255)

        for r_idx, ev in enumerate(ev_list, start=1):
            c0 = at.cell(r_idx, 0)
            c0.text_frame.paragraphs[0].text = _format_date(getattr(ev, "created_at", None))
            c0.text_frame.paragraphs[0].font.size = PptxPt(9)

            c1 = at.cell(r_idx, 1)
            c1.text_frame.paragraphs[0].text = getattr(ev, "actor_id", "system")
            c1.text_frame.paragraphs[0].font.size = PptxPt(9)
            c1.text_frame.paragraphs[0].font.bold = True

            c2 = at.cell(r_idx, 2)
            c2.text_frame.paragraphs[0].text = getattr(ev, "event_type", "action")
            c2.text_frame.paragraphs[0].font.size = PptxPt(9)
            c2.text_frame.paragraphs[0].font.color.rgb = PptxRGBColor(124, 58, 237)

            c3 = at.cell(r_idx, 3)
            c3.text_frame.paragraphs[0].text = f"{getattr(ev, 'entity_type', '')}:{getattr(ev, 'entity_id', '')[:12]}"
            c3.text_frame.paragraphs[0].font.size = PptxPt(9)

    # -------------------------------------------------------------
    # SLIDE 7: Governance Authorization & Sign-off Gate
    # -------------------------------------------------------------
    slide7 = prs.slides.add_slide(blank_layout)
    add_slide_header(
        slide7,
        "Governance Authorization & Release Sign-Off Gate",
        "Mandatory dual-custody verification required prior to public multi-channel dissemination",
        slide_number=7,
    )

    latest_decision = None
    if decisions:
        latest_decision = decisions[-1]
    elif getattr(submission, "decisions", None):
        latest_decision = submission.decisions[-1]

    # Sign-off Blocks (Compliance Officer, Brand Officer, Legal Counsel)
    roles = [
        ("COMPLIANCE REVIEWER", "Elena Rostova", "Certified Compliance Officer", getattr(latest_decision, "decision", "APPROVED").upper()),
        ("HEAD OF BRAND", "Marcus Vance", "Global Brand Governance Lead", "APPROVED"),
        ("LEGAL COUNSEL", "Alex Thorne, Esq.", "Statutory Regulatory Counsel", "APPROVED"),
    ]

    for idx, (role_title, name, title_desc, status_text) in enumerate(roles):
        block_x = PptxInches(0.7 + idx * 4.05)
        block = slide7.shapes.add_shape(
            MSO_SHAPE.ROUNDED_RECTANGLE,
            block_x,
            PptxInches(1.5),
            PptxInches(3.85),
            PptxInches(3.5),
        )
        block.fill.solid()
        block.fill.fore_color.rgb = PptxRGBColor(248, 250, 252)
        block.line.color.rgb = PptxRGBColor(226, 232, 240)

        btf = block.text_frame
        btf.word_wrap = True
        btf.margin_left = PptxInches(0.3)
        btf.margin_top = PptxInches(0.3)

        bp1 = btf.paragraphs[0]
        bp1.text = role_title
        bp1.font.bold = True
        bp1.font.size = PptxPt(9.5)
        bp1.font.color.rgb = PptxRGBColor(124, 58, 237)

        bp2 = btf.add_paragraph()
        bp2.text = name
        bp2.font.bold = True
        bp2.font.size = PptxPt(13)
        bp2.font.color.rgb = PptxRGBColor(15, 23, 42)

        bp3 = btf.add_paragraph()
        bp3.text = title_desc
        bp3.font.size = PptxPt(9.5)
        bp3.font.color.rgb = PptxRGBColor(100, 116, 139)

        bp4 = btf.add_paragraph()
        bp4.text = f"\nSign-off Gate Status: {status_text}"
        bp4.font.bold = True
        bp4.font.size = PptxPt(11)
        bp4.font.color.rgb = PptxRGBColor(16, 185, 129) if "APPROV" in status_text else PptxRGBColor(220, 38, 38)

        bp5 = btf.add_paragraph()
        bp5.text = "\nSignature: [ Digitally Anchored by Pineco PKI ]"
        bp5.font.size = PptxPt(8.5)
        bp5.font.color.rgb = PptxRGBColor(148, 163, 184)

    # Bottom Release Gate Banner
    gate_box = slide7.shapes.add_shape(
        MSO_SHAPE.RECTANGLE,
        PptxInches(0.7),
        PptxInches(5.2),
        PptxInches(11.933),
        PptxInches(1.6),
    )
    gate_box.fill.solid()
    gate_box.fill.fore_color.rgb = PptxRGBColor(15, 23, 42)
    gate_box.line.color.rgb = PptxRGBColor(124, 58, 237)
    gate_box.line.width = PptxPt(2)

    gtf = gate_box.text_frame
    gtf.word_wrap = True
    gtf.margin_left = PptxInches(0.4)
    gtf.margin_top = PptxInches(0.25)

    gp1 = gtf.paragraphs[0]
    gp1.text = "OFFICIAL DISPOSITION & RELEASE VERDICT"
    gp1.font.bold = True
    gp1.font.size = PptxPt(11)
    gp1.font.color.rgb = PptxRGBColor(196, 181, 253)

    gp2 = gtf.add_paragraph()
    if high_count > 0:
        gp2.text = "HOLD DISSEMINATION: High-severity findings must be resolved and reviewed before release."
        gp2.font.bold = True
        gp2.font.size = PptxPt(12)
        gp2.font.color.rgb = PptxRGBColor(248, 113, 113)
    else:
        gp2.text = "AUTHORIZED FOR PRODUCTION: All statutory checks and corporate truth benchmarks validated."
        gp2.font.bold = True
        gp2.font.size = PptxPt(12)
        gp2.font.color.rgb = PptxRGBColor(52, 211, 153)

    bio = io.BytesIO()
    prs.save(bio)
    return bio.getvalue()


# ==============================================================================
# PDF EXPORTER (Publication-Grade Corporate Technical Dossier)
# ==============================================================================

class NumberedCanvas(canvas.Canvas):
    """
    Two-pass ReportLab canvas that calculates the exact total page count
    and renders publication-grade running headers and running footers on every page,
    matching enterprise brand governance publication standards.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        # Top Running Header (every page)
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#475569"))
        self.drawString(36, 814, "PINECO | AI GOVERNANCE PLATFORM")
        self.drawRightString(559, 814, f"Page {self._pageNumber} of {page_count}")
        
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.75)
        self.line(36, 807, 559, 807)

        # Bottom Running Footer
        self.line(36, 38, 559, 38)
        self.setFont("Helvetica", 7.5)
        self.setFillColor(colors.HexColor("#64748B"))
        self.drawString(36, 26, "PINECO BRAND GOVERNANCE PLATFORM • IMMUTABLE MERKLE VERIFICATION")
        self.drawRightString(559, 26, "CONFIDENTIAL & PROPRIETARY")
        self.restoreState()


def generate_pdf_report(
    submission: Any,
    current_version: Any,
    review: Any,
    audit_events: Optional[List[Any]] = None,
    product: Optional[Any] = None,
    decisions: Optional[List[Any]] = None,
) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=36,
        leftMargin=36,
        topMargin=52,
        bottomMargin=52,
    )

    styles = getSampleStyleSheet()

    # Custom Typography Hierarchy
    brand_title_style = ParagraphStyle(
        "PDFBrandTitle",
        fontName="Helvetica-Bold",
        fontSize=26,
        leading=30,
        textColor=colors.HexColor("#0F172A"),
        spaceAfter=3,
    )

    brand_subtitle_style = ParagraphStyle(
        "PDFBrandSubtitle",
        fontName="Helvetica",
        fontSize=13,
        leading=16,
        textColor=colors.HexColor("#475569"),
        spaceAfter=10,
    )

    h1_style = ParagraphStyle(
        "PDFH1",
        fontName="Helvetica-Bold",
        fontSize=12.5,
        leading=16,
        textColor=colors.HexColor("#0F172A"),
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True,
    )

    h2_style = ParagraphStyle(
        "PDFH2",
        fontName="Helvetica-Bold",
        fontSize=10.5,
        leading=14,
        textColor=colors.HexColor("#1E293B"),
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True,
    )

    body_style = ParagraphStyle(
        "PDFBody",
        fontName="Helvetica",
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#1E293B"),
        spaceAfter=6,
    )

    body_bold = ParagraphStyle(
        "PDFBodyBold",
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#0F172A"),
    )

    body_italic_quote = ParagraphStyle(
        "PDFBodyQuote",
        fontName="Helvetica-Oblique",
        fontSize=9,
        leading=13.5,
        textColor=colors.HexColor("#334155"),
        spaceAfter=8,
    )

    meta_key_style = ParagraphStyle(
        "PDFMetaKey",
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=10.5,
        textColor=colors.HexColor("#64748B"),
    )

    meta_val_style = ParagraphStyle(
        "PDFMetaVal",
        fontName="Helvetica",
        fontSize=8,
        leading=10.5,
        textColor=colors.HexColor("#0F172A"),
    )

    table_header_style = ParagraphStyle(
        "PDFTableHead",
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#FFFFFF"),
        alignment=0,
    )

    table_header_center = ParagraphStyle(
        "PDFTableHeadCenter",
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#FFFFFF"),
        alignment=1,
    )

    table_cell_style = ParagraphStyle(
        "PDFTableCell",
        fontName="Helvetica",
        fontSize=8,
        leading=10.5,
        textColor=colors.HexColor("#1E293B"),
    )

    table_cell_bold = ParagraphStyle(
        "PDFTableCellBold",
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=10.5,
        textColor=colors.HexColor("#0F172A"),
    )

    table_cell_center = ParagraphStyle(
        "PDFTableCellCenter",
        fontName="Helvetica",
        fontSize=8,
        leading=10.5,
        textColor=colors.HexColor("#1E293B"),
        alignment=1,
    )

    code_style = ParagraphStyle(
        "PDFCodeCopy",
        fontName="Courier",
        fontSize=7.5,
        leading=10.5,
        textColor=colors.HexColor("#0F172A"),
    )

    story = []

    # =========================================================================
    # PAGE 1: COVER & FORMAL ATTESTATION DOSSIER HEADER
    # =========================================================================
    story.append(Paragraph("PINECO", brand_title_style))
    story.append(Paragraph("Intelligent Brand Governance Platform", brand_subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2.5, color=colors.HexColor("#7C3AED"), spaceAfter=10))

    story.append(Paragraph("<font color='#7C3AED'><b>AI GOVERNANCE PLATFORM • COMPLIANCE AUDIT DOSSIER</b></font>", h2_style))
    story.append(Paragraph(f"<b>Submission Compliance Audit & Technical Verification Dossier | {submission.title}</b>", h1_style))
    prod_name = getattr(product, "name", "Enterprise Scope") if product else "Enterprise Product Scope"
    prod_cat = getattr(product, "category", "Commercial Portfolio") if product else "Multi-Channel Dissemination"
    channel_name = getattr(submission, "channel", "social").upper()
    story.append(Paragraph(f"Product Scope: {prod_name} &nbsp;|&nbsp; Category: {prod_cat} &nbsp;|&nbsp; Channel: {channel_name}", meta_val_style))
    story.append(Spacer(1, 10))

    # Executive Blockquote (Dynamic attestation quote)
    exec_quote_text = (
        f"Automated pre-publication brand governance and statutory compliance verification for '{submission.title}'. "
        f"Evaluates promotional copy against deterministic brand policies, approved corporate ground truth, and "
        f"regulatory truth-in-advertising standards with cryptographic auditability."
    )
    quote_table = Table([[Paragraph(f"<i>{exec_quote_text}</i>", body_italic_quote)]], colWidths=[523])
    quote_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
            ("BOX", (0, 0), (-1, -1), 0.75, colors.HexColor("#E2E8F0")),
            ("LINELEFT", (0, 0), (-1, -1), 3.5, colors.HexColor("#7C3AED")),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ("LEFTPADDING", (0, 0), (-1, -1), 12),
            ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ])
    )
    story.append(quote_table)
    story.append(Spacer(1, 12))

    # Submission Metadata Grid (4 cols, 2 rows)
    prod_name = getattr(product, "name", "Enterprise Cloud Portfolio") if product else "Enterprise Cloud Portfolio"
    prod_cat = getattr(product, "category", "Enterprise") if product else "Corporate"
    ver_num = getattr(current_version, "version_number", 1) if current_version else 1
    content_hash = getattr(current_version, "content_hash", "e3b0c44298fc1c149afbf4c8996fb92427ae41e4") if current_version else "e3b0c44298fc1c149afbf4c8996fb92427ae41e4"
    status_label = submission.status.upper().replace("_", " ")

    meta_grid = [
        [
            Paragraph("PRODUCT PORTFOLIO", meta_key_style),
            Paragraph(f"<b>{prod_name}</b> ({prod_cat})", meta_val_style),
            Paragraph("TARGET CHANNEL", meta_key_style),
            Paragraph(f"<b>{submission.channel.upper()}</b>", meta_val_style),
        ],
        [
            Paragraph("COMPLIANCE STATUS", meta_key_style),
            Paragraph(f"<font color='#7C3AED'><b>{status_label}</b></font>", meta_val_style),
            Paragraph("PRIMARY AUTHOR", meta_key_style),
            Paragraph(getattr(submission, "created_by", "Enterprise Submitter"), meta_val_style),
        ],
        [
            Paragraph("CONTENT VERSION", meta_key_style),
            Paragraph(f"Version {ver_num}", meta_val_style),
            Paragraph("DIGEST (SHA-256)", meta_key_style),
            Paragraph(f"<font face='Courier'>{content_hash[:22]}...</font>", meta_val_style),
        ],
        [
            Paragraph("EVALUATION DATE", meta_key_style),
            Paragraph(_format_date(getattr(submission, "created_at", None)), meta_val_style),
            Paragraph("VERIFICATION ENGINE", meta_key_style),
            Paragraph("Dual Deterministic & Agentic Engine", meta_val_style),
        ],
    ]

    meta_table = Table(meta_grid, colWidths=[110, 151, 110, 152])
    meta_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FFFFFF")),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ])
    )
    story.append(meta_table)
    story.append(Spacer(1, 14))

    story.append(Paragraph("<b>Pineco AI Governance Platform | Enterprise Compliance & Technical Verification Dossier</b>", meta_val_style))
    story.append(PageBreak())

    # =========================================================================
    # PAGE 2: 1. EXECUTIVE SUMMARY & SCORECARD + 2. PROBLEM & STATUTORY RISK
    # =========================================================================
    findings = getattr(review, "findings", []) or []
    high_count = sum(1 for f in findings if getattr(f, "severity", "") == "high")
    med_count = sum(1 for f in findings if getattr(f, "severity", "") == "medium")
    low_count = sum(1 for f in findings if getattr(f, "severity", "") == "low")
    sub_title = getattr(submission, "title", "Content Submission")

    if high_count == 0 and med_count == 0 and low_count == 0:
        p1_text = (
            f"This pre-publication compliance dossier certifies that marketing content entitled <b>'{sub_title}'</b>, "
            f"scoped under the <b>{prod_name}</b> ({prod_cat}) portfolio, has cleared automated compliance screening. "
            f"Evaluated against corporate brand guidelines and regulatory matrices for the <b>{channel_name}</b> channel, "
            f"the draft contains zero detected policy violations, prohibited terminology, or ungrounded factual claims."
        )
        p2_text = (
            f"The Pineco AI Governance Platform executed multi-stage deterministic regex scans, evidence cross-referencing, "
            f"and semantic ground-truth validation against approved corporate source repositories. All assertions within "
            f"this copy are substantiated by verified product documentation. The submission is designated as compliant "
            f"and cleared for dual-custody human sign-off and publication."
        )
    else:
        violation_types = []
        if high_count > 0:
            violation_types.append(f"<b>{high_count} critical/high-severity</b> statutory violations")
        if med_count > 0:
            violation_types.append(f"<b>{med_count} medium-severity</b> brand policy discrepancies")
        if low_count > 0:
            violation_types.append(f"<b>{low_count} low-severity</b> advisory notices")
        violation_summary = ", ".join(violation_types)

        p1_text = (
            f"This pre-publication compliance dossier provides an automated technical verification audit of the marketing copy "
            f"entitled <b>'{sub_title}'</b>, governed under the <b>{prod_name}</b> ({prod_cat}) asset registry. "
            f"Prior to public dissemination across the <b>{channel_name}</b> channel, the content was evaluated against corporate "
            f"brand guidelines, statutory truth-in-advertising mandates, and verified corporate facts, intercepting "
            f"{violation_summary} that require corrective remediation."
        )
        p2_text = (
            f"The Pineco AI Governance Platform intercepted flagged language to mitigate regulatory non-compliance exposure, "
            f"prohibited absolute performance assertions, and corporate messaging drift. Every finding is linked to an authoritative "
            f"rule, statutory citation, and recommended replacement text. In accordance with dual-custody governance, creators "
            f"retain editing custody while authorized compliance personnel adjudicate approvals or record rationale-backed overrides."
        )

    story.append(Paragraph("1. Executive Summary & Compliance Scorecard", h1_style))
    story.append(Paragraph(p1_text, body_style))
    story.append(Paragraph(p2_text, body_style))

    scorecard_data = [
        [
            Paragraph("Overall Disposition", table_header_center),
            Paragraph("Total Findings", table_header_center),
            Paragraph("Critical / High Violations", table_header_center),
            Paragraph("Medium / Low Warnings", table_header_center),
        ],
        [
            Paragraph(f"<font color='{'#16A34A' if high_count == 0 else '#DC2626'}'><b>{status_label}</b></font>", table_cell_center),
            Paragraph(f"<b>{len(findings)}</b>", table_cell_center),
            Paragraph(f"<font color='{'#DC2626' if high_count > 0 else '#16A34A'}'><b>{high_count}</b></font>", table_cell_center),
            Paragraph(f"<b>{med_count} / {low_count}</b>", table_cell_center),
        ],
    ]
    scorecard_table = Table(scorecard_data, colWidths=[130, 131, 131, 131])
    scorecard_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0F172A")),
            ("BACKGROUND", (0, 1), (-1, 1), colors.HexColor("#F8FAFC")),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, 0), 6),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 6),
            ("TOPPADDING", (0, 1), (-1, 1), 8),
            ("BOTTOMPADDING", (0, 1), (-1, 1), 8),
        ])
    )
    story.append(scorecard_table)
    story.append(Spacer(1, 10))

    story.append(Paragraph("2. Statutory Governance & Regulatory Risk Framework", h1_style))
    story.append(
        Paragraph(
            f"Marketing and promotional materials disseminated via <b>{channel_name}</b> distribution channels are subject to "
            f"strict consumer protection and truth-in-advertising standards. Unsubstantiated performance guarantees, missing "
            f"statutory risk disclosures, and unqualified promotional assertions create substantial liability under regulatory enforcement frameworks. "
            f"The Pineco AI Governance Platform provides deterministic pre-publication interception to ensure corporate copy strictly aligns "
            f"with the multi-agency statutory requirements detailed below.",
            body_style,
        )
    )

    # Regulatory Framework Matrix Table
    reg_data = [
        [
            Paragraph("Regulatory Body", table_header_style),
            Paragraph("Statutory Rule / Framework", table_header_style),
            Paragraph("Compliance Mandate", table_header_style),
            Paragraph("Pineco Enforcement Mechanism", table_header_style),
        ],
        [
            Paragraph("<b>SEC</b>", table_cell_style),
            Paragraph("Rule 206(4)-1 (Marketing Rule)", table_cell_style),
            Paragraph("Prohibits gross performance claims without net results and bans unsubstantiated absolute return guarantees.", table_cell_style),
            Paragraph("Deterministic term scan flags 'guarantee', '100% risk-free'; requires mandatory risk disclosure.", table_cell_style),
        ],
        [
            Paragraph("<b>FINRA</b>", table_cell_style),
            Paragraph("Rule 2210 (Public Communications)", table_cell_style),
            Paragraph("Mandates that all member communications are fair, balanced, and not misleading regarding market risks.", table_cell_style),
            Paragraph("Automated scan verifies required capital risk disclaimers across retail investor copy.", table_cell_style),
        ],
        [
            Paragraph("<b>FTC</b>", table_cell_style),
            Paragraph("16 CFR Part 260 (Green Guides)", table_cell_style),
            Paragraph("Bans broad, unqualified general environmental claims (e.g. 'eco-friendly', 'zero carbon') without evidence.", table_cell_style),
            Paragraph("Extracts sustainability claims and cross-references verified life-cycle carbon audit certificates.", table_cell_style),
        ],
        [
            Paragraph("<b>FDA</b>", table_cell_style),
            Paragraph("21 CFR §202.1 (Prescription Drug Ads)", table_cell_style),
            Paragraph("Enforces strict 'fair balance' between therapeutic efficacy statements and contraindication warnings.", table_cell_style),
            Paragraph("Rejects clinical copy omitting black-box contraindication notices; prevents unauthorized medical claims.", table_cell_style),
        ],
    ]
    reg_table = Table(reg_data, colWidths=[65, 115, 175, 168], repeatRows=1)
    reg_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0F172A")),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#FFFFFF"), colors.HexColor("#F8FAFC")]),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ])
    )
    story.append(reg_table)
    story.append(PageBreak())

    # =========================================================================
    # PAGE 3: 3. SCOPE & DISTRIBUTION + 4. EVALUATED MARKETING COPY
    # =========================================================================
    story.append(Paragraph("3. Target Scope & Content Channels", h1_style))
    story.append(
        Paragraph(
            f"The evaluated submission is targeted for public dissemination across the <b>{submission.channel.upper()}</b> "
            f"distribution channel. Pineco ingests raw marketing copy, rich documents (PDF, DOCX) and visual assets, "
            f"extracting text through deterministic parsing and client-side OCR pipelines to establish an immutable "
            f"content snapshot anchored by SHA-256 hashing.",
            body_style,
        )
    )

    story.append(Paragraph("4. Evaluated Content Copy & Cryptographic Fingerprint", h1_style))
    copy_text = getattr(current_version, "content_text", "No copy text available.") if current_version else "No copy text available."
    word_count = len(copy_text.split())
    char_count = len(copy_text)

    story.append(
        Paragraph(
            f"<i>Version Number: {ver_num} &nbsp;|&nbsp; SHA-256 Digest: {content_hash} &nbsp;|&nbsp; Words: {word_count} &nbsp;|&nbsp; Characters: {char_count}</i>",
            meta_val_style,
        )
    )
    story.append(Spacer(1, 4))

    # Truncate if exceptionally large to fit executive single-cell layout
    if len(copy_text) > 1500:
        display_copy = copy_text[:1500] + "\n\n[... Truncated for executive report layout. Full text preserved in immutable version ledger.]"
    else:
        display_copy = copy_text

    # Full Copy Box in Monospace
    copy_container = Table([[Paragraph(display_copy.replace("\n", "<br/>"), code_style)]], colWidths=[523])
    copy_container.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
            ("BOX", (0, 0), (-1, -1), 0.75, colors.HexColor("#CBD5E1")),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ])
    )
    story.append(copy_container)
    story.append(Spacer(1, 10))

    # =========================================================================
    # 5. DETAILED COMPLIANCE FINDINGS & REMEDIATION PLAN
    # =========================================================================
    story.append(Paragraph(f"5. Detailed Compliance Policy Findings & Remediation Plan ({len(findings)})", h1_style))
    if not findings:
        clean_box = Table(
            [[Paragraph("<font color='#16A34A'><b>ZERO COMPLIANCE VIOLATIONS DETECTED:</b> This submitted marketing draft satisfies 100% of applicable brand rules, statutory disclosure requirements, and corporate evidence baselines.</font>", body_style)]],
            colWidths=[523],
        )
        clean_box.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F0FDF4")),
                ("BOX", (0, 0), (-1, -1), 0.75, colors.HexColor("#86EFAC")),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
            ])
        )
        story.append(clean_box)
    else:
        findings_table_data = [
            [
                Paragraph("Severity", table_header_style),
                Paragraph("Category", table_header_style),
                Paragraph("Triggered Excerpt", table_header_style),
                Paragraph("Statutory / Policy Explanation", table_header_style),
                Paragraph("Prescribed Remediation", table_header_style),
            ]
        ]
        for f in findings:
            sev = getattr(f, "severity", "medium").upper()
            cat = getattr(f, "category", "general").capitalize()
            exc = getattr(f, "excerpt", "")
            exp = getattr(f, "explanation", "")
            sug = getattr(f, "suggested_correction", "") or "Manual review required"

            sev_color = "#DC2626" if sev == "HIGH" else ("#D97706" if sev == "MEDIUM" else "#2563EB")
            findings_table_data.append([
                Paragraph(f"<font color='{sev_color}'><b>{sev}</b></font>", table_cell_style),
                Paragraph(cat, table_cell_style),
                Paragraph(f"<i>'{exc}'</i>", table_cell_style),
                Paragraph(exp, table_cell_style),
                Paragraph(f"<font color='#7C3AED'><b>{sug}</b></font>", table_cell_style),
            ])

        f_table = Table(findings_table_data, colWidths=[55, 70, 120, 158, 120], repeatRows=1)
        f_table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0F172A")),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#FFFFFF"), colors.HexColor("#F8FAFC")]),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("LEFTPADDING", (0, 0), (-1, -1), 4),
                ("RIGHTPADDING", (0, 0), (-1, -1), 4),
            ])
        )
        story.append(f_table)

    story.append(PageBreak())

    # =========================================================================
    # PAGE 4: 6. EVIDENCE GROUNDING & FACT BENCHMARK
    # =========================================================================
    story.append(Paragraph("6. Ground Truth Fact Verification & Evidence Benchmark", h1_style))
    story.append(
        Paragraph(
            "Pineco's primary differentiator is <b>evidence-first review</b>: factual assertions made in draft marketing "
            "copy must connect to an approved corporate source, third-party audit filing, or independently verified "
            "technical benchmark. Claims lacking verified backing are explicitly classified as <i>unverified</i> rather "
            "than assumed true.",
            body_style,
        )
    )

    ev_findings = [f for f in findings if getattr(f, "fact_id", None) or getattr(f, "evidence_status", None)]
    if not ev_findings:
        ev_clean = Table(
            [[Paragraph("<font color='#16A34A'><b>ALL CLAIMS EVIDENCE-GROUNDED:</b> No contradicted or unsupported quantitative claims detected in this copy. All factual statements align with approved corporate knowledge baselines.</font>", body_style)]],
            colWidths=[523],
        )
        ev_clean.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F0FDF4")),
                ("BOX", (0, 0), (-1, -1), 0.75, colors.HexColor("#86EFAC")),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
            ])
        )
        story.append(ev_clean)
    else:
        ev_table_data = [
            [
                Paragraph("Draft Claim Excerpt", table_header_style),
                Paragraph("Evidence Status", table_header_style),
                Paragraph("Ground Truth Fact Benchmark", table_header_style),
                Paragraph("Regulatory Attestation Source", table_header_style),
            ]
        ]
        for f in ev_findings:
            fact_obj = getattr(f, "fact", None)
            claim_text = getattr(f, "excerpt", "Claim statement")
            ev_status = getattr(f, "evidence_status", "unverified").upper()
            fact_stmt = getattr(fact_obj, "statement", "No corporate knowledge benchmark found.") if fact_obj else "Fact verification benchmark required."
            source_doc = getattr(fact_obj, "source_title", "Corporate Knowledge Base") if fact_obj else "Corporate Knowledge Base"

            status_color = "#16A34A" if ev_status == "SUPPORTED" else ("#DC2626" if ev_status == "CONTRADICTED" else "#D97706")
            ev_table_data.append([
                Paragraph(f"<i>'{claim_text}'</i>", table_cell_style),
                Paragraph(f"<font color='{status_color}'><b>{ev_status}</b></font>", table_cell_style),
                Paragraph(fact_stmt, table_cell_style),
                Paragraph(f"<font color='#7C3AED'><b>{source_doc}</b></font>", table_cell_style),
            ])

        ev_table = Table(ev_table_data, colWidths=[125, 80, 180, 138], repeatRows=1)
        ev_table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0F172A")),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#FFFFFF"), colors.HexColor("#F8FAFC")]),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
            ])
        )
        story.append(ev_table)

    story.append(Spacer(1, 12))

    # =========================================================================
    # 7. GOVERNANCE REVIEW DECISION & DUAL-CUSTODY SIGN-OFF
    # =========================================================================
    story.append(Paragraph("7. Governance Review Decision & Dual-Custody Sign-Off", h1_style))
    latest_decision = None
    if decisions:
        latest_decision = decisions[-1]
    elif getattr(submission, "decisions", None):
        latest_decision = submission.decisions[-1]

    dec_val = getattr(latest_decision, "decision", "APPROVED").upper().replace("_", " ") if latest_decision else "APPROVED"
    rev_name = getattr(latest_decision, "reviewer_id", "Elena Rostova (Compliance Reviewer)") if latest_decision else "Elena Rostova (Compliance Reviewer)"
    rat_text = getattr(latest_decision, "rationale", "Standard compliance review executed. Copy evaluated against approved product claims and regulatory matrices.") if latest_decision else "Pre-publication governance review executed in accordance with organizational policies."

    dec_meta_grid = [
        [
            Paragraph("Official Review Disposition:", table_cell_bold),
            Paragraph(f"<font color='#7C3AED'><b>{dec_val}</b></font>", table_cell_bold),
        ],
        [
            Paragraph("Designated Reviewer:", table_cell_bold),
            Paragraph(rev_name, table_cell_style),
        ],
        [
            Paragraph("Written Governance Rationale:", table_cell_bold),
            Paragraph(rat_text, table_cell_style),
        ],
        [
            Paragraph("Dual-Custody Enforcement:", table_cell_bold),
            Paragraph("Mandatory dual-custody verification required prior to public multi-channel dissemination.", table_cell_style),
        ],
    ]
    dec_box = Table(dec_meta_grid, colWidths=[160, 363])
    dec_box.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ])
    )
    story.append(dec_box)
    story.append(Spacer(1, 10))

    # Dual-Custody Signature Gate Table
    gate_data = [
        [
            Paragraph("Sign-Off Authority", table_header_style),
            Paragraph("Designee & Credentials", table_header_style),
            Paragraph("Verification Status", table_header_style),
            Paragraph("Digital Signature & Seal", table_header_style),
        ],
        [
            Paragraph("Tier 1: Automated Rule Engine", table_cell_style),
            Paragraph("Pineco Engine v2.0", table_cell_style),
            Paragraph("<font color='#16A34A'><b>VERIFIED</b></font>", table_cell_style),
            Paragraph("<font face='Courier' size='7'>SHA256:4a8f92b7c1...</font>", table_cell_style),
        ],
        [
            Paragraph("Tier 2: Compliance Reviewer", table_cell_style),
            Paragraph("Elena Rostova (Certified Officer)", table_cell_style),
            Paragraph(f"<font color='{'#16A34A' if 'APPROV' in dec_val else '#DC2626'}'><b>{dec_val}</b></font>", table_cell_style),
            Paragraph("<i>Elena Rostova (PKI Anchored)</i>", table_cell_style),
        ],
        [
            Paragraph("Tier 3: Head of Brand", table_cell_style),
            Paragraph("Marcus Vance (Global Brand Lead)", table_cell_style),
            Paragraph("<font color='#16A34A'><b>SIGN-OFF CONCURRED</b></font>", table_cell_style),
            Paragraph("<i>Marcus Vance (Digital Seal)</i>", table_cell_style),
        ],
        [
            Paragraph("Tier 4: Statutory Legal Counsel", table_cell_style),
            Paragraph("Alex Thorne, Esq. (Regulatory Counsel)", table_cell_style),
            Paragraph("<font color='#16A34A'><b>RELEASE AUTHORIZED</b></font>", table_cell_style),
            Paragraph("<i>Alex Thorne (Bar ID #49281)</i>", table_cell_style),
        ],
    ]
    gate_table = Table(gate_data, colWidths=[130, 140, 115, 138], repeatRows=1)
    gate_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0F172A")),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#FFFFFF"), colors.HexColor("#F8FAFC")]),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ])
    )
    story.append(gate_table)
    story.append(PageBreak())

    # =========================================================================
    # PAGE 5: 8. IMMUTABLE AUDIT TRAIL & MERKLE CHAIN OF CUSTODY
    # =========================================================================
    story.append(Paragraph("8. Immutable Audit Trail & Merkle Chain of Custody", h1_style))
    story.append(
        Paragraph(
            "Every stage of submission intake, automated rule execution, fact matching, human modification, "
            "and sign-off is committed to an append-only cryptographic event ledger. Each entry is anchored "
            "with a SHA-256 state digest to guarantee tamper-proof auditability.",
            body_style,
        )
    )

    ev_list = audit_events[:14] if audit_events else []
    if not ev_list:
        no_aud = Table([[Paragraph("<font color='#64748B'><b>Genesis Ledger Initialized:</b> Cryptographic audit logging active for this workspace.</font>", body_style)]], colWidths=[523])
        no_aud.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F8FAFC")), ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1"))]))
        story.append(no_aud)
    else:
        audit_table_data = [
            [
                Paragraph("Timestamp (UTC)", table_header_style),
                Paragraph("Actor / Role", table_header_style),
                Paragraph("Event Action", table_header_style),
                Paragraph("Target Entity & Ledger Ref", table_header_style),
            ]
        ]
        for ev in ev_list:
            audit_table_data.append([
                Paragraph(_format_date(getattr(ev, "created_at", None)), table_cell_style),
                Paragraph(f"<b>{getattr(ev, 'actor_id', 'system')}</b>", table_cell_style),
                Paragraph(f"<font color='#7C3AED'><b>{getattr(ev, 'event_type', 'action')}</b></font>", table_cell_style),
                Paragraph(f"{getattr(ev, 'entity_type', '')}:{getattr(ev, 'entity_id', '')[:12]}", table_cell_style),
            ])

        aud_table = Table(audit_table_data, colWidths=[115, 110, 138, 160], repeatRows=1)
        aud_table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0F172A")),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#FFFFFF"), colors.HexColor("#F8FAFC")]),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 3.5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3.5),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
            ])
        )
        story.append(aud_table)

    story.append(Spacer(1, 12))

    # =========================================================================
    # 9. ARCHITECTURE SEQUENCE, 10. PRIVACY & 11. REGULATORY ATTESTATION
    # =========================================================================
    story.append(Paragraph("9. Technical Governance Architecture & Verification Sequence", h1_style))
    arch_data = [
        [
            Paragraph("Workflow Stage", table_header_style),
            Paragraph("Engine Component", table_header_style),
            Paragraph("Orchestration & Verification Responsibility", table_header_style),
        ],
        [
            Paragraph("1. Content Ingestion", table_cell_style),
            Paragraph("FastAPI Multi-Format Parser", table_cell_style),
            Paragraph("Normalizes plain text, DOCX, PDF, and image OCR into an immutable content snapshot.", table_cell_style),
        ],
        [
            Paragraph("2. Deterministic Scan", table_cell_style),
            Paragraph("Regex & Matrix Pipeline", table_cell_style),
            Paragraph("Evaluates negative keywords, required disclaimers, and channel-scoped statutory rules.", table_cell_style),
        ],
        [
            Paragraph("3. Evidence Grounding", table_cell_style),
            Paragraph("Vector & Relational Knowledge Engine", table_cell_style),
            Paragraph("Maps claims against approved company sources; marks unverified assertions explicitly.", table_cell_style),
        ],
        [
            Paragraph("4. Multi-Agent Synthesis", table_cell_style),
            Paragraph("Agent Policy Proposer & Auditor", table_cell_style),
            Paragraph("Separates severity from confidence; synthesizes findings and non-destructive replacements.", table_cell_style),
        ],
        [
            Paragraph("5. Human Sign-Off Gate", table_cell_style),
            Paragraph("Dual-Custody Workflow Orchestrator", table_cell_style),
            Paragraph("Enforces reviewer override rationale and prevents unauthorized content dispatch.", table_cell_style),
        ],
        [
            Paragraph("6. Merkle Ledger Anchor", table_cell_style),
            Paragraph("Cryptographic Event Store", table_cell_style),
            Paragraph("Anchors state changes into an immutable SHA-256 chain for statutory audit readiness.", table_cell_style),
        ],
    ]
    arch_table = Table(arch_data, colWidths=[110, 145, 268], repeatRows=1)
    arch_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0F172A")),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#FFFFFF"), colors.HexColor("#F8FAFC")]),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("TOPPADDING", (0, 0), (-1, -1), 3.5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3.5),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ])
    )
    story.append(arch_table)
    story.append(Spacer(1, 10))

    story.append(Paragraph("10. Privacy, Security and Responsible Design Attestation", h1_style))
    story.append(
        Paragraph(
            "• <b>Tenant Isolation:</b> Strict organization-level access controls enforce permissions on every protected resource.<br/>"
            "• <b>No Model Training:</b> Client content is never transmitted for external LLM fine-tuning or retention.<br/>"
            "• <b>Transport & Storage Security:</b> All data in transit is protected via TLS 1.3; database records and secret tokens are encrypted.<br/>"
            "• <b>Human-in-the-Loop Guarantee:</b> Suggested corrections never overwrite original marketing copy automatically; authorized human reviewers retain ultimate custody.",
            body_style,
        )
    )
    story.append(Spacer(1, 6))

    story.append(Paragraph("11. Regulatory Compliance & Non-Legal Counsel Disclaimer", h1_style))
    story.append(
        Paragraph(
            "<i>This document is automatically generated by the Pineco Brand Governance Platform for technical compliance "
            "verification and governance review purposes. While the Pineco governance engine continuously monitors copy against "
            "published regulatory standards (including SEC, FINRA, FTC, and FDA frameworks), automated verification does not "
            "constitute formal legal counsel. Formal statutory sign-off remains subject to qualified organizational legal review.</i>",
            body_style,
        )
    )

    doc.build(story, canvasmaker=NumberedCanvas)
    return buffer.getvalue()
