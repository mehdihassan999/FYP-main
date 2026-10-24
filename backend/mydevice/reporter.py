# mydevice/report_generator.py

import traceback
from datetime import datetime

# PDF libraries
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4


def safe_text(s):
    """
    Ensures text is UTF-8 safe for PDF generation.
    """
    if s is None:
        return ""
    return str(s).encode("utf-8", errors="ignore").decode("utf-8")


def generate_report(system_info, vulnerabilities):
    """
    Creates a structured report object with detailed vulnerability data.
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
            sev = v.get("severity", "low").lower()
            status = v.get("status", "open")
            fixable = v.get("fixable", True)
            port = v.get("port")

            # Normalize severity
            if sev not in ["critical", "high", "medium", "low"]:
                sev = "low"

            # Count stats
            by_category[cat] = by_category.get(cat, 0) + 1
            by_severity[sev] = by_severity.get(sev, 0) + 1

            # Manual fix hints
            manual_fix = ""
            if not fixable:
                if port:
                    manual_fix = f"Check service on port {port}: sudo lsof -i :{port}"
                else:
                    manual_fix = "Requires manual resolution. Please review system configuration."

            # Expanded descriptions (can be extended with CVE mapping later)
            description = v.get("description", "No description available.")
            impact = v.get("impact", "This issue may weaken system security.")
            fix = manual_fix or v.get("fix", "Apply system/vendor recommended patch or configuration.")

            processed_issues.append({
                "id": v.get("id", f"issue_{len(processed_issues)+1}"),
                "title": v.get("title", "Unknown Issue"),
                "category": cat,
                "severity": sev,
                "status": status,
                "fixable": fixable,
                "port": port,
                "manual_fix": manual_fix,
                "description": description,
                "impact": impact,
                "fix": fix,
            })

        return {
            "total_issues": total,
            "fixed_issues": fixed,
            "open_issues": open_,
            "by_category": by_category,
            "by_severity": by_severity,
            "issues": processed_issues,
            "system_info": system_info or {},
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
            "system_info": system_info or {},
        }


def export_report_pdf(report_data, filename="security_report.pdf"):
    """
    Generates a detailed PDF file with vulnerabilities, descriptions, fixes, and system info.
    """
    try:
        styles = getSampleStyleSheet()
        styles.add(ParagraphStyle(name="Justify", alignment=4))  # justified text

        doc = SimpleDocTemplate(filename, pagesize=A4)
        story = []

        # Title
        story.append(Paragraph("🔒 CyberX Security Report", styles["Title"]))
        story.append(Spacer(1, 12))
        story.append(Paragraph(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles["Normal"]))
        story.append(Spacer(1, 20))

        # System Info
        story.append(Paragraph("System Information", styles["Heading2"]))
        sysinfo_table = [[safe_text(k), safe_text(v)] for k, v in (report_data.get("system_info") or {}).items()]
        if sysinfo_table:
            table = Table(sysinfo_table, colWidths=[200, 300])
            table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.black),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]))
            story.append(table)
        story.append(Spacer(1, 20))

        # Summary
        story.append(Paragraph("Summary", styles["Heading2"]))
        summary = [
            ["Total Issues", report_data["total_issues"]],
            ["Fixed Issues", report_data["fixed_issues"]],
            ["Open Issues", report_data["open_issues"]],
        ]
        table = Table(summary, colWidths=[200, 150])
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("GRID", (0, 0), (-1, -1), 1, colors.black),
        ]))
        story.append(table)
        story.append(PageBreak())

        # Vulnerabilities
        story.append(Paragraph("Vulnerabilities", styles["Heading2"]))
        for v in report_data["issues"]:
            story.append(Paragraph(f"▶ <b>{safe_text(v['title'])}</b>", styles["Heading3"]))
            story.append(Paragraph(f"<b>Severity:</b> {safe_text(v['severity']).upper()}", styles["Normal"]))
            story.append(Paragraph(f"<b>Category:</b> {safe_text(v['category'])}", styles["Normal"]))
            if v.get("port"):
                story.append(Paragraph(f"<b>Port:</b> {safe_text(v['port'])}", styles["Normal"]))
            story.append(Spacer(1, 4))

            story.append(Paragraph(f"<b>Description:</b> {safe_text(v['description'])}", styles["Justify"]))
            story.append(Paragraph(f"<b>Impact:</b> {safe_text(v['impact'])}", styles["Justify"]))
            story.append(Paragraph(f"<b>Fix:</b> {safe_text(v['fix'])}", styles["Justify"]))
            story.append(Spacer(1, 15))

        doc.build(story)
        return filename

    except Exception as e:
        print("[ERROR] PDF generation failed:", e)
        traceback.print_exc()
        return None
