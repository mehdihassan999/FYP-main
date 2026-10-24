# mydevice/report_generator.py
import traceback
import datetime
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os

# Register a Unicode-capable TTF font (DejaVu Sans is a good default)
# Ensure system has fonts-dejavu-core (Debian/Ubuntu). If not, instruct user to install.
FONT_NAME = "DejaVuSans"
FONT_PATHS = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",  # typical Linux path
    "/usr/local/share/fonts/DejaVuSans.ttf",
    # Add more paths if needed
]

def _register_font():
    for p in FONT_PATHS:
        if os.path.exists(p):
            try:
                pdfmetrics.registerFont(TTFont(FONT_NAME, p))
                return True
            except Exception:
                continue
    # If we couldn't find the font file, try to register without path (may already be available)
    try:
        pdfmetrics.registerFont(TTFont(FONT_NAME, FONT_NAME))
        return True
    except Exception:
        return False

# Try to register font at import time
_register_font()

def safe_text(s):
    """Return a unicode-safe string for PDF output. Avoid raising on strange types."""
    if s is None:
        return ""
    try:
        # convert to str, preserving unicode; replace unprintable characters
        return str(s)
    except Exception:
        return ""

def generate_report(system_info, vulnerabilities):
    """
    Create a structured report dict used by frontend and PDF generator.
    """
    try:
        total = len(vulnerabilities)
        fixed = len([v for v in vulnerabilities if v.get("status") == "fixed"])
        open_ = total - fixed

        by_category = {}
        by_severity = {}
        processed_issues = []

        for v in vulnerabilities:
            cat = v.get("category", "unknown")
            sev = str(v.get("severity", "low")).lower()
            status = v.get("status", "open")
            fixable = bool(v.get("fixable", False))
            port = v.get("port")

            if sev not in ["critical", "high", "medium", "low"]:
                sev = "low"

            by_category[cat] = by_category.get(cat, 0) + 1
            by_severity[sev] = by_severity.get(sev, 0) + 1

            manual_fix = ""
            if not fixable:
                if port:
                    manual_fix = f"Check service on port {port}: sudo lsof -i :{port}"
                else:
                    manual_fix = "Requires manual resolution. Please review system configuration."

            processed_issues.append({
                "id": v.get("id"),
                "title": v.get("title", "Unknown Issue"),
                "category": cat,
                "severity": sev,
                "status": status,
                "fixable": fixable,
                "port": port,
                "manual_fix": manual_fix,
                "description": v.get("description", "No description available."),
                "impact": v.get("impact", ""),
                "fix": v.get("fix", "")
            })

        return {
            "total_issues": total,
            "fixed_issues": fixed,
            "open_issues": open_,
            "by_category": by_category,
            "by_severity": by_severity,
            "issues": processed_issues,
            "system_info": system_info or {}
        }

    except Exception as e:
        print("[ERROR] Report generation failed:", e)
        traceback.print_exc()
        return {
            "total_issues": 0,
            "fixed_issues": 0,
            "open_issues": 0,
            "by_category": {},
            "by_severity": {},
            "issues": [],
            "system_info": system_info or {}
        }

