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
    title_run = title_p.add_run("PINECO Enterprise Brand Governance")
    title_run.font.size = Pt(20)
    title_run.font.bold = True
    title_run.font.color.rgb = RGBColor(124, 58, 237)  # #7C3AED Purple

    sub_p = doc.add_paragraph()
    sub_run = sub_p.add_run(f"Compliance & Audit Report: {submission.title}")
    sub_run.font.size = Pt(14)
    sub_run.font.bold = True
    sub_run.font.color.rgb = RGBColor(0, 0, 0)

    # Metadata Paragraph
    meta_p = doc.add_paragraph()
    meta_p.add_run(f"Channel: {submission.channel.upper()}  |  ").bold = True
    meta_p.add_run(f"Status: {submission.status.upper()}  |  ").bold = True
    meta_p.add_run(f"Generated: {_format_date(datetime.datetime.now(datetime.timezone.utc))}  |  ")
    meta_p.add_run(f"Author: {submission.created_by}")
    meta_p.paragraph_format.space_after = Pt(14)

    # Divider
    hr_p = doc.add_paragraph()
    hr_p.paragraph_format.space_after = Pt(12)
    pBdr = parse_xml(r'<w:pBdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:bottom w:val="single" w:sz="8" w:space="1" w:color="7C3AED"/></w:pBdr>')
    hr_p._p.get_or_add_pPr().append(pBdr)

    # Executive Summary Heading
    h1 = doc.add_heading("1. Executive Summary & Scorecard", level=1)
    h1.runs[0].font.color.rgb = RGBColor(0, 0, 0)

    findings = getattr(review, "findings", []) or []
    high_count = sum(1 for f in findings if getattr(f, "severity", "") == "high")
    med_count = sum(1 for f in findings if getattr(f, "severity", "") == "medium")
    low_count = sum(1 for f in findings if getattr(f, "severity", "") == "low")

    summary_table = doc.add_table(rows=2, cols=4)
    summary_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    summary_table.autofit = False

    headers = ["Overall Status", "Total Findings", "High Severity", "Med / Low Issues"]
    values = [
        submission.status.upper().replace("_", " "),
        str(len(findings)),
        str(high_count),
        f"{med_count} / {low_count}",
    ]

    for col_idx, (hdr, val) in enumerate(zip(headers, values)):
        hdr_cell = summary_table.cell(0, col_idx)
        hdr_cell.text = hdr
        hdr_cell.paragraphs[0].runs[0].font.bold = True
        hdr_cell.paragraphs[0].runs[0].font.size = Pt(9)
        hdr_cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        shading = parse_xml(r'<w:shd xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" w:fill="F3F4F6"/>')
        hdr_cell._tc.get_or_add_tcPr().append(shading)

        val_cell = summary_table.cell(1, col_idx)
        val_cell.text = val
        val_run = val_cell.paragraphs[0].runs[0]
        val_run.font.bold = True
        val_run.font.size = Pt(12)
        if col_idx == 2 and high_count > 0:
            val_run.font.color.rgb = RGBColor(220, 38, 38)
        elif col_idx == 0:
            val_run.font.color.rgb = RGBColor(124, 58, 237)
        val_cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # Evaluated Copy
    h2 = doc.add_heading("2. Inspected Content Copy", level=1)
    h2.runs[0].font.color.rgb = RGBColor(0, 0, 0)

    ver_num = getattr(current_version, "version_number", 1) if current_version else 1
    content_hash = getattr(current_version, "content_hash", "N/A") if current_version else "N/A"
    doc.add_paragraph(f"Version: {ver_num}  |  SHA-256 Hash: {content_hash}").runs[0].font.size = Pt(9)

    copy_box = doc.add_table(rows=1, cols=1)
    copy_box.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = copy_box.cell(0, 0)
    copy_text = getattr(current_version, "content_text", "No content provided.") if current_version else "No content provided."
    cell.text = copy_text
    cell.paragraphs[0].runs[0].font.name = "Courier New"
    cell.paragraphs[0].runs[0].font.size = Pt(9.5)
    shd = parse_xml(r'<w:shd xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" w:fill="FAFAFA"/>')
    cell._tc.get_or_add_tcPr().append(shd)

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # Detailed Findings
    h3 = doc.add_heading(f"3. Compliance Findings ({len(findings)})", level=1)
    h3.runs[0].font.color.rgb = RGBColor(0, 0, 0)

    if not findings:
        doc.add_paragraph("No brand violations or compliance risks detected. Content is approved for publication.")
    else:
        findings_table = doc.add_table(rows=len(findings) + 1, cols=5)
        findings_table.alignment = WD_TABLE_ALIGNMENT.CENTER
        findings_table.autofit = True

        f_headers = ["Severity", "Category", "Excerpt", "Explanation & Rule", "Suggested Correction"]
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
            suggested = getattr(f, "suggested_correction", "") or "N/A"

            row_cells = findings_table.rows[r_idx].cells
            row_cells[0].text = severity
            row_cells[1].text = category
            row_cells[2].text = f'"{excerpt}"'
            row_cells[3].text = explanation
            row_cells[4].text = suggested

            # Set fonts
            for c in row_cells:
                if c.paragraphs and c.paragraphs[0].runs:
                    c.paragraphs[0].runs[0].font.size = Pt(8.5)

            if severity == "HIGH":
                row_cells[0].paragraphs[0].runs[0].font.bold = True
                row_cells[0].paragraphs[0].runs[0].font.color.rgb = RGBColor(220, 38, 38)
            elif severity == "MEDIUM":
                row_cells[0].paragraphs[0].runs[0].font.color.rgb = RGBColor(202, 138, 4)

    doc.add_paragraph().paragraph_format.space_after = Pt(14)

    # Audit Trail
    if audit_events:
        h4 = doc.add_heading("4. Immutable Governance Audit Trail", level=1)
        h4.runs[0].font.color.rgb = RGBColor(0, 0, 0)

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
# PPTX EXPORTER
# ==============================================================================