def generate_pdf_report(system_info, vulnerabilities, filename=None):
    """
    High-level function used by app.py to generate the PDF file.
    Returns filepath (filename) if success, else None.
    """
    try:
        report_data = generate_report(system_info, vulnerabilities)
        # default filename if not provided
        if not filename:
            filename = f"cyberx_report_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"

        # Build PDF
        # Ensure font registered; if not, fallback to built-in and hope for the best
        font_available = _register_font()

        styles = getSampleStyleSheet()
        # Create a copy of Normal that uses our font if available
        normal_style = styles["Normal"]
        heading2 = styles["Heading2"]
        heading3 = styles["Heading3"]

        if font_available:
            # create styles that use DejaVuSans
            normal_style = ParagraphStyle(
                "CYBERXNormal",
                parent=styles["Normal"],
                fontName=FONT_NAME,
                fontSize=10,
                leading=12
            )
            heading2 = ParagraphStyle(
                "CYBERXH2",
                parent=styles["Heading2"],
                fontName=FONT_NAME,
                fontSize=14,
                leading=16
            )
            heading3 = ParagraphStyle(
                "CYBERXH3",
                parent=styles["Heading3"],
                fontName=FONT_NAME,
                fontSize=12,
                leading=14
            )

        doc = SimpleDocTemplate(filename, pagesize=A4, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
        story = []

        # Title
        story.append(Paragraph("CyberX Security Report", heading2))
        story.append(Spacer(1, 8))
        gen_line = f"Generated: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        story.append(Paragraph(gen_line, normal_style))
        story.append(Spacer(1, 12))

        # System info (pretty)
        story.append(Paragraph("System Information", heading2))
        system_info_dict = report_data.get("system_info", {})
        if not system_info_dict:
            story.append(Paragraph("No system information available.", normal_style))
        else:
            # show key: value lines
            for key, val in system_info_dict.items():
                story.append(Paragraph(f"<b>{safe_text(key)}</b>: {safe_text(val)}", normal_style))
        story.append(Spacer(1, 12))

        # Summary table
        story.append(Paragraph("Summary", heading2))
        summary_rows = [
            ["Total Issues", str(report_data.get("total_issues", 0))],
            ["Fixed Issues", str(report_data.get("fixed_issues", 0))],
            ["Open Issues", str(report_data.get("open_issues", 0))]
        ]
        table = Table(summary_rows, colWidths=[200, 200])
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
            ("ALIGN", (0, 0), (-1, -1), "LEFT"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ]))
        story.append(table)
        story.append(Spacer(1, 12))

        # Vulnerabilities detailed section
        story.append(Paragraph("Vulnerabilities", heading2))
        issues = report_data.get("issues", [])
        if not issues:
            story.append(Paragraph("✅ No vulnerabilities found.", normal_style))
        else:
            for idx, v in enumerate(issues, 1):
                story.append(Paragraph(f"{idx}. {safe_text(v.get('title'))}", heading3))
                story.append(Paragraph(f"<b>Severity:</b> {safe_text(v.get('severity'))}", normal_style))
                story.append(Paragraph(f"<b>Category:</b> {safe_text(v.get('category'))}", normal_style))
                story.append(Paragraph(f"<b>Status:</b> {safe_text(v.get('status'))}", normal_style))
                story.append(Paragraph(f"<b>Fixable:</b> {safe_text(v.get('fixable'))}", normal_style))
                if v.get("port"):
                    story.append(Paragraph(f"<b>Port:</b> {safe_text(v.get('port'))}", normal_style))
                # Description, impact, fix suggestion
                if v.get("description"):
                    story.append(Paragraph(f"<b>Description:</b> {safe_text(v.get('description'))}", normal_style))
                if v.get("impact"):
                    story.append(Paragraph(f"<b>Impact:</b> {safe_text(v.get('impact'))}", normal_style))
                # prefer explicit fix guidance from the issue if present
                if v.get("fix"):
                    story.append(Paragraph(f"<b>Suggested Fix:</b> {safe_text(v.get('fix'))}", normal_style))
                elif v.get("manual_fix"):
                    story.append(Paragraph(f"<b>Suggested Fix:</b> {safe_text(v.get('manual_fix'))}", normal_style))
                story.append(Spacer(1, 10))

                # break every N issues to ensure nicer pagination
                if idx % 10 == 0:
                    story.append(PageBreak())

        # Footer / end
        story.append(Spacer(1, 12))
        story.append(Paragraph("Generated by CyberX", normal_style))

        doc.build(story)
        return filename

    except Exception as e:
        print("[ERROR] PDF generation failed:", e)
        traceback.print_exc()
        return None