def generate_pptx_report(
    submission: Any,
    current_version: Any,
    review: Any,
    audit_events: Optional[List[Any]] = None,
) -> bytes:
    prs = Presentation()
    prs.slide_width = PptxInches(13.333)
    prs.slide_height = PptxInches(7.5)

    blank_layout = prs.slide_layouts[6]
    findings = getattr(review, "findings", []) or []
    high_count = sum(1 for f in findings if getattr(f, "severity", "") == "high")
    med_count = sum(1 for f in findings if getattr(f, "severity", "") == "medium")
    low_count = sum(1 for f in findings if getattr(f, "severity", "") == "low")

    # Helper to add brand top banner
    def add_slide_header(slide, title_text: str, subtitle_text: str = ""):
        # Top banner shape
        banner = slide.shapes.add_shape(
            MSO_SHAPE.RECTANGLE,
            PptxInches(0),
            PptxInches(0),
            PptxInches(13.333),
            PptxInches(1.1),
        )
        banner.fill.solid()
        banner.fill.fore_color.rgb = PptxRGBColor(17, 24, 39)  # Dark black/slate
        banner.line.color.rgb = PptxRGBColor(124, 58, 237)  # Purple bottom border
        banner.line.width = PptxPt(3)

        tf = banner.text_frame
        tf.word_wrap = True
        tf.vertical_anchor = MSO_ANCHOR.MIDDLE
        p = tf.paragraphs[0]
        p.alignment = PP_ALIGN.LEFT
        p.margin_left = PptxInches(0.6)
        run = p.add_run()
        run.text = title_text
        run.font.bold = True
        run.font.size = PptxPt(22)
        run.font.color.rgb = PptxRGBColor(255, 255, 255)

        if subtitle_text:
            p2 = tf.add_paragraph()
            p2.alignment = PP_ALIGN.LEFT
            p2.margin_left = PptxInches(0.6)
            run2 = p2.add_run()
            run2.text = subtitle_text
            run2.font.size = PptxPt(11)
            run2.font.color.rgb = PptxRGBColor(196, 181, 253)  # Soft purple

    # -------------------------------------------------------------
    # SLIDE 1: Title & Overview
    # -------------------------------------------------------------
    slide1 = prs.slides.add_slide(blank_layout)

    # Large purple accent backdrop bar
    bg_bar = slide1.shapes.add_shape(
        MSO_SHAPE.RECTANGLE,
        PptxInches(0.8),
        PptxInches(1.2),
        PptxInches(11.733),
        PptxInches(5.1),
    )
    bg_bar.fill.solid()
    bg_bar.fill.fore_color.rgb = PptxRGBColor(249, 250, 251)
    bg_bar.line.color.rgb = PptxRGBColor(229, 231, 235)

    # Purple accent badge
    badge = slide1.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE,
        PptxInches(1.2),
        PptxInches(1.6),
        PptxInches(3.4),
        PptxInches(0.45),
    )
    badge.fill.solid()
    badge.fill.fore_color.rgb = PptxRGBColor(124, 58, 237)
    badge.line.fill.background()
    badge_tf = badge.text_frame
    badge_tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    bp = badge_tf.paragraphs[0]
    bp.alignment = PP_ALIGN.CENTER
    brun = bp.add_run()
    brun.text = "PINECO GOVERNANCE ENGINE"
    brun.font.bold = True
    brun.font.size = PptxPt(11)
    brun.font.color.rgb = PptxRGBColor(255, 255, 255)

    # Title box
    tb = slide1.shapes.add_textbox(
        PptxInches(1.2),
        PptxInches(2.3),
        PptxInches(10.5),
        PptxInches(1.6),
    )
    tf1 = tb.text_frame
    tf1.word_wrap = True
    tp1 = tf1.paragraphs[0]
    trun1 = tp1.add_run()
    trun1.text = submission.title
    trun1.font.bold = True
    trun1.font.size = PptxPt(30)
    trun1.font.color.rgb = PptxRGBColor(17, 24, 39)

    tp2 = tf1.add_paragraph()
    trun2 = tp2.add_run()
    trun2.text = f"Compliance Audit & Multi-Stage Policy Verification Review"
    trun2.font.size = PptxPt(15)
    trun2.font.color.rgb = PptxRGBColor(107, 114, 128)

    # Info pills
    info_tb = slide1.shapes.add_textbox(
        PptxInches(1.2),
        PptxInches(4.2),
        PptxInches(10.5),
        PptxInches(1.6),
    )
    itf = info_tb.text_frame
    ip = itf.paragraphs[0]
    ip.text = f"Channel Scope: {submission.channel.upper()}   |   Status: {submission.status.upper().replace('_', ' ')}"
    ip.font.size = PptxPt(13)
    ip.font.bold = True
    ip.font.color.rgb = PptxRGBColor(124, 58, 237)

    ip2 = itf.add_paragraph()
    ip2.text = f"Audit Timestamp: {_format_date(datetime.datetime.now(datetime.timezone.utc))}   |   Auditor: {submission.created_by}"
    ip2.font.size = PptxPt(11)
    ip2.font.color.rgb = PptxRGBColor(75, 85, 99)

    # -------------------------------------------------------------
    # SLIDE 2: Executive Summary & Metric Cards
    # -------------------------------------------------------------
    slide2 = prs.slides.add_slide(blank_layout)
    add_slide_header(
        slide2,
        "Executive Summary & Compliance Scorecard",
        f"Automated evaluation across deterministic brand policies and verified company facts",
    )

    card_data = [
        ("COMPLIANCE STATUS", submission.status.upper().replace("_", " "), PptxRGBColor(124, 58, 237)),
        ("TOTAL FINDINGS", str(len(findings)), PptxRGBColor(17, 24, 39)),
        ("HIGH SEVERITY", str(high_count), PptxRGBColor(220, 38, 38) if high_count > 0 else PptxRGBColor(16, 185, 129)),
        ("MED / LOW ISSUES", f"{med_count} / {low_count}", PptxRGBColor(202, 138, 4)),
    ]

    for idx, (label, val, col) in enumerate(card_data):
        card_x = PptxInches(0.8 + idx * 2.95)
        card_box = slide2.shapes.add_shape(
            MSO_SHAPE.ROUNDED_RECTANGLE,
            card_x,
            PptxInches(1.6),
            PptxInches(2.8),
            PptxInches(1.8),
        )
        card_box.fill.solid()
        card_box.fill.fore_color.rgb = PptxRGBColor(249, 250, 251)
        card_box.line.color.rgb = PptxRGBColor(229, 231, 235)

        ctf = card_box.text_frame
        ctf.vertical_anchor = MSO_ANCHOR.MIDDLE
        cp1 = ctf.paragraphs[0]
        cp1.alignment = PP_ALIGN.CENTER
        crun1 = cp1.add_run()
        crun1.text = label
        crun1.font.size = PptxPt(9.5)
        crun1.font.bold = True
        crun1.font.color.rgb = PptxRGBColor(107, 114, 128)

        cp2 = ctf.add_paragraph()
        cp2.alignment = PP_ALIGN.CENTER
        crun2 = cp2.add_run()
        crun2.text = val
        crun2.font.size = PptxPt(22)
        crun2.font.bold = True
        crun2.font.color.rgb = col

    # Summary Narrative Box
    narrative_box = slide2.shapes.add_shape(
        MSO_SHAPE.RECTANGLE,
        PptxInches(0.8),
        PptxInches(3.8),
        PptxInches(11.733),
        PptxInches(2.9),
    )
    narrative_box.fill.solid()
    narrative_box.fill.fore_color.rgb = PptxRGBColor(255, 255, 255)
    narrative_box.line.color.rgb = PptxRGBColor(229, 231, 235)

    ntf = narrative_box.text_frame
    ntf.word_wrap = True
    np1 = ntf.paragraphs[0]
    np1.text = "Audit Evaluation Summary & Governance Findings"
    np1.font.size = PptxPt(14)
    np1.font.bold = True
    np1.font.color.rgb = PptxRGBColor(17, 24, 39)

    np2 = ntf.add_paragraph()
    if high_count > 0:
        np2.text = f"• CRITICAL ATTENTION: {high_count} high-severity policy violation(s) require remediation before publication."
        np2.font.color.rgb = PptxRGBColor(220, 38, 38)
    else:
        np2.text = "• All mandatory legal disclaimers and critical terminology requirements are satisfied."
        np2.font.color.rgb = PptxRGBColor(16, 185, 129)
    np2.font.size = PptxPt(11)

    np3 = ntf.add_paragraph()
    np3.text = f"• Verified against active brand rules, tone guidelines, and verified evidence statements in the corporate knowledge base."
    np3.font.size = PptxPt(11)
    np3.font.color.rgb = PptxRGBColor(75, 85, 99)

    np4 = ntf.add_paragraph()
    np4.text = f"• Governance Stage: Human reviewer sign-off required to finalize release for {submission.channel.upper()} distribution."
    np4.font.size = PptxPt(11)
    np4.font.color.rgb = PptxRGBColor(75, 85, 99)

    # -------------------------------------------------------------
    # SLIDE 3: Evaluated Copy
    # -------------------------------------------------------------
    slide3 = prs.slides.add_slide(blank_layout)
    add_slide_header(
        slide3,
        "Evaluated Content & Channel Scope",
        f"Version {getattr(current_version, 'version_number', 1)} | SHA-256: {getattr(current_version, 'content_hash', 'N/A')[:24]}...",
    )

    copy_shape = slide3.shapes.add_shape(
        MSO_SHAPE.RECTANGLE,
        PptxInches(0.8),
        PptxInches(1.5),
        PptxInches(11.733),
        PptxInches(5.2),
    )
    copy_shape.fill.solid()
    copy_shape.fill.fore_color.rgb = PptxRGBColor(249, 250, 251)
    copy_shape.line.color.rgb = PptxRGBColor(229, 231, 235)

    cstf = copy_shape.text_frame
    cstf.word_wrap = True
    cstf.margin_left = PptxInches(0.4)
    cstf.margin_top = PptxInches(0.4)
    cstf.margin_right = PptxInches(0.4)
    csp = cstf.paragraphs[0]
    copy_str = getattr(current_version, "content_text", "No content provided.") if current_version else "No content provided."
    csp.text = copy_str
    csp.font.size = PptxPt(12)
    csp.font.name = "Calibri"
    csp.font.color.rgb = PptxRGBColor(31, 41, 55)

    # -------------------------------------------------------------
    # SLIDE 4: Top Findings & Remediation Recommendations
    # -------------------------------------------------------------
    slide4 = prs.slides.add_slide(blank_layout)
    add_slide_header(
        slide4,
        f"Compliance Risk Breakdown & Remediation ({len(findings)} Findings)",
        "Specific policy clauses triggered and suggested replacements",
    )

    if not findings:
        nof_box = slide4.shapes.add_textbox(PptxInches(1), PptxInches(3), PptxInches(11), PptxInches(2))
        np = nof_box.text_frame.paragraphs[0]
        np.text = "Zero compliance violations detected. The draft copy fully adheres to all brand policies."
        np.font.size = PptxPt(16)
        np.font.color.rgb = PptxRGBColor(16, 185, 129)
    else:
        # Create table with top findings (up to 4 to fit slide cleanly)
        shown_findings = findings[:4]
        rows = len(shown_findings) + 1
        cols = 4
        table_shape = slide4.shapes.add_table(
            rows,
            cols,
            PptxInches(0.8),
            PptxInches(1.5),
            PptxInches(11.733),
            PptxInches(5.0),
        )
        table = table_shape.table
        table.columns[0].width = PptxInches(1.5)  # Severity
        table.columns[1].width = PptxInches(2.5)  # Excerpt
        table.columns[2].width = PptxInches(4.5)  # Explanation
        table.columns[3].width = PptxInches(3.233)  # Suggested

        h_titles = ["Severity", "Triggered Excerpt", "Policy Violation", "Suggested Correction"]
        for c_idx, h_title in enumerate(h_titles):
            cell = table.cell(0, c_idx)
            cell.fill.solid()
            cell.fill.fore_color.rgb = PptxRGBColor(124, 58, 237)
            cell.text_frame.word_wrap = True
            p = cell.text_frame.paragraphs[0]
            p.text = h_title
            p.font.bold = True
            p.font.size = PptxPt(11)
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
            p1.font.color.rgb = PptxRGBColor(17, 24, 39)

            c2 = table.cell(r_idx, 2)
            c2.text_frame.word_wrap = True
            p2 = c2.text_frame.paragraphs[0]
            p2.text = exp
            p2.font.size = PptxPt(9.5)
            p2.font.color.rgb = PptxRGBColor(75, 85, 99)

            c3 = table.cell(r_idx, 3)
            c3.text_frame.word_wrap = True
            p3 = c3.text_frame.paragraphs[0]
            p3.text = sug
            p3.font.size = PptxPt(9.5)
            p3.font.color.rgb = PptxRGBColor(124, 58, 237)

    bio = io.BytesIO()
    prs.save(bio)
    return bio.getvalue()


# ==============================================================================
# PDF EXPORTER
# ==============================================================================

def generate_pdf_report(
    submission: Any,
    current_version: Any,
    review: Any,
    audit_events: Optional[List[Any]] = None,
) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36,
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "BrandTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#7C3AED"),
        spaceAfter=4,
    )

    subtitle_style = ParagraphStyle(
        "BrandSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=16,
        textColor=colors.HexColor("#000000"),
        spaceAfter=6,
    )

    meta_style = ParagraphStyle(
        "MetaText",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#4B5563"),
        spaceAfter=10,
    )

    h2_style = ParagraphStyle(
        "SectionHeader",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=15,
        textColor=colors.HexColor("#000000"),
        spaceBefore=10,
        spaceAfter=6,
    )

    body_style = ParagraphStyle(
        "BodyTextCustom",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#1F2937"),
    )

    code_style = ParagraphStyle(
        "CodeCopy",
        parent=styles["Normal"],
        fontName="Courier",
        fontSize=8,
        leading=10.5,
        textColor=colors.HexColor("#111827"),
    )

    story = []

    # Title & Header
    story.append(Paragraph("PINECO ENTERPRISE BRAND GOVERNANCE", title_style))
    story.append(Paragraph(f"Compliance Audit Report: {submission.title}", subtitle_style))
    meta_line = (
        f"<b>Channel:</b> {submission.channel.upper()} &nbsp;&nbsp;|&nbsp;&nbsp; "
        f"<b>Status:</b> {submission.status.upper()} &nbsp;&nbsp;|&nbsp;&nbsp; "
        f"<b>Date:</b> {_format_date(datetime.datetime.now(datetime.timezone.utc))} &nbsp;&nbsp;|&nbsp;&nbsp; "
        f"<b>Author:</b> {submission.created_by}"
    )
    story.append(Paragraph(meta_line, meta_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#7C3AED"), spaceAfter=10))

    # Executive Summary Card
    story.append(Paragraph("1. Executive Summary & Scorecard", h2_style))
    findings = getattr(review, "findings", []) or []
    high_count = sum(1 for f in findings if getattr(f, "severity", "") == "high")
    med_count = sum(1 for f in findings if getattr(f, "severity", "") == "medium")
    low_count = sum(1 for f in findings if getattr(f, "severity", "") == "low")

    scorecard_data = [
        [
            Paragraph("<b>Overall Status</b>", body_style),
            Paragraph("<b>Total Findings</b>", body_style),
            Paragraph("<b>High Severity</b>", body_style),
            Paragraph("<b>Medium / Low</b>", body_style),
        ],
        [
            Paragraph(f"<font color='#7C3AED'><b>{submission.status.upper()}</b></font>", body_style),
            Paragraph(f"<b>{len(findings)}</b>", body_style),
            Paragraph(f"<font color='{'#DC2626' if high_count > 0 else '#16A34A'}'><b>{high_count}</b></font>", body_style),
            Paragraph(f"<b>{med_count} / {low_count}</b>", body_style),
        ],
    ]
    scorecard_table = Table(scorecard_data, colWidths=[135, 135, 135, 135])
    scorecard_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F3F4F6")),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E5E7EB")),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ])
    )
    story.append(scorecard_table)
    story.append(Spacer(1, 10))

    # Inspected Copy
    story.append(Paragraph("2. Inspected Content Copy", h2_style))
    ver_num = getattr(current_version, "version_number", 1) if current_version else 1
    content_hash = getattr(current_version, "content_hash", "N/A") if current_version else "N/A"
    story.append(
        Paragraph(
            f"<i>Version: {ver_num} &nbsp;|&nbsp; Content Hash (SHA-256): {content_hash}</i>",
            meta_style,
        )
    )

    copy_text = getattr(current_version, "content_text", "No content provided.") if current_version else "No content provided."
    # Wrap in single-cell table for neat border
    copy_table = Table([[Paragraph(copy_text.replace("\n", "<br/>"), code_style)]], colWidths=[540])
    copy_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F9FAFB")),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#D1D5DB")),
            ("TOPPADDING", (0, 0), (-1, -1), 7),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ])
    )
    story.append(copy_table)
    story.append(Spacer(1, 10))

    # Findings Table
    story.append(Paragraph(f"3. Compliance Findings ({len(findings)})", h2_style))
    if not findings:
        story.append(
            Paragraph(
                "<font color='#16A34A'><b>No violations found. Content is fully compliant with brand rules.</b></font>",
                body_style,
            )
        )
    else:
        findings_data = [
            [
                Paragraph("<b>Severity</b>", body_style),
                Paragraph("<b>Category</b>", body_style),
                Paragraph("<b>Excerpt</b>", body_style),
                Paragraph("<b>Violation Explanation</b>", body_style),
                Paragraph("<b>Correction</b>", body_style),
            ]
        ]
        for f in findings:
            sev = getattr(f, "severity", "medium").upper()
            cat = getattr(f, "category", "general").capitalize()
            exc = getattr(f, "excerpt", "")
            exp = getattr(f, "explanation", "")
            sug = getattr(f, "suggested_correction", "") or "N/A"

            sev_color = "#DC2626" if sev == "HIGH" else ("#CA8A04" if sev == "MEDIUM" else "#2563EB")
            findings_data.append([
                Paragraph(f"<font color='{sev_color}'><b>{sev}</b></font>", body_style),
                Paragraph(cat, body_style),
                Paragraph(f"<i>'{exc}'</i>", body_style),
                Paragraph(exp, body_style),
                Paragraph(f"<font color='#7C3AED'>{sug}</font>", body_style),
            ])

        ftable = Table(findings_data, colWidths=[55, 65, 110, 180, 130])
        ftable.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F3F4F6")),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E5E7EB")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("LEFTPADDING", (0, 0), (-1, -1), 4),
                ("RIGHTPADDING", (0, 0), (-1, -1), 4),
            ])
        )
        story.append(ftable)

    story.append(Spacer(1, 10))

    # Audit Trail
    if audit_events:
        story.append(Paragraph("4. Immutable Governance Audit Trail", h2_style))
        audit_data = [
            [
                Paragraph("<b>Timestamp</b>", body_style),
                Paragraph("<b>Actor</b>", body_style),
                Paragraph("<b>Event Type</b>", body_style),
                Paragraph("<b>Entity Target</b>", body_style),
            ]
        ]
        for ev in audit_events:
            audit_data.append([
                Paragraph(_format_date(getattr(ev, "created_at", None)), body_style),
                Paragraph(getattr(ev, "actor_id", "system"), body_style),
                Paragraph(getattr(ev, "event_type", "action"), body_style),
                Paragraph(f"{getattr(ev, 'entity_type', '')}:{getattr(ev, 'entity_id', '')[:8]}", body_style),
            ])

        atable = Table(audit_data, colWidths=[140, 120, 140, 140])
        atable.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F3F4F6")),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E5E7EB")),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ])
        )
        story.append(atable)

    doc.build(story)
    return buffer.getvalue()
